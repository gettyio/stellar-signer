
import Realm from "realm";

class Salt {}

Salt.schema = {
  name: 'Salt',
  primaryKey: 'id',
  properties: {
    id: 'string',
    value: 'string'
  }
}

class Transaction {}

Transaction.schema = {
  name: "Transaction",
  primaryKey: "id",
  properties: {
    id: "string",
    xdr: "string",
    sxdr: { type: "string", optional: true },
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
}

export default new Realm({
	path: 'transactions.realm',
  schema: [Transaction, Salt],
  schemaVersion: 10
});