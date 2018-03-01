import React from 'react'
import styled from 'styled-components/native'
import { WebView, View, Text } from 'react-native'

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
        <WebView 
          source={require(`./../webviews/xdrviewer/index.html`)}
          injectedJavaScript={`window.xdr = "${xdr}";`}
          javaScriptEnabled={true}
        />
      </Container>
    );
  }
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Transaction not signed!</Text>
    </View>
  )
}