import React, { Component } from 'react';
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
import Icon from 'react-native-vector-icons/FontAwesome';
import { observer, inject } from "mobx-react";
import { Container, EmptyScreen } from './../../shared';
import realm from './../../store/realm';
import TransactionRow from './TransactionRow';

@inject("appStore") @observer
class TransactionList extends Component {

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
    const transactions = realm.objects('Transaction').sorted('createdAt', true);
    this.setState({ transactions });
  }

  renderRow = ({ item })=> {
    const { appStore } = this.props;
    return (
      <TransactionRow item={item} appStore={appStore}/>
    );
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
            source={require('./../../shared/empty.png')} 
            resizeMode="contain" 
            style={{ width: 170 }}  
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>No Transactions Found!</Text>
        </EmptyScreen>         
      )
    }

    return (
      <FlatList
        data={transactions}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => `${item.id}`}
      />
    );
  }
}

export default TransactionList;
