import React from 'react'
import styled from 'styled-components'
import { Text } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'

import { Container, CardFlex, CardRow, CardLabel, CardTitle, EnvelopCard } from './utils'

export default ({ tx }) => (
  <Container>
    <CardFlex>
      <CardRow>
        <Icon name="x-circle" color="red" size={32} />
        <CardTitle>Error</CardTitle>
      </CardRow>
      <CardRow flexx="column" align="flex-start">
        <CardLabel>{tx.message}</CardLabel>
        <CardLabel>{`XDR: ${tx.xdr}`}</CardLabel>
      </CardRow>
    </CardFlex>
  </Container>
)
