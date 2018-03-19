import React, { Component } from 'react'
import { View, Text, ScrollView, Alert, Dimensions, KeyboardAvoidingView, SafeAreaView, Clipboard, Keyboard } from 'react-native'
import Modal from 'react-native-modal'
import uuid from 'uuid/v4'
import createHmac from 'create-hmac'
import { observer, inject } from 'mobx-react'
import { sortBy } from 'lodash'
import bip39 from 'bip39'
import base64 from 'base-64'
import base64js from 'base64-js'
import cryptojs from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import cryptocore from 'crypto-js/core'
import randomize from 'randomatic'
import Icon from 'react-native-vector-icons/Feather'
import Button from 'react-native-micro-animated-button'
import SInfo from 'react-native-sensitive-info'
import StellarSdk from 'stellar-sdk'
import SecretList from '../components/SecretList'
import { isNaN } from 'lodash';
import {
  Screen,
  ContainerFlex,
  Header,
  Title,
  LoadButton,
  TextInput,
  ErrorLabel,
  CloseButton,
  CardFlex,
  CardRow,
  CardLabel,
	CardTitle,
	LoadButtonWrapper,
	TitleWrapper,
	MiniPasteButton
} from '../components/utils'

import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })
import crypto from 'crypto';
var Buffer = require('buffer/').Buffer

StellarSdk.Network.useTestNetwork();

@inject('appStore') @observer
class SecretsScreen extends Component {

	static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>My Secrets</Title>
							</TitleWrapper>
							<LoadButtonWrapper>
							<LoadButton onPress={params.toggleAddModal}>
								<Icon name="plus-circle" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>					
					</Header>
				</SafeAreaView>
			)
		};
	};

  state = {
    sk: undefined,
		alias: undefined,
		userPath: undefined,
    hasError: false,
    secrets: []
	}
	
	componentWillMount() {
    this.props.navigation.setParams({ toggleAddModal: this.toggleAddModal });
  }

  componentDidMount() {
		this.loadData();
	}
	
	loadData = () => {
		let self = this;
		db.allDocs({
			include_docs: true
		}).then((res)=> {
			const rawsecrets = res.rows.map((item, index) => item.doc);
			const secrets = sortBy(rawsecrets, 'createdAt').reverse()
			self.setState({ secrets });
		})
	}

  toggleAddModal = () => {
    const { appStore } = this.props
		appStore.set('isAddSecretModalVisible', !appStore.get('isAddSecretModalVisible'))
		const userPath = `${randomize('0',8)}`
		this.setState({ userPath })
  }

  handleInputErrors = () => {
    const { sk, alias } = this.state
  }

  addSecretToStore = () => {
    const { sk, alias } = this.state
    if (!sk || !alias) {
      this.setState({ hasError: true })
      this.addSecretButton.error()
      this.addSecretButton.reset()
    } else {
      this.addSecretButton.success()      
      this.saveSecret({ sk: sk.trim(), alias: alias.trim() })
			this.setState({ hasError: false, sk: undefined, alias: undefined })
			this.toggleAddModal()
    }
	}
	
	encryptSecret = (_id, sk) => {
		const pwd = this.props.appStore.get('pwd');
		var ciphertext = cryptojs.AES.encrypt(sk, `${_id}:${pwd}`);
		SInfo.setItem(_id, ciphertext.toString(), {});
	}

  saveSecret = ({ sk, alias }) => {
		const _id = uuid();
		const keypair = StellarSdk.Keypair.fromSecret(sk);
		const pk = keypair.publicKey();
		try {
			db.put({
				_id,
				alias,
				pk: `${pk.slice(0,8)}...${pk.substr(pk.length - 8)}`,
				sk: `${sk.slice(0,8)}...${sk.substr(sk.length - 8)}`,
				createdAt: new Date().toISOString()
			});
			this.encryptSecret(_id, sk)
			this.loadData();
		} catch (error) {
			alert(error.message)
		}
	}

	getMasterKeyFromSeed = (seed) => {
		const ED25519_CURVE = 'ed25519 seed';
    const hmac = createHmac('sha512', ED25519_CURVE);
    const I = hmac.update(Buffer.from(seed, 'hex')).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
	};

	CKDPriv = ({ key, chainCode }, index) => {
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);

    const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);

    const I = createHmac('sha512', chainCode)
        .update(data)
        .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
	}

	replaceDerive = (val) => val.replace("'", '')

	isValidPath = (path) => {
		const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
    if (!pathRegex.test(path)) {
        return false;
    }
    return !path
        .split('/')
        .slice(1)
        .map(this.replaceDerive)
        .some(isNaN); /* ts T_T*/
	};

	derivePath = (path, seed) => {
		const HARDENED_OFFSET = 0x80000000;

    if (!this.isValidPath(path)) {
        throw new Error('Invalid derivation path');
    }

    const { key, chainCode } = this.getMasterKeyFromSeed(seed);
    const segments = path
        .split('/')
        .slice(1)
        .map(this.replaceDerive)
        .map(el => parseInt(el, 10));

    return segments.reduce(
        (parentKeys, segment) => this.CKDPriv(parentKeys, segment + HARDENED_OFFSET),
        { key, chainCode },
    );
	};

	createNewAccount = () => {
		const { appStore } = this.props
		const { alias, userPath, hasError } = this.state;
		const pwd = appStore.get('pwd');
		const seed = appStore.get('seed');

		const cleanUserPath = userPath.replace('-','');
		const seedHex = bip39.mnemonicToSeedHex(seed);
		const data = this.derivePath(`m/44'/148'/${cleanUserPath}'`, seedHex)
		const keypair = StellarSdk.Keypair.fromRawEd25519Seed(data.key);
		const pk = keypair.publicKey();
		if (!alias) {
			this.setState({ hasError: true });
			this.addSecretButton.error()
      this.addSecretButton.reset()
		} else {
			try {
				const _id = uuid();
				db.put({
					_id,
					pk,
					alias,
					createdAt: new Date().toISOString()
				});
				this.loadData();
				this.toggleAddModal();
				this.setState({ hasError: false, sk: undefined, alias: undefined, userPath: undefined })
			} catch (error) {
				alert(error.message)
			}
		}
	}

  deleteSecret = async doc => {
		try {
			const res = await db.remove(doc);
			this.loadData();
		} catch (error) {
			alert(error.message);
		}
	}
	
	copyToClipboard = (publicKey) => {
		Clipboard.setString(publicKey);
		alert('The public key was copied to the clipboard');
	}

  showSecretAlert = item => {
    Alert.alert(
      `${item.alias}`,
      `${item.pk}`,
      [
        {
          text: 'Delete',
          onPress: () => this.deleteSecret(item),
          style: 'cancel'
        },
        { text: 'Close', onPress: () => this.copyToClipboard(item.pk) } // Do not button
      ],
      { cancelable: false }
    )
	}
	
	pasteHandler = async () => {
    const content = await Clipboard.getString()
		this.setState({ sk: content })
  }

  render() {
    const { appStore } = this.props
    const { sk, alias, userPath, hasError, secrets } = this.state
    const isAddSecretModalVisible = appStore.get('isAddSecretModalVisible')

    return (
			<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
				<Screen>
					<SecretList secrets={secrets} show={this.showSecretAlert} />
					<Modal isVisible={isAddSecretModalVisible}>
						<SafeAreaView style={{ flex: 1 }}>
							<ScrollView
								keyboardShouldPersistTaps="always"
								keyboardDismissMode="interactive"
							>
							<ContainerFlex>
								<CloseButton onPress={this.toggleAddModal}>
									<Icon name="x-circle" color="white" size={32} />
								</CloseButton>
								<CardFlex>
									<TextInput
										autoCorrect={false}
										placeholder="Alias"
										onChangeText={text => this.setState({ alias: text })}
										clearButtonMode={'always'}
										underlineColorAndroid={'white'}
										value={alias}
									/>
									<TextInput
										keyboardType={'numeric'}
										autoCorrect={false}
										onChangeText={text => this.setState({ userPath: text })}
										clearButtonMode={'always'}
										underlineColorAndroid={'white'}
										value={userPath}
									/>									
									<View>
										{hasError && <ErrorLabel>Type an alias for your account.</ErrorLabel>}
									</View>
								</CardFlex>
								<KeyboardAvoidingView>
									<View style={{ flex: 1, flexDirection: 'row', paddingTop: 8, marginBottom: 16, alignSelf: 'center', }}>								
										<Button
												ref={ref => (this.addSecretButton = ref)}
												foregroundColor={'#276cf2'}
												onPress={this.createNewAccount}
												foregroundColor={'white'}
												backgroundColor={'#276cf2'}
												successColor={'#276cf2'}
												errorColor={'#ff3b30'}
												errorIconColor={'white'}
												successIconColor={'white'}
												successIconName="check"
												label="Create KeyPair"
												style={{ borderWidth: 0 }}
											/>				
											{/* <Button
												ref={ref => (this.addSecretButton = ref)}
												foregroundColor={'#4cd964'}
												onPress={this.addSecretToStore}
												foregroundColor={'white'}
												backgroundColor={'#4cd964'}
												successColor={'#4cd964'}
												errorColor={'#ff3b30'}
												errorIconColor={'white'}
												successIconColor={'white'}
												successIconName="check"
												label="Save"
												maxWidth={80}
												style={{ borderWidth: 0, marginLeft: 16}}
											/>																		 */}
									</View>
									<View>
										<Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Create Account Keypair </Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>
											To get started on using the StellarSigner, you must first create an account, then, you must fund the account before start.
										</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>When you create an account with StellarSigner it will generate a new keypair. The keypair consists of two parts:</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>
											<Text style={{ color: 'white', fontSize: 12, fontWeight: '700'}}>Public key:</Text> The public key is used to identify the account. It is also known as an account. This public key is used for receiving funds.
										</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>
											<Text style={{ color: 'white', fontSize: 12, fontWeight: '700'  }}>Secret key:</Text> The secret key is used to access your account and make transactions. Keep this code safe and secure. Anyone with the code will have full access to the account and funds. If you lose the key, you will no longer be able to access the funds and there is no recovery mechanism.
										</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8, fontWeight: '700' }}>Account generation security notes</Text>
										<Text style={{ color: 'white', fontSize: 12 }}>
											The key is generated using a random 32 length string. However, using a secure random number generation does not protect you from a compromised computer. Take great care to make sure your computer is secure and do not run this on a computer you do not trust.
										</Text>
									</View>
								</KeyboardAvoidingView>
							</ContainerFlex>
							</ScrollView>
						</SafeAreaView>
					</Modal>
				</Screen>
			</SafeAreaView>
    )
  }
}

export default SecretsScreen
