import React from 'react'
import {
  TouchableOpacity
} from 'react-native';
import styled from 'styled-components/native'
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Screen, Container, EmptyScreen, CardWrapper, CardContent, ErrorMessageLabel, ErrorInputValueLabel, TransactionRow, AmountCard, AmountLabel, LabelsRow, CreatedAtLabel, StatusLabel, AccountInfoCard, AccountLabel } from './../../shared';

const toggleModal = (item, appStore) => {
  appStore.set('currentTransaction', item);
  appStore.set('isDetailModalVisible', !appStore.get('isDetailModalVisible'));
}

export default ({ item, appStore }) => {

  if (item.type === 'error') {
    return (
      <TouchableOpacity key={item.id} onPress={() => toggleModal(item, appStore)}>
        <TransactionRow>
          <CardWrapper pad="8px">
            <Icon name="times-circle" color="red" size={32}></Icon>
            <CardContent>
              <ErrorMessageLabel>{`${item.message}`}</ErrorMessageLabel>
              <ErrorInputValueLabel>{`XDR: ${item.xdr}`}</ErrorInputValueLabel>
              <LabelsRow>
                <StatusLabel status={item.status}>{item.status}</StatusLabel>
                <CreatedAtLabel>{moment(item.createdAt, "YYYYMMDD hh:mm:ss").fromNow()}</CreatedAtLabel>
              </LabelsRow>   
            </CardContent>
          </CardWrapper>
        </TransactionRow>
      </TouchableOpacity>
    )
  }
  
  return (
    <TouchableOpacity key={item.id} onPress={() => toggleModal(item, appStore)}>
      <TransactionRow>
        <CardWrapper pad="8px">
          <Icon name="check-circle" color="#3ED235" size={32}></Icon>
          <CardContent>
            <AmountCard>
              <AmountLabel>{`${item.amount} XLM`}</AmountLabel>
            </AmountCard>
            <LabelsRow>
              <AccountLabel>{`${item.memo}`}</AccountLabel>
            </LabelsRow>   
            <LabelsRow>
              <StatusLabel status={item.status}>{item.status}</StatusLabel>
              <CreatedAtLabel>{moment(item.createdAt, "YYYYMMDD hh:mm:ss").fromNow()}</CreatedAtLabel>
            </LabelsRow>                         
          </CardContent>
        </CardWrapper>
      </TransactionRow>
    </TouchableOpacity>
  )
}
