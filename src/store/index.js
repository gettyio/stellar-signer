
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
    id: "int",
    xdr: "string",
    signedXdr: { type: "string", optional: true },
    createdAt: "date"
  }
};

Transaction.schema = TransactionSchema;

export default new Realm({
  schema: [Transaction],
  schemaVersion: 2
});