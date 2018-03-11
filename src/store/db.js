import RxDB from 'rxdb';

RxDB.plugin(require('pouchdb-adapter-asyncstorage').default);

export const schema = {
  title: 'Anonymous chat schema',
  description: 'Database schema for an anonymous chat',
  version: 0,
  type: 'object',
  properties: {
    xdr: { type: "string" },
    sxdr: { type: "string" },
    tree: { type: "string" },
    decodedXdr: { type: "string" },
    sourceAccount: { type: "string" },
    fee: { type: "string" },
    seqNum: { type: "string" },
    time: { type: "string" },
    memo: { type: "string" },
    destination: { type: "string" },
    asset: { type: "string" },
    amount: { type: "string" },
    status: { type: "string" },
    message: { type: "string" },
    type: { type: "string" },
    createdAt: "date"
  },
  required: []
}

export const createDb = async () => {
	const db = await RxDB.create({
		name: 'signer',
		adapter: 'asyncstorage',
		multiInstance: false,
	});

	const transactions = await db.collection({
		name: 'transactions',
		schema: schema,
	});
	
	return db;
}