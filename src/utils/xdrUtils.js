import _ from 'lodash';
import StellarSdk, { xdr, StrKey, Keypair, Operation } from 'stellar-sdk';


StellarSdk.Network.useTestNetwork();

export function signXdr(ctx) {
  try {
    // 1. Decode XDR received from RN
    var transaction = new StellarSdk.Transaction(ctx.xdr);

    // 2. Sign the transaction XDR with secret key
    transaction.sign(StellarSdk.Keypair.fromSecret(ctx.sk));

    // 3. Convert back the tx to XDR
    var signedXDR = transaction.toEnvelope().toXDR('base64');
    // 4. Send the signed XDR to be submited by RN
    return { type: ctx.type, xdr: signedXDR, lastXdr: ctx.xdr };
  } catch (error) {
    return { type: 'error', message: error.message, xdr: ctx.xdr }
  }
}

export function decodeFromXdr(input, type) {
  // TODO: Check to see if type exists
  // TODO: input validation
  try {
    const tree = extrapolateFromXdr(input, 'TransactionEnvelope');
    return { tx: tree, xdr: input };
  } catch (error) {
    //postMessage(JSON.stringify({ type: 'error', message: 'Input XDR could not be parsed', xdr: input }));
    return { type: 'error', message: error.message, xdr: input };
  }
}


function decodeXdr(xdr) {
  var decodedXdr = StellarSdk.xdr.TransactionEnvelope.fromXDR(signedXDR, 'base64');
  //postMessage(decodedXdr);  
}


export default function extrapolateFromXdr(input, type) {
  // TODO: Check to see if type exists
  // TODO: input validation

  let xdrObject;
  try {
    xdrObject = xdr[type].fromXDR(input, 'base64');
  } catch (error) {
    throw new Error('Input XDR could not be parsed');
  }

  let tree = [{}];
  buildTreeFromObject(xdrObject, tree[0], type);
  return tree;
}

function buildTreeFromObject(object, anchor, name) {
  anchor.type = name;

  if (_.isArray(object)) {
    parseArray(anchor, object);
  } else if (!hasChildren(object)) {
    anchor.value = getValue(object, name);
  } else if (object.switch) {
    parseArm(anchor, object)
  } else {
    parseNormal(anchor, object)
  }
}

function parseArray(anchor, object) {
  anchor.value = `Array[${object.length}]`;
  anchor.nodes = [];
  for (var i = 0; i < object.length; i++) {
    anchor.nodes.push({});
    buildTreeFromObject(object[i], anchor.nodes[anchor.nodes.length - 1], '[' + i + ']');
  }
}

function parseArm(anchor, object) {
  anchor.value = '[' + object.switch().name + ']';
  if (_.isString(object.arm())) {
    anchor.nodes = [{}];
    buildTreeFromObject(object[object.arm()](), anchor.nodes[anchor.nodes.length - 1], object.arm());
  }
}

function parseNormal(anchor, object) {
  anchor.nodes = [];
  _(object).functions().without('toXDR', 'ext').value().forEach(function (name) {
    anchor.nodes.push({});
    buildTreeFromObject(object[name](), anchor.nodes[anchor.nodes.length - 1], name);
  });
}

function hasChildren(object) {
  // string
  if (_.isString(object)) {
    return false;
  }
  // node buffer
  if (object && object._isBuffer) {
    return false;
  }
  var functions = _(object).functions();
  if (functions.value().length == 0) {
    return false;
  }
  // int64
  if (functions.include('getLowBits') && functions.include('getHighBits')) {
    return false;
  }
  return true;
}

const amountFields = ['amount', 'startingBalance', 'sendMax', 'destAmount', 'limit'];

function getValue(object, name) {
  if (_.includes(amountFields, name)) {
    return {
      type: 'amount',
      value: {
        parsed: Operation._fromXDRAmount(object),
        raw: object.toString()
      }
    };
  }

  if (name === 'hint') {
    // strkey encoding is using base32 encoding. Encoded public key consists of:
    //
    //  * 1 byte version byte (0x30 encoded as `G`)
    //  * 32 bytes public key
    //  * 2 bytes checksum
    //
    // Because base32 symbols are 5-bit, more than one symbol is needed to represent a single byte.
    // Signature Hint is the last 4 bytes of the public key. So we need to try to show as many 5-bit
    // chunks as possible included between bytes 30 and 33 (included).
    //
    // byte 1: ##### ###
    // byte 2:          ## ##### #
    // byte 3:                    #### ####
    // byte 4:                             # ##### ##
    // byte 5:                                       ### #####  <---------- 40 bits / full alignment
    // byte 6:                                                ##### ###
    // byte 7:                                                         ## ##### #
    //
    // .....
    //
    // byte 26: ##### ###
    // byte 27:          ## ##### #
    // byte 28:                    #### ####                    full b32 symbols
    // byte 29:                             # ##### ##    |--------------------------|
    // byte 30:                                       ### 48###                      |
    // byte 31:                  Signature Hint start |        49### 50#             |    Signature Hint end
    // byte 32:                                                         ## 51### 5   |    |
    // byte 33:                                                                   2### 53##
    // byte 34:                                                                            # 54### 55
    // byte 35:                                                                                      ### 56###
    //
    let hintBytes = new Buffer(object, 'base64');
    let partialPublicKey = Buffer.concat([new Buffer(28).fill(0), hintBytes]);
    let keypair = new Keypair({ type: 'ed25519', publicKey: partialPublicKey });
    let partialPublicKeyString =
      'G' +
      (new Buffer(46).fill('_').toString()) +
      keypair.publicKey().substr(47, 5) +
      (new Buffer(4).fill('_').toString());
    return { type: 'code', value: partialPublicKeyString };
  }

  if (name === 'ed25519') {
    var address = StrKey.encodeEd25519PublicKey(object);
    return { type: 'code', value: address };
  }

  if (name === 'assetCode' || name === 'assetCode4' || name === 'assetCode12') {
    return object.toString();
  }

  if (object && object._isBuffer) {
    return { type: 'code', value: new Buffer(object).toString('base64') };
  }

  if (typeof object === 'undefined') {
    return;
  }

  // getValue is a leaf in the recursive xdr extrapolating function meaning that
  // whatever this function returns will be in the final result as-is.
  // Therefore, we want them in string format so that it displayable in React.
  // One example of why we need this is that UnsignedHyper values won't get
  // displayed unless we convert it to a string.
  if (typeof object.toString === 'function') {
    return object.toString();
  }

  throw new Error('Internal laboratory bug: Encountered value type in XDR viewer that does not have a toString method');
}