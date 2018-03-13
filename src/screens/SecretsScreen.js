import React, { Component } from 'react'
import { View, Text, ScrollView, Alert, Dimensions, KeyboardAvoidingView, SafeAreaView, Clipboard, Keyboard } from 'react-native'
import Modal from 'react-native-modal'
import uuid from 'uuid/v4'
import { observer, inject } from 'mobx-react'
import base64 from 'base-64'
import base64js from 'base64-js'
import cryptojs from 'crypto-js'
import cryptocore from 'crypto-js/core'
import Icon from 'react-native-vector-icons/Feather'
import Button from 'react-native-micro-animated-button'
import SInfo from 'react-native-sensitive-info';
import { Keypair } from 'stellar-sdk';
import SecretList from '../components/SecretList'
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

@inject('appStore') @observer
class SecretsScreen extends Component {
  state = {
    sk: undefined,
    alias: undefined,
    hasError: false,
    secrets: []
  }

  componentDidMount() {
		this.loadData();
	}
	
	loadData = () => {
		let self = this;
		db.allDocs({
			include_docs: true
		}).then((res)=> {
			self.setState({ secrets: res.rows, isLoadingList: false });
		})
	}

  toggleAddModal = () => {
    const { appStore } = this.props
    appStore.set('isAddSecretModalVisible', !appStore.get('isAddSecretModalVisible'))
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
      this.toggleAddModal()
      this.saveSecret({ sk: sk.trim(), alias: alias.trim() })
      this.setState({ hasError: false, sk: undefined, alias: undefined })
    }
	}
	
	encryptSecret = (_id, sk) => {
		const pwd = this.props.appStore.get('pwd');
		var ciphertext = cryptojs.AES.encrypt(sk, `${_id}:${pwd}`);
		SInfo.setItem(_id, ciphertext.toString(), {});
	}

  saveSecret = ({ sk, alias }) => {
		const _id = uuid();
		try {
			db.put({
				_id,
				alias,
				sk: `${sk.slice(0,8)}...${sk.substr(sk.length - 8)}`,
				createdAt: new Date().toISOString()
			});
			this.encryptSecret(_id, sk)
			this.loadData();
		} catch (error) {
			alert(error.message)
		}
	}

	createNewAccount = () => {
		const secret = Keypair.random(32);
		const keypair = Keypair.fromRawEd25519Seed(secret);
		const pk = keypair.publicKey();
		const sk = keypair.secret();
		const _id = uuid();
		try {
			db.put({
				_id,
				alias: pk,
				sk: `${secretkey.slice(0,8)}...${secretkey.substr(secretkey.length - 8)}`,
				createdAt: new Date().toISOString()
			});
			this.encryptSecret(_id, sk)
			this.loadData();
		} catch (error) {
			alert(error.message)
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

  showSecretAlert = item => {
    Alert.alert(
      `${item.alias}`,
      `${item.sk}`,
      [
        {
          text: 'Delete',
          onPress: () => this.deleteSecret(item),
          style: 'cancel'
        },
        { text: 'Close', onPress: () => {} } // Do not button
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
    const { sk, alias, hasError, secrets } = this.state
    const isAddSecretModalVisible = appStore.get('isAddSecretModalVisible')

    return (
			<SafeAreaView style={{ backgroundColor: 'blue' }}>
				<Screen>
					<Header>
							<TitleWrapper>
								<Title>My Secrets</Title>
								</TitleWrapper>
								<LoadButtonWrapper>
								<LoadButton onPress={this.toggleAddModal}>
									<Icon name="plus-circle" color="white" size={32} />
								</LoadButton>
						</LoadButtonWrapper>					
					</Header>
					<SecretList secrets={secrets} show={this.showSecretAlert} />
					<Modal isVisible={isAddSecretModalVisible}>
						<SafeAreaView style={{ flex: 1 }}>
							<ScrollView>
							<ContainerFlex>
								<CloseButton onPress={this.toggleAddModal}>
									<Icon name="x-circle" color="white" size={32} />
								</CloseButton>
								<CardFlex>
									<TextInput
										autoCorrect={false}
										placeholder="Label"
										onChangeText={alias => this.setState({ alias })}
										clearButtonMode={'always'}
										underlineColorAndroid={'white'}
										value={alias}
									/>
									<View style={{ flexDirection: 'row' }}>
										<TextInput
											autoCorrect={false}
											placeholder="Secret Key"
											onChangeText={sk => this.setState({ sk })}
											clearButtonMode={'always'}
											underlineColorAndroid={'white'}
											value={sk}
											style={{ flex: 1, marginRight: 16, }}
										/>
										<MiniPasteButton onPress={this.pasteHandler}>
											<Icon name="file-text" color="gray" size={24} />
										</MiniPasteButton>
									</View>
									<View>
										{hasError && <ErrorLabel>Invalid secret or label.</ErrorLabel>}
									</View>
								</CardFlex>
								<KeyboardAvoidingView>
									<View style={{ flex: 1, flexDirection: 'row', paddingTop: 8 }}>								
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
												label="Create New Account"
												style={{ borderWidth: 0 }}
											/>				
											<Button
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
											/>																		
									</View>
									<View>
										<Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Create Account Keypair </Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>
											To get started on using the Stellar network, you must first create a keypair. The keypair consists of two parts:
										</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>
											<Text style={{ color: 'white', fontSize: 12, fontWeight: '700'}}>Public key:</Text> The public key is used to identify the account. It is also known as an account. This public key is used for receiving funds.
										</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8 }}>
											<Text style={{ color: 'white', fontSize: 12, fontWeight: '700'  }}>Secret key:</Text> The secret key is used to access your account and make transactions. Keep this code safe and secure. Anyone with the code will have full access to the account and funds. If you lose the key, you will no longer be able to access the funds and there is no recovery mechanism.
										</Text>
										<Text style={{ color: 'white', fontSize: 12, marginBottom: 8, fontWeight: '700' }}>Account generation security notes</Text>
										<Text style={{ color: 'white', fontSize: 12 }}>
											The key is generated using entropy from crypto randomBytes function which uses getRandomValues. However, using a secure random number generation does not protect you from a compromised computer. Take great care to make sure your computer is secure and do not run this on a computer you do not trust.
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
