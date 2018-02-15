import React, { PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  FlatList,
  WebView,
  Keyboard,
  Clipboard,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import { Container, TransactionRow, AmountCard, AmountLabel, LabelsRow, CreatedAtLabel, StatusLabel, AccountInfoCard, AccountLabel } from '../shared';
import realm from './../store';

class TransactionList extends PureComponent {

  state = {
    currentTx: undefined,
    hasError: undefined,
    isLoadingList: false,
  }

  renderRow = ({ item })=> {
    return (
      <TouchableOpacity key={item.id} onPress={() => {}}>
        <TransactionRow>
          <AmountCard>
            <AmountLabel>{`${11111} XLM`}</AmountLabel>
          </AmountCard>
          <LabelsRow>
            <CreatedAtLabel>{moment(item.createdAt, "YYYYMMDD hh:mm:ss").fromNow()}</CreatedAtLabel>
            <StatusLabel status={'CREATED'}>{'CREATED'}</StatusLabel>
          </LabelsRow>
          <AccountInfoCard>
            <AccountLabel>{`Hello`}</AccountLabel>
          </AccountInfoCard>          
        </TransactionRow>
      </TouchableOpacity>
    )
  }

  render() {
    const { isLoadingList, hasError } = this.state;
    const transactions = realm.objects('Transaction');
    if (isLoadingList) {
      return (
        <View style={{ flex: 1, marginTop: 64 }}>
          <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
        </View>
      );
    }

    if (hasError) {
      return (
        <View full={true} justify="center" align="center">
          <Text>Error</Text>
        </View>
      );
    }

    if (transactions.length < 1) {
      return (
        <View><Text>No record founds!</Text></View> 
      )
    }

    return (
      <Container>
        <FlatList
          data={transactions}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => `${item.id}`}
        />
      </Container>
    );
  }
}


export default TransactionList;
