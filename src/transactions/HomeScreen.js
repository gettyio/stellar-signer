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
import * as Animatable from 'react-native-animatable';
import { Screen, Container, Header, H1, TextInput, PasteButton, PasteButtonLabel, LoadButton } from './../shared'
import TransactionList from './TransactionList';
import realm from './../store';

class HomeScreen extends PureComponent {

  state = {
    currentMessage: undefined,
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
    const { accountInputValue, currentMessage } = this.state;
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

  // Must use encodeURIComponent
  postMessage = (tx) => {
    console.log(tx);
    //const testTx = 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==';
    const xdr = decodeURIComponent(tx.xdr)
    const event = JSON.stringify({ type: 'decode', xdr: xdr  });
    setTimeout(()=> {
      this.webview.postMessage(event);
    }, 2300)
  }

  onMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data) {
      const tx = JSON.parse(data);
      if (tx.type === 'error') {
        console.log('Error: ', data);
      } else {
        console.log(tx);
        // realm.write(() => {
        //   realm.create('Transaction', {
        //     id: uuid(),
        //     xdr: tx.xdr,
        //     decodedXdr: tx.decodedXdr,
        //     createdAt: new Date()
        //   });
        // });
      }
    } else {
      console.log('Data not found!');
    }
  }

  // onMessage = (event) => {
  //   console.log('hehe', event.nativeEvent.data)
  // }

  // postMessage = () => {
  //   console.log('posted')
  //   const event = JSON.stringify({ type: 'decode',  xdr: 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==' });
  //   this.webview.postMessage(event);
  // }

  clearMessage = () => {
    this.setState({ currentMessage: undefined });
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

        <StatusBar barStyle="light-content" />
      </Screen>
    );
  }
}

export default HomeScreen;