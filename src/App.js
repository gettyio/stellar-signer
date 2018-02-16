/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Linking
} from 'react-native';
import qs from 'qs';
import uuid from "uuid/v4";
import HomeScreen from './transactions/HomeScreen'
import realm from './store'
export default class App extends Component {

  componentDidMount() {

    if (Platform.OS === 'android') {
      Linking.getInitialURL().then(url => {
        this.handleAppLinkURL(url);
      });
    } else {
        Linking.addEventListener('url', this.handleAppLinkURL);
      }
    }
    
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleAppLinkURL);
  }
  
  handleAppLinkURL = (event) => {
    const url = event.url;
    const tx = qs.parse(url.replace('stellar-signer://stellar-signer?',''));
    realm.write(() => {
      const john = realm.create('Transaction', {
        id: uuid(),
        xdr: tx.xdr,
        createdAt: new Date()
      });
      john.lastName = 'Peterson';
    });
  }

  render() {
    return (
      <View>
        <HomeScreen></HomeScreen>
      </View>
    );
  }
}