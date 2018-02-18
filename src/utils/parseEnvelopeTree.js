const _ = require('lodash');
const walk = require('tree-walk');

// Lodash Get raw
// const id = uuid();
// const xdr = tx.xdr;
// const decodedXdr = tx.decodedXdr;
// const source = _.get(tx[0], 'nodes[0].nodes[0].nodes[0].value.value'); //source
// const fee = _.get(tx[0], 'nodes[0].nodes[1].value'); //fee
// const seq = _.get(tx[0], 'nodes[0].nodes[2].value'); //seqNum
// const time = _.get(tx[0], 'nodes[0].nodes[3].value'); //timeBounds
// const memo = _.get(tx[0], 'nodes[0].nodes[4].value'); //memo
// const dest = _.get(tx[0], 'nodes[0].nodes[5].nodes[0].nodes[1].nodes[0].nodes[0].nodes[0].value.value'); //dest
// const asset = _.get(tx[0], 'nodes[0].nodes[5].nodes[0].nodes[1].nodes[0].nodes[1].value'); //asset
// const amount = _.get(tx[0], 'nodes[0].nodes[5].nodes[0].nodes[1].nodes[0].nodes[2].value.value.parsed'); //amount
// const createdAt = new Date();

export default (data) => {
  let values = [];
  data.forEach((node) => {
    walk.preorder(data[0], (value, key, parent) => {  
      if (key === 'value') {
          if (!_.includes(['ed25519','code','body'], parent.type)) {
            const newValue = {}
            if (parent.type === 'sourceAccount' || parent.type === 'destination' ) {
              newValue[parent.type] = _.get(parent, 'nodes[0].value.value')
              values.push(newValue)
            } else if (parent.type === 'amount') {
              const amount = _.get(parent, 'value.parsed');
               if (amount) {
                  newValue[parent.type] = amount;
                  values.push(newValue);
               }
            } else {
              newValue[parent.type] = value
              values.push(newValue)        
            }
          }
      }
    })
  })
  
  let results = _.reduce(values, function(res, node) {
    const key = _.keys(node)[0];
    const val = _.values(node)[0];
    res[key] = val;
    return res;
  }, {});
  return results;
}