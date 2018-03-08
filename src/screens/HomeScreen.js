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
import base64 from 'base-64';
import base64js from 'base64-js';
import crypto from 'crypto-js/pbkdf2';
import { observer, inject } from "mobx-react";
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Modal from 'react-native-modal';
import cryptocore from 'crypto-js/core';
import Button from 'react-native-micro-animated-button';
import AddTransactionForm from './../modules/transactions/AddTransactionForm';
import TransactionDetail from './../modules/transactions/TransactionDetail';
import { Screen, Container, Header, Title, LoadButton, TextInput, CloseButton } from './../shared'

import PasteButton from './../shared/PasteButton';
import TransactionList from './../modules/transactions/TransactionList';
import getSecretStore from './../store/secrets';
import saltStore from './../store/salt';
import txStore from './../store/transactions';
//Delete All
// txStore.write(() => {
//   txStore.deleteAll();
// });

import parseEnvelopeTree from './../utils/parseEnvelopeTree';

@inject("appStore") @observer
class HomeScreen extends Component {
  
  state = {
		realm: undefined,
    currentXdr: undefined,
    currentTransaction: undefined
  }

  componentDidMount() {
    //const url = `stellar-signer://stellar-signer?${qs.stringify({ type: 'decode', xdr: 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==' })}`;

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
	
		// Ensure that the salt will exists when create the realm file
		this.checkSalt();
	}

  componentDidUpdate(prevProps, prevState) {
		this.handleCurrentTx();
	}

	componentWillUnmount() {
		const { secretStore } = this.state;
		if (secretStore) {
			secretStore.removeAllListeners();
		}
	}

	checkSalt = () => {
		const salt = saltStore.objects('Salt')[0];
		if (!salt) {
			saltStore.write(()=> {
				const val = cryptocore.lib.WordArray.random(128/8);
				saltStore.create('Salt', { id: uuid(), value: JSON.stringify(val) })
			});
		}
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

    const event = JSON.stringify({ type: 'decode', xdr });
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
    const { appStore } = this.props;
    const data = event.nativeEvent.data;
    const currentTransaction = appStore.get('currentTransaction');
    if (data) {
      const res = JSON.parse(data);
      if (res.type === 'error') {
        //console.warn('Error: ', data);
        this.saveTransaction({ xdr: res.xdr, createdAt: new Date(), type: 'error', message: res.message, status: 'ERROR' });
      } else if (res.type === 'sign') {
        this.saveTransaction({ ...currentTransaction, ...res, status: 'SIGNED' });
      } else  {
        const tx = parseEnvelopeTree(res.tx);
        this.saveTransaction({ ...tx, type: res.type, xdr: res.xdr, createdAt: new Date(), status: 'CREATED' });
      }
    } else {
      //console.warn('Data not found!');
    }
  }

  saveTransaction = (tx) => {
    const { appStore } = this.props;
    txStore.write(() => {
      if (tx.type === 'sign') {
        txStore.create('Transaction', { ...tx }, true);
      } else {
        txStore.create('Transaction', { id: uuid(), ...tx });
      }
    });
    appStore.set('currentXdr', undefined);
  }

  renderWebview = ()=> {
    return (
      <WebView
        ref={webview => (this.webview = webview)}
        style={{ width: 0, height: 0 }}
        source={require(`./../modules/webviews/index.html`)}
        javaScriptEnabled={true}
        onMessage={((event)=> this.onMessage(event))}
      />
    )
  }

  cancelTransaction = () => {
    const { appStore } = this.props;
    txStore.write(() => {
      const currentTransaction = appStore.get('currentTransaction');
      currentTransaction.status = 'REJECTED'
      txStore.create('Transaction', { ...currentTransaction, id: currentTransaction.id, status: 'REJECTED' }, true);
    });
    
    setTimeout(()=> { 
      appStore.set('currentTransaction', undefined);
      this.toggleDetailModal();
     }, 1000);
  }
  
  signTransaction = (sk) => {
    const { appStore } = this.props;
    const currentTransaction = appStore.get('currentTransaction');
		const data = JSON.stringify({ type: 'sign', tx: currentTransaction, xdr: currentTransaction.xdr, sk });
    this.webview.postMessage(data);
    this.toggleDetailModal();
  }

  render() {
    const { appStore } = this.props;
    const isAddModalVisible = appStore.get('isAddModalVisible');
    const isDetailModalVisible = appStore.get('isDetailModalVisible');
    const currentTransaction = appStore.get('currentTransaction');
		
    return (
      <Screen>
        <Header>
          <Title>Stellar Signer</Title>
          <LoadButton onPress={this.toggleAddModal}>
              <Icon name="plus-circle" color="white" size={32}></Icon>
          </LoadButton>
        </Header>
				<TransactionList />
          <Modal isVisible={isAddModalVisible}>
            <CloseButton onPress={this.toggleAddModal}>
              <Icon name="x-circle" color="white" size={32}></Icon>
            </CloseButton>          
            <AddTransactionForm />
          </Modal>

          <Modal isVisible={isDetailModalVisible}>
            <CloseButton onPress={this.toggleDetailModal}>
              <Icon name="x-circle" color="white" size={32}></Icon>
            </CloseButton>
            <TransactionDetail 
              tx={currentTransaction} 
              cancelTransaction={this.cancelTransaction}
              signTransaction={this.signTransaction} 
            />
          </Modal>
        <StatusBar barStyle="light-content" />
				{this.renderWebview()}
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