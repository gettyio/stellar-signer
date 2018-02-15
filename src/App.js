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
  View
} from 'react-native';
import HomeScreen from './transactions/HomeScreen'
global.Buffer = require('buffer/').Buffer ;

export default class App extends Component {
  render() {
    return (
      <View>
        <HomeScreen></HomeScreen>
      </View>
    );
  }
}