
import Realm from "realm";

class Transaction {
  // setStatus(status) {
  //   this.status = status;
  // }

  // sendMessage(message) {
  //   console.log(message);
  // }
}

const TransactionSchema = {
  name: "Transaction",
  primaryKey: "id",
  properties: {
    id: "string",
    xdr: "string",
    signedXdr: { type: "string", optional: true },
    decodedXdr: { type: "string", optional: true },
    source: { type: "string", optional: true },
    fee: { type: "string", optional: true },
    seq: { type: "string", optional: true },
    time: { type: "string", optional: true },
    memo: { type: "string", optional: true },
    dest: { type: "string", optional: true },
    asset: { type: "string", optional: true },
    amount: { type: "string", optional: true },
    createdAt: "date"
  }
};

Transaction.schema = TransactionSchema;

export default new Realm({
  schema: [Transaction],
  schemaVersion: 5
});