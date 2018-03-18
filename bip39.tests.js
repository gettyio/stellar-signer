const bip39 = require('bip39');
const StellarSdk = require('stellar-sdk');
const { derivePath, getMasterKeyFromSeed, getPublicKey } = require('ed25519-hd-key')

var mnemonic = 'cram spatial open baby sell shoe orphan suit practice emerge very climb';//bip39.generateMnemonic();

const seedHex = bip39.mnemonicToSeedHex(mnemonic, '12345678');
const userPath = 0;
const data = derivePath(`m/44'/148'/${userPath}'`, seedHex)
const keypair = StellarSdk.Keypair.fromRawEd25519Seed(data.key);

const pk = keypair.publicKey();
const sk = keypair.secret();

console.log('pk ',pk)
console.log('sk ',sk)