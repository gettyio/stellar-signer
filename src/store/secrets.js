import Realm from "realm";

class Secret {
}

const SecretSchema = {
  name: "Secret",
  primaryKey: "id",
  properties: {
		id: "string",
		sk: "string", 
		alias: "string",
    createdAt: "date"
  }
};

Secret.schema = SecretSchema;

export default (key) => {
	return new Realm({
		path: 'secrets____.realm',
		schema: [Secret],
		schemaVersion: 12,
		encryptionKey: key
	});
}