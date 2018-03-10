// TreeView is a recursive tree view
// It takes data from extrapolateFromXdr and formats it in a more user friendly way

import React from 'react';
import _ from 'lodash';
import { View, Text } from 'react-native'

//import './TreeView.css';

// @param {array} props.nodes - Array of TreeView compatible nodes
export default class TreeView extends React.Component {
  render() {
    let {nodes, className} = this.props;
    let rootClass = 'TreeView ' + (className) ? className : '';

    let result = <View className={rootClass}>
      {_.map(Array.prototype.slice.call(nodes), (node, index) => {
        let childNodes;

        if (typeof node.nodes !== 'undefined') {
          childNodes = <View className="TreeView__child">
            <TreeView nodes={node.nodes} />
          </View>;
        }

        return <View className="TreeView__set" key={index}>
          <View className="TreeView__row" key={index + node.type}>
            <RowValue node={node} />
          </View>
          {childNodes}
        </View>
      })}
    </View>;

    return result;
  }
}

function RowValue(props) {
  let value, childNodes, separatorNeeded, separator;
  let {node} = props;

  if (typeof node.value === 'string') {
    value = String(node.value);
    separatorNeeded = true;
  } else if (typeof node.value !== 'undefined' && _.has(node.value, 'type')) {
    value = convertTypedValue(node.value);
    separatorNeeded = true;
  } else {
    if (typeof node.nodes !== 'undefined') {
      value = '';
    } else {
      value = <Text>none</Text>;
      separatorNeeded = true;
    }
  }
  if (separatorNeeded) {
    separator = ': ';
  }

  return <Text><Text>{node.type}</Text>{separator}{value}</Text>
}

// Types values are values that will be displayed with special formatting to
// provide for a more rich experience other than just plain text.
// "untyped" values are simply strings. They will be displayed as strings in the
// tree node.
function convertTypedValue({type, value}) {
  switch(type) {
  case 'code':
    return <code>{value}</code>;
  case 'amount':
    return <Text>{value.parsed} (raw: <Text>{value.raw}</Text>)</Text>;
  }
}