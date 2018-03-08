import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  View,
  Text,
  FlatList,
  WebView,
  Keyboard,
  Clipboard,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import moment from 'moment'
import Icon from 'react-native-vector-icons/FontAwesome'
import { observer, inject } from 'mobx-react'

import TransactionRow from './TransactionRow'
import { Container, EmptyScreen } from './utils'

import store from './../store/realm'

@inject('appStore')
@observer
class TransactionList extends Component {
  state = {
    transactions: [],
    currentTx: undefined,
    hasError: undefined,
    isLoadingList: false
  }

  componentDidMount() {
    store.addListener('change', this.refreshList)
    this.refreshList()
  }

  componentWillUnmount() {
    store.removeAllListeners()
  }

  refreshList = () => {
    const transactions = store.objects('Transaction').sorted('createdAt', true)
    this.setState({ transactions })
  }

  renderRow = ({ item }) => {
    const { appStore } = this.props
    return <TransactionRow item={item} appStore={appStore} />
  }

  render() {
    const { height } = Dimensions.get('window')
    const { isLoadingList, hasError, transactions } = this.state

    if (isLoadingList) {
      return (
        <View style={{ flex: 1, marginTop: 64 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }

    if (hasError) {
      return (
        <View>
          <Text>Error</Text>
        </View>
      )
    }

    if (transactions.length < 1) {
      return (
        <EmptyScreen>
          <Image
            source={require('../assets/empty.png')}
            resizeMode="contain"
            style={{ width: 170 }}
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>
            No Transactions Found!
          </Text>
        </EmptyScreen>
      )
    }

    return (
      <View style={{ height: height - 142 }}>
        <FlatList
          data={transactions}
          removeClippedSubviews={true}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => `${item.id}`}
        />
      </View>
    )
  }
}

export default TransactionList
