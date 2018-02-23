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
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import { Screen, Container, EmptyScreen, TransactionRow, AmountCard, AmountLabel, LabelsRow, CreatedAtLabel, StatusLabel, AccountInfoCard, AccountLabel } from '../shared';
import realm from './../store/realm';

class TransactionList extends PureComponent {

  state = {
    transactions: [],
    currentTx: undefined,
    hasError: undefined,
    isLoadingList: false,
  }

  componentDidMount() {
    realm.addListener('change', this.refreshList);
    this.refreshList();
  }

  refreshList = ()=> {
    const transactions = realm.objects('Transaction');
    this.setState({ transactions });
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
    const { isLoadingList, hasError, transactions } = this.state;
    
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
        <EmptyScreen>
          <Image 
            source={require('./../shared/empty.png')} 
            resizeMode="contain" 
            style={{ width: 170 }}  
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>No Transactions Found!</Text>
        </EmptyScreen>         
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
