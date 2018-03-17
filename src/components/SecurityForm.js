import React, { Component } from 'react'
import { View, Alert, Text, KeyboardAvoidingView } from 'react-native'
import uuid from 'uuid/v4'
import Icon from 'react-native-vector-icons/FontAwesome'
import Button from 'react-native-micro-animated-button'

import {
  ContainerFlex,
  TextInput,
  ErrorLabel,
  CloseButton,
  CardFlex,
  SmallMessageLabel,
	PasswordFormTitle
} from './utils'

class SecurityForm extends Component {
  state = {
    password: '12345678',
    errorMessage: undefined
  }

  savePassword = () => {
    const { close, error, submit } = this.props
    const { password } = this.state

    if (!password || (password && password.length < 8)) {
      this.setState({
        errorMessage: 'Passwords must be at least 8 characters.'
      })
      this.savePasswordButton.error()
      this.savePasswordButton.reset()
      return
    } else {
      this.savePasswordButton.success()
      this.savePasswordButton.reset()
    }

    this.setState({ errorMessage: undefined })
    submit(password)
  }

  render() {
    const { hideClose, close, submit, error, version } = this.props
    const { password, hasError, errorMessage } = this.state

    if (error) {
      setTimeout(() => this.savePasswordButton.reset(), 0)
    }

    return (
      <View style={{ padding: 16, backgroundColor: 'white' }}>
        {hideClose && (
          <CloseButton onPress={close}>
            <Icon name="times-circle" color="white" size={32} />
          </CloseButton>
        )}
        <CardFlex>
          <PasswordFormTitle testID='passwordTitle'>Type a password to continue.</PasswordFormTitle>
          <TextInput
            autoFocus={false}
            autoCorrect={false}
            autoCapitalize={'none'}
            clearButtonMode={'always'}
            placeholder="Password"
            onChangeText={password => this.setState({ password })}
						value={password}
						underlineColorAndroid={'white'}
          />
          <View>
            {errorMessage && <ErrorLabel>{errorMessage}</ErrorLabel>}
            {error && <ErrorLabel>{error}</ErrorLabel>}
          </View>
          <SmallMessageLabel>
					Enter the passphrase that should be used to protect your secrets. This passphrase is specific for this device and will be stored in a secure storage on your phone.
					Make sure to remember the password, as you'll need it when you sign transactions with StellarSigner. Keep your passphrase secure.
          </SmallMessageLabel>
        </CardFlex>
        <KeyboardAvoidingView  behavior="position">
          <View style={{ alignSelf: 'center' }}>
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
      </View>
    )
  }
}

export default SecurityForm
