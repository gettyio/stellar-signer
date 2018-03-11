import React, { Component } from 'react'
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
	Linking,
	AsyncStorage
} from 'react-native'
import qs from 'qs'
import uuid from 'uuid/v4'
import { get } from 'lodash'
import base64 from 'base-64'
import base64js from 'base64-js'
import crypto from 'crypto-js/pbkdf2'
import { observer, inject } from 'mobx-react'
import Icon from 'react-native-vector-icons/Feather'
import moment from 'moment'
import Modal from 'react-native-modal'
import cryptocore from 'crypto-js/core'
import Button from 'react-native-micro-animated-button'
import SplashScreen from 'react-native-splash-screen'
import RxDB from 'rxdb';

RxDB.plugin(require('pouchdb-adapter-asyncstorage').default);

import TransactionForm from '../components/TransactionForm'
import TransactionDetail from '../components/TransactionDetail'
import PasteButton from '../components/PasteButton'
import TransactionList from '../components/TransactionList'

import {
  Screen,
  Container,
  Header,
  Title,
  LoadButton,
  TextInput,
	CloseButton,
	TitleWrapper,
	LoadButtonWrapper
} from '../components/utils'

import getSecretStore from './../store/secrets'
import store from './../store/realm'
import { decodeFromXdr, signXdr } from './../utils/xdrUtils';
import parseEnvelopeTree from './../utils/parseEnvelopeTree'
import { createDb, schema } from './../store/db'

@inject('appStore') @observer
class HomeScreen extends Component {
  state = {
    realm: undefined,
    currentXdr: undefined,
		currentTransaction: undefined,
		currentDecodedTx: undefined
  }

  async componentDidMount() {
    SplashScreen.hide();
    if (Platform.OS === 'android') {
      Linking.getInitialURL().then(url => {
        if (url) {
          this.handleAppLinkURL(new String(url))
        }
      })
    } else {
      Linking.addEventListener('url', this.handleAppLinkURL)
      Linking.getInitialURL().then(url => {
        if (url) {
          this.handleAppLinkURL(new String(url))
        }
      })
    }
    // Ensure that the salt will exists when create the realm file
		this.checkSalt();
		await this.createDb();
	}

	createDb = async () => {
		const db = await RxDB.create({
			name: 'signer',
			adapter: 'asyncstorage',
			multiInstance: false,
		});
	
		const transactions = await db.collection({
			name: 'transactions',
			schema: schema,
		});
		console.log('db',db)
		this.db = db;
	}

	componentDidUpdate(prevProps, prevState) {
    this.handleCurrentTx()
  }

  componentWillUnmount() {
    // const { secretStore } = this.state
    // if (secretStore) {
    //   secretStore.removeAllListeners()
    // }
  }

  checkSalt = () => {
    // const salt = store.objects('Salt')[0]
    // if (!salt) {
    //   store.write(() => {
    //     const val = cryptocore.lib.WordArray.random(128 / 8)
    //     store.create('Salt', { id: uuid(), value: JSON.stringify(val) })
    //   })
    // }
  }

  handleCurrentTx = () => {
    const { appStore } = this.props
    const currentXdr = appStore.get('currentXdr')
    if (currentXdr) {
      this.decodeXdr(currentXdr)
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleAppLinkURL)
  }

  handleAppLinkURL = event => {
    const url = event instanceof String ? event : event.url
    if (url) {
      const tx = qs.parse(url.replace('stellar-signer://stellar-signer?', ''))
      this.postMessage(tx)
      this.setState({ currentXdr: tx.xdr })
    } else {
      alert('Invalid Transaction! Please contact the support.')
    }
  }

  sendToViewer = () => {
    const url = `stellar-signer://stellar-signer?${qs.stringify({
      type: 'decode', xdr: 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA=='
		})}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          console.log("Can't handle url: " + url)
        } else {
          return Linking.openURL(url)
        }
      })
      .catch(err => console.error('An error occurred', err))
  }

  toggleDetailModal = () => {
    const { appStore } = this.props
    appStore.set('isDetailModalVisible', !appStore.get('isDetailModalVisible'))
  }

  toggleAddModal = () => {
    const { appStore } = this.props
    appStore.set('isAddModalVisible', !appStore.get('isAddModalVisible'))
  }

  decodeXdr = xdr => {
		// const event = JSON.stringify({ type: 'decode', xdr: xdr })
		const decodedTx = decodeFromXdr(xdr, 'TransactionEnvelope');
		this.saveCurrentTransaction(decodedTx);
  }

  // Must use encodeURIComponent
  postMessage = tx => {
		console.log('postMessage',tree);
    const xdr = decodeURIComponent(tx.xdr)
		// const event = JSON.stringify({ type: 'decode', xdr: xdr })
		const currentDecodedTx = decodeFromXdr(xdr, 'TransactionEnvelope');
		//	this.setState({  currentDecodedTx })

    // setTimeout(() => {
    //   this.webview.postMessage(event)
    // }, 1000)
  }

  saveCurrentTransaction = data => {
		const { appStore } = this.props
		const currentTransaction = appStore.get('currentTransaction')
    if (data) {
      if (data.type === 'error') {
        //console.warn('Error: ', data);
        this.saveTransaction({
          xdr: data.xdr,
          createdAt: new Date(),
          type: 'error',
          message: data.message,
          status: 'ERROR'
        })
      } else if (data.type === 'sign') {
        this.saveTransaction({
          ...currentTransaction,
          ...data,
          status: 'SIGNED'
        })
      } else {
				const tx = parseEnvelopeTree(data.tx)
        this.saveTransaction({
					...tx,
          type: data.type,
					xdr: data.xdr,
          createdAt: new Date(),
          status: 'CREATED'
        })
      }
    } else {
      console.warn('Data not found!');
    }
  }

  saveTransaction = async tx => {
		const { appStore } = this.props
		try {
			await this.db.transactions.insert(tx);
		} catch (error) {
			alert(error.message)
		}
		//alert('saveTransaction')
    // store.write(() => {
    //   if (tx.type === 'sign') {
    //     store.create('Transaction', { ...tx }, true)
    //   } else {
    //     store.create('Transaction', { id: uuid(), ...tx })
    //   }
    // })
    appStore.set('currentXdr', undefined)
  }

  cancelTransaction = () => {
    const { appStore } = this.props
    // store.write(() => {
    //   const currentTransaction = appStore.get('currentTransaction')
    //   currentTransaction.status = 'REJECTED'
    //   store.create(
    //     'Transaction',
    //     {
    //       ...currentTransaction,
    //       id: currentTransaction.id,
    //       status: 'REJECTED'
    //     },
    //     true
    //   )
    // })

    setTimeout(() => {
      appStore.set('currentTransaction', undefined)
      this.toggleDetailModal()
    }, 1000)
  }

  signTransaction = sk => {
    const { appStore } = this.props
    const currentTransaction = appStore.get('currentTransaction')
    const data = {
      type: 'sign',
      tx: currentTransaction,
      xdr: currentTransaction.xdr,
      sk
		};

		const signedTx = signXdr(data);
		this.saveCurrentTransaction(signedTx)

    this.toggleDetailModal()
  }

  render() {
    const { appStore } = this.props
    const isAddModalVisible = appStore.get('isAddModalVisible')
    const isDetailModalVisible = appStore.get('isDetailModalVisible')
    const currentTransaction = appStore.get('currentTransaction')

    return (
      <Screen>
        <Header>
					<TitleWrapper>
          	<Title>Stellar Signer</Title>
					</TitleWrapper>
					<LoadButtonWrapper>
						<LoadButton onPress={this.toggleAddModal}>
							<Icon name="plus-circle" color="white" size={32} />
						</LoadButton>
					</LoadButtonWrapper>
        </Header>

        <TransactionList db={this.db} />

        <Modal isVisible={isAddModalVisible} style={{ paddingTop: 24 }}>
          <CloseButton onPress={this.toggleAddModal}>
            <Icon name="x-circle" color="white" size={32} />
          </CloseButton>
          <TransactionForm />
        </Modal>

        <Modal isVisible={isDetailModalVisible} style={{ paddingTop: 24 }}>
          <CloseButton onPress={this.toggleDetailModal}>
            <Icon name="x-circle" color="white" size={32} />
          </CloseButton>
          <TransactionDetail
						tx={currentTransaction}
						toggleModal={this.toggleDetailModal}
            cancelTransaction={this.cancelTransaction}
            signTransaction={this.signTransaction}
          />
        </Modal>

        <StatusBar barStyle="light-content" />
      </Screen>
    )
  }
}
{
  /**
  Paste Button
<TextInput
  onChangeText={(text) => this.setAccountValue(text)}
  clearButtonMode={'always'}
  value={accountInputValue}
></TextInput>
  <PasteButton account={accountInputValue} setAccountValue={this.setAccountValue}/>

**/
}
export default HomeScreen
