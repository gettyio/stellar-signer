import React from 'react'
import styled from 'styled-components/native'
import { Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

import EnvelopCard from './../../shared/EnvelopeCard';
import { Container, Card, CardRow, CardLabel, CardTitle } from './../../shared';

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