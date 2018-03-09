import React, { Component } from 'react'
import {
  View,
  ActivityIndicator,
  FlatList,
  Text,
  Image,
  Dimensions
} from 'react-native'
import { observer, inject } from 'mobx-react'
import base64 from 'base-64'
import base64js from 'base64-js'
import crypto from 'crypto-js/pbkdf2'

import { Container, EmptyScreen } from './utils'
import SecretRow from './SecretRow'

@inject('appStore')
@observer
class SecretList extends Component {
  state = {
    hasError: undefined,
    isLoadingList: false
  }

  renderRow = ({ item }) => {
    const { appStore } = this.props
    return (
      <SecretRow item={item} appStore={appStore} onPress={this.props.show} />
    )
  }

  render() {
    const { height } = Dimensions.get('window')
    const { secrets } = this.props

    if (secrets.length < 1) {
      return (
        <EmptyScreen>
          <Image
            source={require('../assets/empty.png')}
            resizeMode="contain"
            style={{ width: 170 }}
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>
            No Secrets Found!
          </Text>
        </EmptyScreen>
      )
    }

    return (
      <View style={{ height: height - 142 }}>
        <FlatList
          data={secrets}
          removeClippedSubviews={true}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => `${item.id}`}
        />
      </View>
    )
  }
}

export default SecretList