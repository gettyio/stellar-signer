import 'babel-polyfill';
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
	AsyncStorage,
	SafeAreaView
} from 'react-native'
import qs from 'qs'
import uuid from 'uuid/v4'
import { get, sortBy } from 'lodash'
import base64 from 'base-64'
import base64js from 'base64-js'
import sha256 from 'crypto-js/sha256'
import { observer, inject } from 'mobx-react'
import Icon from 'react-native-vector-icons/Feather'
import moment from 'moment'
import Modal from 'react-native-modal'
import SInfo from 'react-native-sensitive-info'
import Button from 'react-native-micro-animated-button'
import TransactionForm from '../components/transaction/TransactionForm'
// import TransactionDetail from '../components/TransactionDetail'
import PasteButton from '../components/shared/PasteButton'
import TransactionList from '../components/transaction/TransactionList'
import {
	Screen,
	Container,
	ContainerFlex,
	Header,
	Title,
	LoadButton,
	TextInput,
	CloseButton,
	TitleWrapper,
	LoadButtonWrapper
} from './styled'
import { decodeFromXdr, signXdr } from './../utils/xdrUtils'
import parseEnvelopeTree from './../utils/parseEnvelopeTree'
import crypto from 'crypto-js'
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'

PouchDB.plugin(SQLiteAdapterFactory(SQLite))
PouchDB.plugin(require('pouchdb-upsert'))
const db = new PouchDB('Transactions', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class HomeScreen extends Component {
	static navigationOptions = () => ({ header: null })

	state = {
		transactions: [],
		isLoadingList: true,
		currentXdr: undefined,
		currentTransaction: undefined,
		currentDecodedTx: undefined
	}

	componentDidMount() {
		this.loadTransactions();
		this.enableDeepLinks();
	}

	componentDidUpdate(prevProps, prevState) {
		this.handleCurrentTx()
		this.loadTransactions()
	}

	componentWillUnmount() {
		Linking.removeEventListener('url', this.handleAppLinkURL)
	}

	enableDeepLinks = () => {
		Linking.addEventListener('url', this.handleAppLinkURL)
		Linking.getInitialURL().then(url => {
			if (url) {
				this.handleAppLinkURL(new String(url))
			}
		})
	}

	handleAppLinkURL = event => {
		const url = event instanceof String ? event : event.url
		if (url) {
			const tx = qs.parse(url.replace('stellar-signer://stellar-signer?', ''))
			this.addXDRAndOpenDetails(tx.xdr)
		} else {
			alert('Invalid Transaction! Please contact the support.')
		}
	}

	addXDRAndOpenDetails = xdr => {
		const { appStore, navigation } = this.props
		const decodedTx = this.decodeXdr(xdr)
		const transaction = this.getCurrentTransaction(decodedTx)
		if (transaction) {
			this.saveTransaction(transaction)
			appStore.set('currentTransaction', transaction)
			navigation.navigate('TransactionDetail')
		}
	}

	loadTransactions = () => {
		const self = this;
		db.allDocs({
			include_docs: true
		}).then((res) => {
			const rawTransactions = res.rows.map((item, index) => item.doc);
			const transactions = sortBy(rawTransactions, 'createdAt').reverse()
			self.setState({ transactions, isLoadingList: false });
		})
	}

	handleCurrentTx = () => {
		const { appStore } = this.props
		const currentXdr = appStore.get('currentXdr')
		if (currentXdr) {
			this.decodeXdr(currentXdr)
		}
	}

	sendToViewer = () => {
		// Todo: remove mock data
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

	// toggleAddModal = () => {
	// 	const { appStore } = this.props
	// 	appStore.set('isAddModalVisible', !appStore.get('isAddModalVisible'))
	// }

	decodeXdr = xdr => decodeFromXdr(xdr, 'TransactionEnvelope')

	getCurrentTransaction = data => {
		const { appStore } = this.props
		const currentTransaction = appStore.get('currentTransaction')

		if (!data) {
			console.warn('Data not found!')
			return null
		}
		
		if (data.type === 'error') {
			return {
				xdr: data.xdr,
				createdAt: new Date().toISOString(),
				type: 'error',
				message: data.message,
				status: 'ERROR'
			}
		} else if (data.type === 'sign') {
			return {
				...currentTransaction,
				...data,
				status: 'SIGNED',
				createdAt: new Date().toISOString()
			}
		} else {
			const tx = parseEnvelopeTree(data.tx)
			return {
				...tx,
				type: data.type,
				xdr: data.xdr,
				createdAt: new Date().toISOString(),
				status: 'CREATED'
			}
		}
	}

	saveTransaction = async tx => {
		const { appStore } = this.props
		try {
			db.put({
				_id: uuid(),
				...tx
			});
			this.loadTransactions();
		} catch (error) {
			alert(error.message)
		}
		appStore.set('currentXdr', undefined)
	}

	cancelTransaction = () => {
		const { appStore } = this.props
		const currentTransaction = appStore.get('currentTransaction')
		try {
			db.put({
				_id: currentTransaction._id,
				...currentTransaction,
				status: 'REJECTED'
			});
			this.loadTransactions();
			this.toggleDetailModal()
			appStore.set('currentTransaction', undefined)
		} catch (error) {
			alert(error.message)
		}
	}

	deleteTransaction = async (doc) => {
		try {
			const res = await db.remove(doc);
			this.loadTransactions();
		} catch (error) {
			alert(error.message);
		}
	}

	render() {
		const { appStore, navigation } = this.props
		const { transactions, isLoadingList } = this.state;
		const isAddModalVisible = appStore.get('isAddModalVisible')
		const isDetailModalVisible = appStore.get('isDetailModalVisible')
		const currentTransaction = appStore.get('currentTransaction')

		return (
			<Screen>
				<StatusBar backgroundColor="#344B67" barStyle="light-content" />
				<Header>
					<TitleWrapper>
						<Title>StellarSigner</Title>
					</TitleWrapper>
					<LoadButtonWrapper>
						<LoadButton onPress={() => navigation.navigate('QRCodeScanner', { callback: this.addXDRAndOpenDetails })}>
							<Icon name="plus-circle" color="white" size={32} />
						</LoadButton>
					</LoadButtonWrapper>
				</Header>
				<TransactionList transactions={transactions} isLoadingList={isLoadingList} />
				{/* <Modal isVisible={isAddModalVisible} >
					<SafeAreaView style={{ flex: 1 }}>
						<CloseButton onPress={this.toggleAddModal}>
							<Icon name="x-circle" color="white" size={32} />
						</CloseButton>
						<TransactionForm />
					</SafeAreaView>
				</Modal> */}
			</Screen>
		)
	}
}

export default HomeScreen
