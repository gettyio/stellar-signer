import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { observer, inject } from "mobx-react";
import Modal from 'react-native-modal';
import cryptocore from 'crypto-js/core';
import base64 from 'base-64';
import base64js from 'base64-js';
import crypto from 'crypto-js/pbkdf2';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from 'react-native-micro-animated-button';
import { Screen, ContainerFlex, Header, Title, LoadButton, TextInput, ErrorLabel, CloseButton, Card, CardRow, CardLabel, CardTitle } from './../shared'
import saltStore from './../store/salt';
import getSecretStore from './../store/secrets';
import AddSecurityForm from './../modules/pinpad/AddSecurityForm';

@inject("appStore") @observer
class SecurePadScreen extends Component {

	submit = (value) => {
		const { appStore } = this.props;
		this.getSecrets(value);
		appStore.set('pwd', value);
	}

	componentWillUnmount() {
		const { realm } = this.state;
		if (realm) {
			realm.removeAllListeners();
		}
	}

	getEncodedSecret = (pwd) => {
		const saltObject = saltStore.objects('Salt')[0];
		if (saltObject) {
			const salt = JSON.parse(saltObject.value);
			const passcode = crypto(pwd, salt, { keySize: 512/64 })
			const encoded = base64.encode(passcode.toString());
			return base64js.toByteArray(encoded);
		}
		return;
	}

	getSecrets = (pwd)=> {
		const { appStore } = this.props;

		try {
			const encodedSecret = this.getEncodedSecret(pwd);
			const secretStore = getSecretStore(encodedSecret);
			const secretList = secretStore.objects('Secret').sorted('alias', true);
			appStore.set('secretList', secretList);
		} catch (error) {
			if (error.message.includes('Unable to open a realm at path')) {
				alert('Invalid secret!')
			} else {
				alert(error.message)
			}
		}
	}

	toggleModal = () => {
    const { appStore } = this.props;
    appStore.set('isSecurityRequired', !appStore.get('isSecurityRequired'));
	}

	render() {
		const { appStore } = this.props;
		const isSecurityRequired = appStore.get('isSecurityRequired');
		return (
			<Modal isVisible={isSecurityRequired}>
				<AddSecurityForm appStore={appStore} submit={this.submit} close={this.toggleModal} />
			</Modal>
		)
	}
}
 
export default SecurePadScreen;

