import Realm from "realm";

class Secret {
}

const SecretSchema = {
  name: "Secret",
  primaryKey: "alias",
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
		path: 'secrets_____________.realm',
		schema: [Secret],
		schemaVersion: 13,
		encryptionKey: key
	});
}