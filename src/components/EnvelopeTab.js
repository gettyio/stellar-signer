import React from 'react'
import styled from 'styled-components'
import { WebView, View, Text, ScrollView} from 'react-native'
import TreeView from './TreeView';
import { decodeFromXdr } from './../utils/xdrUtils';

const Container = styled.View`
  flex: 1;
	background-color: white;
	padding-bottom: 128px;
`
export default ({ tx }) => {
  if (tx) {
		const decoded = decodeFromXdr(tx, 'TransactionEnvelope');
    return (
			<Container>
				<TreeView nodes={decoded.tx}></TreeView>
			</Container>
    );
	}
	
  return (
    <Container style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text>Transaction not signed!</Text>
    </Container>
  )
}