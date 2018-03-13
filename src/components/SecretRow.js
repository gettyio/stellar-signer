import React, { Component } from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import moment from 'moment'
import styled from 'styled-components'

export const Row = styled.View`
  padding: 16px;
  border-bottom-width: 0.3px;
  border-color: #d3d3d3;
`

export const AliasLabel = styled.Text`
  font-size: 16px;
  color: #333;
  font-weight: 700;
  align-self: center;
`

export const SKLabel = styled.Text`
  font-size: 16px;
  letter-spacing: 3px;
  color: #333;
  font-weight: 700;
  margin-top: 16px;
  align-self: center;
`

export const DateLabel = styled.Text`
  font-size: 12px;
  margin-top: 8px;
  color: #555;
  align-self: center;
`

const SecretRow = ({ item, appStore, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Row>
        <AliasLabel>{`${item.alias}`}</AliasLabel>
        <SKLabel>{`${item.sk}`}</SKLabel>
        <DateLabel>
					{moment(item.createdAt, 'YYYYMMDD hh:mm:ss').fromNow()}
        </DateLabel>
      </Row>
    </TouchableOpacity>
  )
}

export default SecretRow
