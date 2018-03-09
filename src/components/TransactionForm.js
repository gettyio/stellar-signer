import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'
import Button from 'react-native-micro-animated-button'
import Icon from 'react-native-vector-icons/FontAwesome'
import { observer, inject } from 'mobx-react'

import {
  ContainerFlex,
  Card,
  CloseButton,
  AddTransactionInput,
  AddTransactionHeaderLabel,
  ErrorLabel
} from './utils'

import store from './../store/realm'

@inject('appStore')
@observer
class TransactionForm extends Component {
  state = {
    inputValue: undefined
  }

  onPressHandler = () => {
    const { appStore } = this.props
    const { inputValue } = this.state
    if (inputValue) {
      this.submitXdr(inputValue)
      this.addButton.success()
      this.setState({ errorMessage: undefined })
      setTimeout(() => {
        appStore.set('isAddModalVisible', false)
      }, 1000)
    } else {
      this.setState({ errorMessage: 'Invalid xdr value' })
      this.addButton.reset()
    }
  }

  submitXdr = xdr => {
    const { appStore } = this.props
    appStore.set('currentXdr', xdr)
  }

  render() {
    const { appStore, isVisible, type, children } = this.props
    const { inputValue, errorMessage } = this.state
    const currentXdr = appStore.get('currentXdr')

    return (
      <ContainerFlex>
        <Card style={{ height: 180 }}>
          <AddTransactionHeaderLabel>
            Add Transaction Envelope
          </AddTransactionHeaderLabel>
          <AddTransactionInput
            placeholder="Past your XDR here!"
            value={inputValue}
            onChangeText={inputValue => {
              this.setState({ inputValue })
            }}
          />
          <ErrorLabel>{errorMessage}</ErrorLabel>
        </Card>
        <Button
          ref={ref => (this.addButton = ref)}
          foregroundColor={'white'}
          backgroundColor={'#4cd964'}
          successColor={'#4cd964'}
          errorColor={'#ff3b30'}
          errorIconColor={'white'}
          successIconColor={'white'}
          shakeOnError={true}
          successIconName="check"
          label="Add"
          onPress={this.onPressHandler}
          maxWidth={100}
          style={{
            marginLeft: 16,
            borderWidth: 0,
            alignSelf: 'center',
            marginTop: 16
          }}
        />
      </ContainerFlex>
    )
  }
}

export default TransactionForm