import React, { Component } from 'react';
import {  View, Text, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { observer, inject } from 'mobx-react'
import bip39 from 'bip39';
import Icon from 'react-native-vector-icons/Feather'
import styled from 'styled-components'
import Button from 'react-native-micro-animated-button'
import randomize from 'randomatic'
import DeviceInfo from 'react-native-device-info'
import cryptojs from 'crypto-js'
import sha256 from 'crypto-js/sha256';
import SInfo from 'react-native-sensitive-info';
import {
  Screen,
  ContainerFlex,
  Header,
	Title,
	TitleWrapper,
	LoadButtonWrapper,
	LoadButton,
	HeaderTabs,
	HeaderTabsButton,
	HeaderTabsLabel,
	ErrorLabel
} from '../components/utils'


export const SeedInput = styled.TextInput`
	width: 100%;
  background-color: white;
  border-radius: 8px;
	border-width: 1px;
	border-color: ${props => {
		if (!props.noState) {
			return '#cecece'
		} else {
			if (props.hasError) {
				return 'red'
			} else {
				return '#4cd964'
			}
		}
	}};
  padding: 16px;
  align-self: center;
`

@inject('appStore') @observer
class CreateVaultScreen extends Component {

	static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>My Vault</Title>
						</TitleWrapper>
						<LoadButtonWrapper>
							<LoadButton onPress={()=> navigation.goBack()}>
								<Icon name="x-circle" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>						
					</Header>
				</SafeAreaView>
			)
		};
	}

	state = {
		tab: 'create',
		seedValue: undefined,
		seedConfirmation: undefined
	}
	
	componentDidMount() {
		const seedValue = bip39.generateMnemonic(512, (n)=> randomize('0',n));
		this.setState({ seedValue })
	}

	setCurrentTab = (tab) => {
		this.setState({ tab })
	}

	createSeed = () => {
		const { seedValue } = this.state;
		const { appStore, navigation } = this.props
		try {
			const pwd = appStore.get('pwd')
			const uniqueId = DeviceInfo.getUniqueID();
			const seedKey = sha256(`ss-${uniqueId}`);
			const pass = sha256(`ss-${uniqueId}-${pwd}`);
			var ciphertext = cryptojs.AES.encrypt(seedValue.trim(), pass.toString());
			SInfo.setItem(seedKey.toString(), ciphertext.toString(), {});
			this.createSeedButton.success();
			navigation.navigate('Home')
		} catch (error) {
			alert(error.message);
		}
	}

	restoreSeed = () => {

	}

	renderCreateTab = () => {
		const { seedValue, seedConfirmation } = this.state;
		if (seedValue) {

			let enableSaveButton = true;
			let errorMessage = undefined;
			if (seedConfirmation) {
				errorMessage = seedValue !== seedConfirmation ? 'Invalid seed confirmation' : undefined;
				enableSaveButton = (errorMessage === undefined) ? false  : true;
			}

			return (
				<View>
					<SeedInput 
						multiline
						autoGrow
						noState={seedConfirmation}
						hasSuccess={errorMessage}
						hasError={errorMessage}
						autoCorrect={false}
						value={seedValue}
						numberOfLines={20}
						autoFocus={false}
						editable={false}
						spellCheck={false}
						autoCapitalize={'none'}
						clearTextOnFocus={false}
						clearButtonMode={'always'}
						placeholder={'Type your seed'}
					>
					</SeedInput>

					<SeedInput 
						multiline
						autoGrow
						noState={seedConfirmation}
						hasSuccess={errorMessage}
						hasError={errorMessage}
						value={seedConfirmation}
						numberOfLines={20}
						autoCorrect={false}
						editable={true}
						spellCheck={false}
						autoCapitalize={'none'}
						clearTextOnFocus={false}
						clearButtonMode={'always'}
						placeholder={'Confirm your seed'}
						style={{ marginTop: 16 }}
						onChangeText={text => this.setState({ seedConfirmation: text })}
					>
					</SeedInput>
          <View>
            <ErrorLabel>{errorMessage}</ErrorLabel>
          </View>
					<KeyboardAvoidingView  behavior="position">
						<View style={{ alignSelf: 'center' }}>
							<Button
								ref={ref => (this.createSeedButton = ref)}
								disabled={enableSaveButton}
								foregroundColor={'#4cd964'}
								onPress={this.createSeed}
								foregroundColor={'white'}
								backgroundColor={'#4cd964'}
								successColor={'#4cd964'}
								errorColor={'#ff3b30'}
								errorIconColor={'white'}
								successIconColor={'white'}
								successIconName="check"
								label="Create"
								maxWidth={100}
								style={{ marginLeft: 16, borderWidth: 0 }}
							/>
						</View>
					</KeyboardAvoidingView>
				</View>
			)
		}
	}

	renderRestoreTab = () => {
		const { mnemonic } = this.state;
		return (
			<SeedInput 
				multiline
				autoCorrect
				autoFocus
				autoGrow
				value={mnemonic}
				numberOfLines={20}
				spellCheck={false}
				autoCapitalize={'none'}
				clearTextOnFocus={false}
				clearButtonMode={'always'}
				placeholder={'Type your seed'}
			>
			</SeedInput>
		)
	}

	renderTab = (tab) => {
    switch (tab) {
      case 'create':
        return this.renderCreateTab();
      case 'restore':
        return this.renderRestoreTab();
      default:
        return null
    }
  }
	
	render() {
		const { tab } = this.state;
		return (
			<View>
				<View>
					<HeaderTabs>
						<HeaderTabsButton onPress={()=> this.setCurrentTab('create')}>
							<HeaderTabsLabel name={'create'} tab={tab}>Create Vault </HeaderTabsLabel>
						</HeaderTabsButton>
						<HeaderTabsButton onPress={()=> this.setCurrentTab('restore')}>
							<HeaderTabsLabel name={'restore'} tab={tab}>Restore Vault</HeaderTabsLabel>
						</HeaderTabsButton>
					</HeaderTabs>
				</View>
				<View style={{ padding: 16 }}>
					{this.renderTab(tab)}
				</View>
			</View>
		);
	}
}

export default CreateVaultScreen;