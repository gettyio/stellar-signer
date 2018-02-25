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

import { Screen, Container, Header, H1, LoadButton, TextInput } from './../shared'


import PasteButton from './../shared/PasteButton';
import TransactionList from './TransactionList';
import Modal from './Modal';

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

  toggleModal = () => {
    const { appStore } = this.props;
    appStore.set('isModalVisible', !appStore.get('isModalVisible'));
  }

  decodeXdr = (xdr) => {
    //const testTx = 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==';
    const event = JSON.stringify({ type: 'decode', xdr: xdr  });
    setTimeout(()=> {
      this.webview.postMessage(event);
    }, 3000)
  }

  // Must use encodeURIComponent
  postMessage = (tx) => {
    //const testTx = 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==';
    const xdr = decodeURIComponent(tx.xdr)
    const event = JSON.stringify({ type: 'decode', xdr: xdr  });
    //this.showReceiveTransactionModal();
    setTimeout(()=> {
      this.webview.postMessage(event);
    }, 3000)
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

  saveXDR = (event) => {
    const { signedXdr } = this.state;
    this.signButton.success();
    setTimeout(()=> { this.setState({ isAddTransactionModalVisible: false, signedXdr }) }, 1000)
  }

  signTransaction = () => {
    const { secretInputValue, currentXdr } = this.state;
    const xdr = currentXdr;
    const data = JSON.stringify({ xdr, sk: secretInputValue });
    this.signingView.postMessage(data);
  }

  render() {
    const { accountInputValue } = this.state;
    const isModalVisible = this.props.appStore.get('isModalVisible');

    return (
      <Screen>
        {this.renderWebview()}
        <Header>
          <H1>Stellar Signer</H1>
          <LoadButton onPress={this.toggleModal}>
              <Icon name="plus-circle" color="white" size={32}></Icon>
          </LoadButton>
        </Header>
        <Container>
          {/**
          <TextInput 
            onChangeText={(text) => this.setAccountValue(text)}
            clearButtonMode={'always'} 
            value={accountInputValue}
          ></TextInput>
          **/}
          <PasteButton account={accountInputValue} setAccountValue={this.setAccountValue}/>
          <TransactionList />
          <Modal isVisible={isModalVisible} type="add" />
        </Container>
        <StatusBar barStyle="light-content" />
      </Screen>
    );
  }
}

export default HomeScreen;