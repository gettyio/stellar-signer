import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  Clipboard,
  Keyboard,
  StatusBar,
  WebView,
  ActivityIndicator,
  Linking
} from 'react-native';
import qs from 'qs';
import uuid from "uuid/v4";
import { get } from 'lodash';
import { observer, inject } from "mobx-react";
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import Modal from 'react-native-modal';
import AddTransactionForm from './AddTransactionForm';
import TransactionDetail from './TransactionDetail';
import { Screen, Container, Header, Title, LoadButton, TextInput } from './../shared'

import PasteButton from './../shared/PasteButton';
import TransactionList from './TransactionList';


import realm from './../store/realm';

// realm.write(() => {
//   realm.deleteAll();
// });

import parseEnvelopeTree from './../utils/parseEnvelopeTree';

@inject("appStore") @observer
class HomeScreen extends Component {
  
  state = {
    currentXdr: undefined,
    currentTransaction: undefined,
    accountInputValue: 'GBJACKMHHDWPM2NDDRMOIBZFWXPUQ2IQBV42U5ZFV6CWMD27K3KIDO2H'
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      Linking.getInitialURL().then(url => {
        if (url) {
          this.handleAppLinkURL(new String(url));
        }
      });
    } else {
      Linking.addEventListener('url', this.handleAppLinkURL);
      Linking.getInitialURL().then(url => {
        if (url) {
          this.handleAppLinkURL(new String(url));
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.handleCurrentTx();
  }

  handleCurrentTx = () => {
    const { appStore } = this.props;
    const currentXdr = appStore.get('currentXdr');
    if (currentXdr) {
      this.decodeXdr(currentXdr);
    }
  }
    
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleAppLinkURL);
  }
  
  handleAppLinkURL = (event) => {
    const url = (event instanceof String) ? event : event.url;
    if (url) {
      const tx = qs.parse(url.replace('stellar-signer://stellar-signer?',''));
      this.postMessage(tx);
      this.setState({ currentXdr: tx.xdr })
    } else {
      alert('Invalid Transaction! Please contact the support.');
    }
  }

  setAccountValue = (text)=> {
    this.setState({ accountInputValue: text })
  }

  renderTransactionList = () => {
    const { accountInputValue } = this.state;
    if (!accountInputValue) {
      return (
        <View style={{ flex: 1, marginTop: 64, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text style={{ color: '#454545' }}>Add an account to start.</Text>
        </View>
      )
    }
    return (
      <TransactionList 
        account={accountInputValue}
      />
    )
  }

  toggleDetailModal = () => {
    const { appStore } = this.props;
    appStore.set('isDetailModalVisible', !appStore.get('isDetailModalVisible'));
  }

  toggleAddModal = () => {
    const { appStore } = this.props;
    appStore.set('isAddModalVisible', !appStore.get('isAddModalVisible'));
  }

  decodeXdr = (xdr) => {
    //const testTx = 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==';
    const event = JSON.stringify({ type: 'decode', xdr: xdr  });
    setTimeout(()=> {
      this.webview.postMessage(event);
    }, 1000)
  }

  // Must use encodeURIComponent
  postMessage = (tx) => {
    //const testTx = 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==';
    const xdr = decodeURIComponent(tx.xdr)
    const event = JSON.stringify({ type: 'decode', xdr: xdr  });
    //this.showReceiveTransactionModal();
    setTimeout(()=> {
      this.webview.postMessage(event);
    }, 1000)
  }

  onMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data) {
      const res = JSON.parse(data);
      if (res.type === 'error') {
        console.log('Error: ', data);
        this.saveTransaction({ xdr: res.xdr, createdAt: new Date(), type: 'error', message: res.message, status: 'ERROR' });
      } else {
        const tx = parseEnvelopeTree(res.tx);
        this.saveTransaction({ ...tx, xdr: res.xdr, createdAt: new Date(), status: 'CREATED' });
      }
    } else {
      console.log('Data not found!');
    }
  }

  saveTransaction = (tx) => {
    const { appStore } = this.props;
    realm.write(() => {
      realm.create('Transaction', { id: uuid(), ...tx });
    });
    appStore.set('currentXdr', undefined);
  }

  renderWebview = ()=> {
    return (
      <WebView
        ref={webview => (this.webview = webview)}
        style={{ width: 0, height: 0 }}
        source={require(`./../webviews/index.html`)}
        javaScriptEnabled={true}
        onMessage={((event)=> this.onMessage(event))}
      />
    )
  }

  signTransaction = () => {
    const { secretInputValue, currentXdr } = this.state;
    const xdr = currentXdr;
    const data = JSON.stringify({ xdr, sk: secretInputValue });
    this.signingView.postMessage(data);
  }

  render() {
    const { accountInputValue } = this.state;
    const { appStore } = this.props;
    const isAddModalVisible = appStore.get('isAddModalVisible');
    const isDetailModalVisible = appStore.get('isDetailModalVisible');
    const currentTransaction = appStore.get('currentTransaction');

    return (
      <Screen>
        {this.renderWebview()}
        <Header>
          <Title>Stellar Signer</Title>
          <LoadButton onPress={this.toggleAddModal}>
              <Icon name="plus-circle" color="white" size={32}></Icon>
          </LoadButton>
        </Header>
        <Container height="100%">
          <TransactionList />
          
          <Modal isVisible={isAddModalVisible}>
            <AddTransactionForm />
          </Modal>

          <Modal isVisible={isDetailModalVisible}>
            <TransactionDetail tx={currentTransaction} />
          </Modal>

        </Container>
        <StatusBar barStyle="light-content" />
      </Screen>
    );
  }
}
{/**
  Paste Button
<TextInput 
  onChangeText={(text) => this.setAccountValue(text)}
  clearButtonMode={'always'} 
  value={accountInputValue}
></TextInput>
  <PasteButton account={accountInputValue} setAccountValue={this.setAccountValue}/>

**/}
export default HomeScreen;