import Realm from 'realm'

class Salt {}

Salt.schema = {
  name: 'Salt',
  primaryKey: 'id',
  properties: {
    id: 'string',
    value: 'string'
  }
}

export default new Realm({
  path: 'salt____.realm',
  schema: [Salt],
  schemaVersion: 10
})
