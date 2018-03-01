import React from 'react'
import styled from 'styled-components/native'
import { Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

import EnvelopCard from './../../shared/EnvelopeCard';

const Container = styled.View`
  justify-content: center;
  align-items: center;
`
const Card = styled.View`
  width: 95%;
  background-color: white;
  border-radius: 16px;
  padding: 16px;
`

const CardRow = styled.View`
  flex-direction: ${props => props.flexx ? props.flexx : "row"};
  align-items: ${props => props.align ? props.align : "center"};
`

const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  padding-left: 8px;
`

const CardLabel = styled.Text`
  font-size: 12px;
  padding-top: 8px;
`

export default ({ tx }) => (
  <Container>
    <Card>
      <CardRow>
        <Icon name="times-circle" color="red" size={32}></Icon>
        <CardTitle>Error</CardTitle>
      </CardRow>
      <CardRow flexx="column" align="flex-start">
        <CardLabel>{tx.message}</CardLabel>
        <CardLabel>{`XDR: ${tx.xdr}`}</CardLabel>
      </CardRow>
    </Card>
  </Container>
)