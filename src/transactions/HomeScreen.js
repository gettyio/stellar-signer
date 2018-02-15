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
  ActivityIndicator
} from 'react-native';
import * as Animatable from 'react-native-animatable';

import { Screen, Container, Header, H1, TextInput, PasteButton, PasteButtonLabel, LoadButton } from './../shared'
import TransactionList from './TransactionList';

class HomeScreen extends PureComponent {

  state = {
    currentMessage: undefined,
    accountInputValue: 'GBJACKMHHDWPM2NDDRMOIBZFWXPUQ2IQBV42U5ZFV6CWMD27K3KIDO2H'
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

  onMessage = (event) => {
    console.log('hehe', event.nativeEvent.data)
  }

  postMessage = () => {
    console.log('posted')
    const event = JSON.stringify({ type: 'decode',  xdr: 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA==' });
    this.webview.postMessage(event);
  }

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