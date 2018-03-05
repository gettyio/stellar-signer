
import React, { Component } from 'react';
import {
		View,
		Alert,
		Text,
		KeyboardAvoidingView
	} from 'react-native';
import uuid from "uuid/v4";
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from 'react-native-micro-animated-button';
import { ContainerFlex, TextInput, ErrorLabel, CloseButton, Card, SmallMessageLabel, PasswordFormTitle } from './../../shared'

class AddSecurityForm extends Component {
	
	state = {
		password: '12345678',
		errorMessage: undefined
	}

	savePassword = () => {
		const { close, error, submit } = this.props;
		const { password } = this.state;

		if (!password || (password && password.length < 8)) {
			this.setState({ errorMessage: 'Passwords must be at least 8 characters.' });
			this.savePasswordButton.error();
			this.savePasswordButton.reset();
			return;
		}

		this.savePasswordButton.success();
		this.setState({ errorMessage: undefined });
		submit(password);
	}

	render() { 
		const { hideClose, close, submit, error } = this.props;
		const { password, hasError, errorMessage } = this.state;

		if (error) {
			setTimeout(()=> this.savePasswordButton.reset(), 0);
		}

		return (
			<ContainerFlex>
				{
					hideClose && (
						<CloseButton onPress={close}>
							<Icon name="times-circle" color="white" size={32}></Icon>
						</CloseButton>
					)
				}
				<Card>
					<PasswordFormTitle>Type a password to continue.</PasswordFormTitle>
					<TextInput 
						autoCorrect={false}
						clearButtonMode={'always'} 
						placeholder="Password" 
						onChangeText={(password)=> this.setState({ password })} 
						autoFocus={true} value={password} 
					/>
					<View>
					{ errorMessage && (<ErrorLabel>{errorMessage}</ErrorLabel>)	}
					{ error && (<ErrorLabel>{error}</ErrorLabel>)	}
					</View>
					<SmallMessageLabel>Keep your password secure. This password will be asked to encrypt and decrypt your secrets. Stellar Signer does not save it and will not be able to help you recover it if lost.</SmallMessageLabel>
					
				</Card>
			<KeyboardAvoidingView>
			<View style={{ alignSelf: 'center', paddingTop: 16 }}>
				<Button 
					ref={ref => (this.savePasswordButton = ref)}
					foregroundColor={'#4cd964'}
					onPress={this.savePassword}
					foregroundColor={'white'}
					backgroundColor={'#4cd964'}
					successColor={'#4cd964'}
					errorColor={'#ff3b30'}
					errorIconColor={'white'}
					successIconColor={'white'}							
					successIconName="check" 
					label="Ok"
					maxWidth={100}
					style={{ marginLeft: 16, borderWidth: 0 }}
				/> 
			</View>
			</KeyboardAvoidingView>
		</ContainerFlex>			
		)
	}
}
 
export default AddSecurityForm;