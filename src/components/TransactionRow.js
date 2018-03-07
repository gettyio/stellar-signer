import React from 'react'
import { TouchableOpacity } from 'react-native'
import styled from 'styled-components'
import moment from 'moment'
import Icon from 'react-native-vector-icons/Feather'

import {
  Screen,
  Container,
  EmptyScreen,
  CardWrapper,
  CardContent,
  ErrorMessageLabel,
  ErrorInputValueLabel,
  TransactionRow,
  AmountCard,
  AmountLabel,
  LabelsRow,
  CreatedAtLabel,
  StatusLabel,
  AccountInfoCard,
  AccountLabel
} from './utils'

const toggleModal = (item, appStore) => {
  appStore.set('currentTransaction', item)
  appStore.set('isDetailModalVisible', !appStore.get('isDetailModalVisible'))
}

export default ({ item, appStore }) => {
  if (item.type === 'error') {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => toggleModal(item, appStore)}
      >
        <TransactionRow>
          <CardWrapper pad="8px">
            <Icon name="x-circle" color="red" size={32} />
            <CardContent>
              <ErrorMessageLabel>{`${item.message}`}</ErrorMessageLabel>
              <ErrorInputValueLabel>{`XDR: ${item.xdr}`}</ErrorInputValueLabel>
              <LabelsRow>
                <StatusLabel status={item.status}>{item.status}</StatusLabel>
                <CreatedAtLabel>
                  {moment(item.createdAt, 'YYYYMMDD hh:mm:ss').fromNow()}
                </CreatedAtLabel>
              </LabelsRow>
            </CardContent>
          </CardWrapper>
        </TransactionRow>
      </TouchableOpacity>
    )
  }

  let iconName
  let iconColor
  if (item.status === 'CREATED') {
    iconName = 'alert-circle'
    iconColor = 'blue'
  } else if (item.status === 'REJECTED') {
    iconName = 'stop-circle'
    iconColor = 'red'
  } else if (item.status === 'SIGNED') {
    iconName = 'check-circle'
    iconColor = '#3ED235'
  }

  return (
    <TouchableOpacity key={item.id} onPress={() => toggleModal(item, appStore)}>
      <TransactionRow>
        <CardWrapper pad="8px">
          <Icon name={iconName} color={iconColor} size={32} />
          <CardContent>
            <AmountCard>
              <AmountLabel>{`${item.amount} XLM`}</AmountLabel>
            </AmountCard>
            <LabelsRow>
              <AccountLabel>{`${item.memo}`}</AccountLabel>
            </LabelsRow>
            <LabelsRow>
              <StatusLabel status={item.status}>{item.status}</StatusLabel>
              <CreatedAtLabel>
                {moment(item.createdAt, 'YYYYMMDD hh:mm:ss').fromNow()}
              </CreatedAtLabel>
            </LabelsRow>
          </CardContent>
        </CardWrapper>
      </TransactionRow>
    </TouchableOpacity>
  )
}
