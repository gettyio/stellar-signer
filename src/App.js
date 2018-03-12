import React, { Component, Fragment } from 'react'
import { View, AsyncStorage } from 'react-native'
import { Provider } from 'mobx-react'
import { StackNavigator } from 'react-navigation'
import { TabNavigator, TabBarBottom } from 'react-navigation'
import Icon from 'react-native-vector-icons/Feather'

import HomeScreen from './screens/HomeScreen'
import SecretsScreen from './screens/SecretsScreen'
import SecurePadScreen from './screens/SecurePadScreen'
import store from './store'


const NavigatorScreen = TabNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Secrets: {
      screen: SecretsScreen
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

      style: {
        height: 45,
        backgroundColor: 'white'
      }
    },
    animationEnabled: true,
    swipeEnabled: false
  }
)

export default (() => (
  <Provider appStore={store} >
    <Fragment>
      <NavigatorScreen />
      <SecurePadScreen />
    </Fragment>
  </Provider>
))
