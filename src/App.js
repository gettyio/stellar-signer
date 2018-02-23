/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { Provider } from 'mobx-react';
import HomeScreen from './transactions/HomeScreen'
import store from './store';

export default App = () => (
  <Provider appStore={store}>
    <HomeScreen></HomeScreen>
  </Provider>
)