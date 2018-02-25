
import Realm from "realm";

class Transaction {
  // setStatus(status) {
  //   this.status = status;
  // }

  // sendMessage(message) {
  //   console.log(message);
  // }
}

// amount
// :
// "10"
// asset
// :
// "[assetTypeNative]"
// destination
// :
// "GCX6JMYXUCZDDGW2OAFCGHLGC2VBZXJFSW7DUIR5OLDLBVGZPAIZGDST"
// fee
// :
// "100"
// memo
// :
// "[memoNone]"
// operations
// :
// "Array[1]"
// seqNum
// :
// "31217630488559618"
// signatures
// :
// "Array[0]"
// sourceAccount
// :
// "GBJACKMHHDWPM2NDDRMOIBZFWXPUQ2IQBV42U5ZFV6CWMD27K3KIDO2H"

const TransactionSchema = {
  name: "Transaction",
  primaryKey: "id",
  properties: {
    id: "string",
    xdr: "string",
    signedXdr: { type: "string", optional: true },
    decodedXdr: { type: "string", optional: true },
    sourceAccount: { type: "string", optional: true },
    fee: { type: "string", optional: true },
    seqNum: { type: "string", optional: true },
    time: { type: "string", optional: true },
    memo: { type: "string", optional: true },
    destination: { type: "string", optional: true },
    asset: { type: "string", optional: true },
    amount: { type: "string", optional: true },
    status: { type: "string", optional: true },
    message: { type: "string", optional: true },
    type: { type: "string", optional: true },
    createdAt: "date"
  }
};

Transaction.schema = TransactionSchema;

export default new Realm({
  schema: [Transaction],
  schemaVersion: 8
});