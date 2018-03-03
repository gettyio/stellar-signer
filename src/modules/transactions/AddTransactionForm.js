
import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Button from 'react-native-micro-animated-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import { observer, inject } from "mobx-react";
import { ContainerFlex, CloseButton, AddTransactionInput, AddTransactionHeaderLabel, ErrorLabel } from './../../shared'
import realm from './../../store/transactions';

@inject("appStore") @observer
class AddTransactionForm extends Component {

  state = {
    inputValue: undefined
  }

  onPressHandler = () => {
    const { appStore } = this.props;
    const  { inputValue } = this.state;
    this.submitXdr(inputValue);
    this.addButton.success();
    setTimeout(()=> {
      appStore.set('isAddModalVisible', false)
    }, 1000)
  }

  submitXdr = (xdr) => {
    const { appStore } = this.props;
    appStore.set('currentXdr', xdr);    
  }

  render() {
    const { appStore, isVisible, type, children } = this.props;
    const { inputValue } = this.state;
    const currentXdr = appStore.get('currentXdr');

    return (
      <ContainerFlex> 
        <AddTransactionHeaderLabel>Add Transaction Envelope</AddTransactionHeaderLabel>
        <AddTransactionInput placeholder="Past your XDR here!" value={inputValue} onChangeText={(inputValue)=> { this.setState({ inputValue })}}  />
        { /** <AddTransactionFormErrorLabel>Invalid XDR!</AddTransactionFormErrorLabel> **/ }
        <View style={{ alignSelf: 'center', paddingTop: 16 }}>
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
            style={{ marginLeft: 16, borderWidth: 0 }}
          />          
        </View>   
      </ContainerFlex>
    )
  }
}

export default AddTransactionForm;