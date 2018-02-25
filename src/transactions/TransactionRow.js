import React from 'react'
import {
  TouchableOpacity
} from 'react-native';
import styled from 'styled-components/native'
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Screen, Container, EmptyScreen, CardWrapper, CardContent, ErrorMessageLabel, ErrorInputValueLabel, TransactionRow, AmountCard, AmountLabel, LabelsRow, CreatedAtLabel, StatusLabel, AccountInfoCard, AccountLabel } from '../shared';

export default ({ item }) => {

  if (item.type === 'error') {
    return (
    <TransactionRow>
      <CardWrapper>
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
    )
  }
  
  return (
    <TouchableOpacity key={item.id} onPress={() => {}}>
      <TransactionRow>
        <CardWrapper>
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
