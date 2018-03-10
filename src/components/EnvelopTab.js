import React from 'react'
import styled from 'styled-components'
import { WebView, View, Text } from 'react-native'
import TreeView from './TreeView';
import { decodeFromXdr } from './../utils/xdrParser';

const Container = styled.View`
  flex: 1;
`
// Because the current blockchain sdk doesn't support react native 
// we had to create a alternative way to decode the xdr locally to 
// the user approve the transaction. The XDR must be decoded always 
// on the devide before approved. This will avoid hackers to change 
// the xdr before the user approve it

// Inject the XDR to the static xdr-viewer html
export default ({ xdr }) => {
  if (xdr) {
    return (
      <Container>
        <TreeView nodes={xdr}></TreeView>
      </Container>
    );
  }
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'}}>
      <Text>Transaction not signed!</Text>
    </View>
  )
}