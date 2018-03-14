import React, { Component, Fragment } from 'react'
import { Provider } from 'mobx-react'
import { StackNavigator } from 'react-navigation'
import { TabNavigator, TabBarBottom } from 'react-navigation'
import Icon from 'react-native-vector-icons/Feather'

import HomeScreen from './screens/HomeScreen'
import SecretsScreen from './screens/SecretsScreen'
import AuthScreen from './screens/AuthScreen'
import AboutScreen from './screens/AboutScreen'
import store from './store'

const NavigationStack = TabNavigator(
  {
		Home: {
			screen: HomeScreen
		},
		Secrets: {
      screen: SecretsScreen
		},
		About: {
      screen: AboutScreen
    }
  },
  {
    initialRouteName: 'Home',
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state
        let iconName
        if (routeName === 'Home') {
          iconName = `book`
        } else if (routeName === 'Secrets') {
          iconName = `shield`
        } else if (routeName === 'About') {
          iconName = `info`
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Icon name={iconName} size={25} color={tintColor} />
      }
		}),
		tabBarPosition: 'bottom',
		tabBarComponent: TabBarBottom,
    tabBarOptions: {
      activeTintColor: '#0b24fb',
			inactiveTintColor: 'gray',
			showLabel: false,
      style: {
        height: 45,
        backgroundColor: 'white'
      }
    },
    animationEnabled: true,
    swipeEnabled: false
  }
)

const RootStack = StackNavigator(
  {
    Main: {
      screen: NavigationStack,
    },
    AuthModal: {
      screen: AuthScreen,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
  }
);

export default (() => (
  <Provider appStore={store} >
    <RootStack />
  </Provider>
))
