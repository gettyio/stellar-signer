
import React, { Component } from 'react';
import {
		View,
		Alert
	} from 'react-native';
import Modal from 'react-native-modal';
import uuid from "uuid/v4";
import { observer, inject } from "mobx-react";
import base64 from 'base-64';
import base64js from 'base64-js';
import crypto from 'crypto-js/pbkdf2';
import Icon from 'react-native-vector-icons/Feather';
import Button from 'react-native-micro-animated-button';
import { Screen, ContainerFlex, Header, Title, LoadButton, TextInput, ErrorLabel, CloseButton, Card, CardRow, CardLabel, CardTitle } from './../shared'
import SecretList from './../modules/secrets/SecretList';
import saltStore from './../store/salt';
import getSecretStore from './../store/secrets';

@inject("appStore") @observer
class SecretsScreen extends Component {

	state = {
		sk: undefined,
		alias: undefined,
		hasError: false,
		secrets: []
	}

	componentDidMount() {
		this.getSecrets();
	}

	componentWillUnmount() {
		const { realm } = this.state;
		if (realm) {
			realm.removeAllListeners();
		}
	}

	getSecrets = ()=> {
		const { appStore } = this.props;
		const saltObject = saltStore.objects('Salt')[0];
		try {
			if (saltObject) {
				const pwd = appStore.get('pwd');
				if (pwd) {
					const salt = JSON.parse(saltObject.value);
					const passcode = crypto(pwd, salt, { keySize: 512/64 })
					const encoded = base64.encode(passcode.toString());
					const secret = base64js.toByteArray(encoded);
					const { realm } = this.state;
					if (!realm) {
						const secretStore = getSecretStore(secret);
						const secrets = secretStore.objects('Secret').sorted('alias', true);
						secretStore.addListener('change', this.getSecrets);
						this.setState({ realm: secretStore, secrets });
					} else {
						const secrets = realm.objects('Secret').sorted('alias', true);
						realm.addListener('change', this.getSecrets);
						this.setState({ realm, secrets });
					}
				} else {
					alert('Ask Password');
				}
			}
		} catch (error) {
			if (error.message.includes('Unable to open a realm at path')) {
				alert('Invalid secret!')
			} else {
				alert(error.message)
			}
		}
	}

	toggleAddModal = () => {
    const { appStore } = this.props;
    appStore.set('isAddSecretModalVisible', !appStore.get('isAddSecretModalVisible'));
	}

	handleInputErrors = () => {
		const { sk, alias } = this.state;
	}
	
	addSecretToStore = ()=> {
		const { sk, alias } = this.state;
		if (!sk || !alias) {
			this.setState({ hasError: true });
			this.addSecretButton.error();
			this.addSecretButton.reset();
		} else {
			this.addSecretButton.success();
			this.toggleAddModal();
			this.saveSecret({ sk, alias });
			this.setState({ hasError: false, sk: undefined, alias: undefined });
		}
	}

	saveSecret = (secret) => {
		const { realm } = this.state;
		if (realm) {
			try {
				realm.write(() => {
					realm.create('Secret', { id: uuid(), createdAt: new Date(), ...secret });
				});
			} catch (error) {
				if (error.message.includes('Attempting to create an object of type \'Secret\' with an existing primary key value')) {
					setTimeout(()=> alert('A secret with this alias already exists. Please, choose another alias.'), 1000)
				}
			}
		}
	}

	deleteSecret = (item)=> {
		const { realm } = this.state;
    setTimeout(()=> {
      realm.write(() => {
        realm.delete(item);
      });
    }, 100);
	}
	
	showSecretAlert = (item) => {
		Alert.alert(
			`${item.alias}`,
			`${item.sk}`,
			[
				{text: 'Delete', onPress: () => this.deleteSecret(item), style: 'cancel'},
				{text: 'Close', onPress: () => { }}, // Do not button
			],
			{ cancelable: false }
		)
	}


  render() {
		const { appStore } = this.props;
		const { sk, alias, hasError, secrets } = this.state;
		const isAddSecretModalVisible = appStore.get('isAddSecretModalVisible');
		
    return (
      <Screen>
        <Header>
          <Title>My Secrets</Title>
					<LoadButton onPress={this.toggleAddModal}>
              <Icon name="plus-circle" color="white" size={32}></Icon>
          </LoadButton>
        </Header>
				<SecretList secrets={secrets} show={this.showSecretAlert} />
				<Modal isVisible={isAddSecretModalVisible}>
					<ContainerFlex>
						<CloseButton onPress={this.toggleAddModal}>
              <Icon name="x-circle" color="white" size={32}></Icon>
            </CloseButton>
						<Card>
							<TextInput placeholder="Label" onChangeText={(alias)=> this.setState({ alias })} clearButtonMode={'always'} value={alias} />
							<TextInput placeholder="Secret Key" onChangeText={(sk)=> this.setState({ sk })} clearButtonMode={'always'} value={sk} />
							<View>
							{ hasError && (<ErrorLabel>Invalid secret or label.</ErrorLabel>)	}
							</View>
						</Card>
						<View style={{ alignSelf: 'center', paddingTop: 16 }}>
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
								maxWidth={100}
								style={{ marginLeft: 16, borderWidth: 0 }}
							/> 
						</View>

					</ContainerFlex>
				</Modal>
      </Screen>
    )
  }
}

export default SecretsScreen;