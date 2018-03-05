import Realm from "realm";

class Salt {
}

const SaltSchema = {
  name: "Salt",
  primaryKey: "id",
  properties: {
		id: "string",
		value: "string"
  }
};

Salt.schema = SaltSchema;

export default new Realm({
	path: 'salt____.realm',
  schema: [Salt],
  schemaVersion: 10
});