import React from 'react'
import styled from 'styled-components/native'
import { Text } from 'react-native'
import EnvelopCard from './../shared/EnvelopeCard';
const Container = styled.View`
  flex: 1;
`
export default ({ tx }) => (
  <Container>
    <EnvelopCard tx={tx}></EnvelopCard>
  </Container>
)