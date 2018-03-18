import React, { Component } from 'react'
import { View, Text, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Linking } from 'react-native'
import PropTypes from 'prop-types'
import qs from 'qs'
import { observer, inject } from 'mobx-react'
import crypto from 'crypto-js'
import sha256 from 'crypto-js/sha256';
import Modal from 'react-native-modal'
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome'
import Button from 'react-native-micro-animated-button'
import SplashScreen from 'react-native-splash-screen'
import SInfo from 'react-native-sensitive-info';
import SecurityForm from '../components/SecurityForm'
import {
  Screen,
  ContainerFlex,
  Header,
  Title,
  LoadButton,
  ErrorLabel,
  CloseButton,
  Card,
  CardRow,
  CardLabel,
  CardTitle
} from '../components/utils'

import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })
import { version } from './../../package.json'

@inject('appStore') @observer
class AuthScreen extends Component {
  static navigationOptions = {
    header: null
  };

	state = {
		firstSecret: undefined
	}

	componentDidMount() {
		SplashScreen.hide();
		this.enableDeepLinks();
		this.loadData();
		//this.deleteSeed();
	}

	componentWillUnmount() {
    Linking.removeEventListener('url', this.handleAppLinkURL)
	}

	deleteSeed = () => {
		const uniqueId = DeviceInfo.getUniqueID();
		const seedKey = sha256(`ss-${uniqueId}`);
		SInfo.deleteItem(seedKey.toString(), {})
	}

	loadSeed = () => {
		const { appStore, navigation } = this.props
		if (!appStore.get('seed')) {
			try {
				const pwd = appStore.get('pwd')
				const uniqueId = DeviceInfo.getUniqueID();
				const seedKey = sha256(`ss-${uniqueId}`);
				SInfo.getItem(seedKey.toString(),{}).then(value => {
					if (value) {
						const pass = sha256(`ss-${uniqueId}-${pwd}`);
						const bytes = crypto.AES.decrypt(value, pass.toString());
						const seed =  bytes.toString(crypto.enc.Utf8)
						if (seed) {
							appStore.set('seed', seed);
							navigation.navigate('Home');
						} else {
							navigation.navigate('CreateVault');
						}
					} else{
						navigation.navigate('CreateVault');
					}
				})
			} catch (error) {
				alert(error.message);
				//alert('Error to load your seed, please uninstall this app and install the last version to have a better experience. You will need to use your seed to restore your keys.');
			}
		}
	}
	
	enableDeepLinks = () => {
		Linking.addEventListener('url', this.handleAppLinkURL)
		Linking.getInitialURL().then(url => {
			if (url) {
				this.handleAppLinkURL(new String(url))
			}
		})
	}

	loadData = () => {
		const { appStore } = this.props
		try {
			db.allDocs({
				include_docs: true
			}).then((res)=> {
				const row = res.rows[0];
				if (row) {
					this.setState({ firstSecret: row.doc })
				}
			})
		} catch (error) {
			appStore.set('securityFormError', 'Invalid password!')
		}
	}

  handleAppLinkURL = event => {
		const { appStore } = this.props
    const url = event instanceof String ? event : event.url
    if (url) {
      const tx = qs.parse(url.replace('stellar-signer://stellar-signer?', ''))
			appStore.set('currentXdr', tx.xdr)
    } else {
      alert('Invalid Transaction! Please contact the support.')
    }
  }

  submit = pwd => {
		const { firstSecret } = this.state;
		const { appStore, navigation } = this.props
		try {
			const encodedPwd = sha256(pwd);
			if (firstSecret) {
				SInfo.getItem(firstSecret._id,{}).then(value => {
					const bytes = crypto.AES.decrypt(value, `${firstSecret._id}:${encodedPwd.toString()}`);
					const val =  bytes.toString(crypto.enc.Utf8)
					if (val) {
						appStore.set('pwd', encodedPwd.toString())
						appStore.set('securityFormError', undefined)
						appStore.set('isSecurityRequired', false)
						this.loadSeed();
					} else {
						appStore.set('securityFormError', 'Invalid password!')
					}
				}).catch(err => {
					appStore.set('securityFormError', 'Invalid password!')
				})
			} else {
				appStore.set('pwd', encodedPwd.toString())
				appStore.set('securityFormError', undefined)
				appStore.set('isSecurityRequired', false)
				this.loadSeed();
			}
		} catch (error) {
			console.log('error',error)
			appStore.set('securityFormError', 'Invalid password!')
		}
  }

  toggleModal = () => {
    const { appStore } = this.props
    appStore.set('isSecurityRequired', !appStore.get('isSecurityRequired'))
  }

  render() {
    const { appStore } = this.props
    const isSecurityRequired = appStore.get('isSecurityRequired')
    const securityFormError = appStore.get('securityFormError')
    return (
			<SafeAreaView style={{ flex: 1, alignContent: 'flex-start',	backgroundColor: 'white' }}>
				<ScrollView
					keyboardShouldPersistTaps="always"
					keyboardDismissMode="interactive"
				>
					<KeyboardAvoidingView behavior="position">
						<View style={{ alignSelf: 'center', backgroundColor: 'white', marginTop: 16  }}>
							<Image source={require('./../assets/logo.png')} style={{ height: 150 }} resizeMode='contain'/>
						</View>
						<SecurityForm
								appStore={appStore}
								submit={this.submit}
								error={securityFormError}
								close={this.toggleModal}
							/>
							
						<View style={{ alignSelf: 'center' }}>
							<Text style={{ color: 'gray', fontSize: 10 }}>
								{`v${version}`}
							</Text>
						</View>
					</KeyboardAvoidingView>
				</ScrollView>
			</SafeAreaView>
    )
  }
}

export default AuthScreen
