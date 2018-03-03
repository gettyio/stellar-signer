import React, { Component } from 'react';
import {
		View,
		ActivityIndicator,
		FlatList,
		Text,
		Image
  } from 'react-native';
import { observer, inject } from "mobx-react";
import utf8 from 'utf8';
import base64 from 'base-64';
import base64js from 'base64-js';
import { Container, EmptyScreen } from './../../shared';
import SecretRow from './SecretRow';
import saltStore from './../..//store/salt';
import getSecretStore from './../../store/secrets';
import crypto from 'crypto-js/pbkdf2';

@inject("appStore") @observer
class SecretList extends Component {

	state = {
		sk: undefined,
		realm: undefined,
    secrets: [],
    hasError: undefined,
    isLoadingList: false,
	}

	componentDidMount() {
		this.getSecrets();
	}

	getSecrets = ()=> {
		const saltObject = saltStore.objects('Salt')[0];
		if (saltObject) {
			const salt = JSON.parse(saltObject.value);
			const passcode = crypto("Secret Passphrase", salt, { keySize: 512/64 })
			const encoded = base64.encode(passcode.toString());
			const secret = base64js.toByteArray(encoded);

			const { appStore } = this.props;
			const { sk, realm } = this.state;
			if (!sk) {
				const usk = appStore.get('sk');
				if (!realm) {
					const realm = getSecretStore(secret);
					realm.addListener('change', this.refreshList);
					this.setState({ realm, sk });
					this.refreshList();
				}
			}
		}
	}

  refreshList = ()=> {
		const { realm } = this.state;
		if (realm) {
			const secrets = realm.objects('Secret').sorted('alias', true);
			console.warn('secrets',secrets)
			if (secrets) {
				this.setState({ secrets });
			}
		}
	}
	
	renderRow = ({ item })=> {
    const { appStore } = this.props;
    return (
      <SecretRow item={item} appStore={appStore}/>
    );
  }
	
	render() {
    const { isLoadingList, hasError, secrets } = this.state;
    
    if (isLoadingList) {
      return (
        <View style={{ flex: 1, marginTop: 64 }}>
          <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
        </View>
      );
    }

    if (hasError) {
      return (
        <View full={true} justify="center" align="center">
          <Text>Error</Text>
        </View>
      );
    }

    if (secrets.length < 1) {
      return (
        <EmptyScreen>
          <Image 
            source={require('./../../shared/empty.png')} 
            resizeMode="contain" 
            style={{ width: 170 }}  
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>No Secrets Found!</Text>
        </EmptyScreen>         
      )
    }

    return (
      <FlatList
        data={secrets}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => `${item.id}`}
      />
    );
	}
}

export default SecretList;
