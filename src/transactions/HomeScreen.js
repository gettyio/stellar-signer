import React, { PureComponent } from 'react';
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

import moment from 'moment';
import { Screen, Container, Header, H1, LoadButton, TextInput } from './../shared'

import PasteButton from './../shared/PasteButton';
import TransactionList from './TransactionList';
import TransactionModal from './TransactionModal';

import realm from './../store';
import parseEnvelopeTree from './../utils/parseEnvelopeTree';

class HomeScreen extends PureComponent {

  state = {
    isAddTransactionModalVisible: true,
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

  toggleReceiveTransactionModal = () => {
    this.setState({ isAddTransactionModalVisible: !this.state.isAddTransactionModalVisible });
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
      const tx = JSON.parse(data);
      if (tx.type === 'error') {
        console.log('Error: ', data);
      } else {
        const currentTransaction = this.parseTransactionTree(tx);
        console.log(currentTransaction);
        this.setState({ currentTransaction });
      }
    } else {
      console.log('Data not found!');
    }
  }

  parseTransactionTree = (tx)=> {
    return parseEnvelopeTree(tx);
  }

  saveTransaction = ({ id, xdr, source, fee, seq, time, memo, dest, asset, amount, createdAt }) => {
    realm.write(() => {
      realm.create('Transaction', { id, xdr, source, fee, seq, time, memo, dest, asset, amount, createdAt });
    });
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

  cancelButton = (btn)=> {
    btn
  }

  signTransaction = () => {
    const { secretInputValue, currentXdr } = this.state;
    const xdr = currentXdr;
    const data = JSON.stringify({ xdr, sk: secretInputValue });
    this.signingView.postMessage(data);
  }

  render() {
    const { accountInputValue } = this.state;
    return (
      <Screen>
        <Header>
          <H1>OneSign</H1>
          <LoadButton onPress={this.postMessage}><Text>Load</Text></LoadButton>
          {this.renderWebview()}
        </Header>
        <Container>
          <TextInput 
            onChangeText={(text) => this.setAccountValue(text)}
            clearButtonMode={'always'} 
            value={accountInputValue}
          ></TextInput>
          <PasteButton account={accountInputValue} setAccountValue={this.setAccountValue}/>
        </Container>
        <TransactionList />
        <TransactionModal isVisible={false} />
        <StatusBar barStyle="light-content" />
      </Screen>
    );
  }
}

export default HomeScreen;