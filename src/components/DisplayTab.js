import React from 'react'
import styled from 'styled-components'
import { Text } from 'react-native'

import EnvelopCard from './EnvelopCard'

const Container = styled.View`
  flex: 1;
`
export default ({ tx }) => (
  <Container>
    <EnvelopCard tx={tx} />
  </Container>
)
