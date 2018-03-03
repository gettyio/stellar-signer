/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, Fragment } from 'react';
import {
  View
} from 'react-native';
import { Provider } from 'mobx-react';
import { StackNavigator } from 'react-navigation';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './screens/HomeScreen'
import SecretsScreen from './screens/SecretsScreen'
import SecurePadScreen from './screens/SecurePadScreen';
import store from './store';

const NavigatorScreen = TabNavigator({
  Home: {
    screen: HomeScreen,
  },
  Secrets: {
    screen: SecretsScreen,
  },
},
{
  initialRouteName: 'Secrets',
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Home') {
        iconName = `list-alt`;
      } else if (routeName === 'Secrets') {
        iconName = `shield`;
      }
      // You can return any component that you like here! We usually use an
      // icon component from react-native-vector-icons
      return <Icon name={iconName} size={25} color={tintColor} />;
    },
  }),
  tabBarOptions: {
    activeTintColor: '#0b24fb',
    inactiveTintColor: 'gray',
    style: {
      height: 45,
      backgroundColor: 'white'
    }
  },
  animationEnabled: true,
  swipeEnabled: false,
});

export default App = () => (
  <Provider appStore={store}>
		<Fragment>
  	  <NavigatorScreen />
			<SecurePadScreen />
		</Fragment>
  </Provider>
)