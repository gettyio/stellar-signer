import React from 'react'
import styled from 'styled-components/native'
import { Text } from 'react-native'
import moment from 'moment';
const Container = styled.View`
  flex: 1;
`
const EnvelopCard = styled.View`
  flex: 1;
  padding: 16px;
  background-color: blue;
`

const EnvelopCardLabel = styled.Text`
  font-size: 26px;
  font-weight: 700;
  color: white;
`
const EnvelopAmount = styled.View`
  align-items: flex-end;
`
const EnvelopDetail = styled.View`
  flex-direction: row;
  padding-top: 4px;
  padding-bottom: 4px;
`

const EnvelopInfo = styled.View`
  flex: 1;
  align-items: ${props => props.align ? props.align : 'flex-start'};
  justify-content: ${props => props.justify ? props.justify : 'flex-start'};
`

const EnvelopLabel = styled.Text`
  padding-top: 2px;
  font-size: ${props => props.fontSize ? props.fontSize : '12px'};
  color: white;
`

const StellarIcon = styled.Image`
`

export default ({ tx }) => (
  <Container>
    <EnvelopCard>
      <StellarIcon source={require('./stellar-rocket.png')} resizeMode="contain" style={{ width: 42, height: 42, position: 'absolute', marginTop: 8, marginLeft: 8 }} />
      <EnvelopAmount>
        <EnvelopCardLabel>{`${tx.amount} XLM`}</EnvelopCardLabel>
      </EnvelopAmount>
      <EnvelopDetail>
        <EnvelopInfo align="flex-start">
          <EnvelopLabel>From:</EnvelopLabel>
          <EnvelopLabel fontSize="10px">{tx.sourceAccount}</EnvelopLabel>
        </EnvelopInfo>
      </EnvelopDetail>      
      <EnvelopDetail>
        <EnvelopInfo align="flex-start">
          <EnvelopLabel>To:</EnvelopLabel>
          <EnvelopLabel fontSize="10px">{tx.destination}</EnvelopLabel>
        </EnvelopInfo>
      </EnvelopDetail>
      <EnvelopDetail>
        <EnvelopInfo>
          <EnvelopLabel>Memo:</EnvelopLabel>
          <EnvelopLabel>{tx.memo}</EnvelopLabel>
        </EnvelopInfo>
        <EnvelopInfo align="flex-end">
          <EnvelopLabel>Time:</EnvelopLabel>
          <EnvelopLabel>{moment(tx.createdAt).format('YYYY-MM-DD hh:mm:ss')}</EnvelopLabel>
        </EnvelopInfo>
      </EnvelopDetail>      
    </EnvelopCard>
  </Container>
)