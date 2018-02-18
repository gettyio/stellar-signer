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
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import moment from 'moment';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import { Screen, Container, Header, H1, TextInput, PasteButton, PasteButtonLabel, LoadButton } from './../shared'
import TransactionList from './TransactionList';
import realm from './../store';
import parseEnvelopeTree from './../utils/parseEnvelopeTree';

class HomeScreen extends PureComponent {

  state = {
    isAddTransactionModalVisible: false,
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
    } else {
      alert('Invalid Transaction! Please contact the support.');
    }
  }

  setAccountValue = (text)=> {
    this.setState({ accountInputValue: text })
  }

  renderPasteButton = ()=> {
    const { accountInputValue } = this.state;
    if (!accountInputValue || accountInputValue === "") {
      return (
        <Animatable.View ref="view" style={{ position: 'absolute', marginTop: 18, marginLeft: -6 }}>
          <PasteButton onPress={this.pasteHandler} >
            <PasteButtonLabel>Click to paste your public key or start type.</PasteButtonLabel>
          </PasteButton>
        </Animatable.View>
      )
    }
  }

  getClipboardValue = async ()=> {
    return await Clipboard.getString();
  }

  pasteHandler = async ()=> {
    const content = await this.getClipboardValue();
    this.refs.view
      .fadeOutLeft(300)
      .then(() => this.setState({ accountInputValue: content }, ()=> {
        Keyboard.dismiss();
      }))
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

  renderAddTransactionModal = () => {
    const { isAddTransactionModalVisible, currentTransaction } = this.state;
    console.log('currentTransaction',currentTransaction)
    if (currentTransaction) {
      return (
        <Modal isVisible={true}>
          <View style={{ height: '60%', justifyContent: 'center', backgroundColor: 'white' , margin: 16 }}>
            <ActivityIndicator size="large" color="#4b9ed4"></ActivityIndicator>
            <Text style={{ color: 'gray' }}>Stellar Signer is loading...</Text>
          </View>
        </Modal>
      );
    }
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
          {this.renderPasteButton()}
        </Container>
        {this.renderTransactionList()}
        {this.renderAddTransactionModal()}
        <StatusBar barStyle="light-content" />
      </Screen>
    );
  }
}

export default HomeScreen;