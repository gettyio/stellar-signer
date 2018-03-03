import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { observer, inject } from "mobx-react";
import Modal from 'react-native-modal';
import cryptocore from 'crypto-js/core';
import Button from 'react-native-micro-animated-button';
import AddSecurityForm from './../modules/pinpad/AddSecurityForm';

@inject("appStore") @observer
class SecurePadScreen extends Component {

	submit = (value) => {
		const { appStore } = this.props;
		appStore.set('pwd', value);
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

