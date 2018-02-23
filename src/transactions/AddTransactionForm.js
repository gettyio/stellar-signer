
import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Button from 'react-native-micro-animated-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import { observer, inject } from "mobx-react";
import { Container, CloseButton, AddTransactionInput, AddTransactionHeaderLabel, AddTransactionFormErrorLabel } from './../shared'
import realm from './../store/realm';

@inject("appStore") @observer
class AddTransactionForm extends Component {

  onPressHandler = () => {
    const { appStore } = this.props;
    this.addButton.success();
    setTimeout(()=> {
      appStore.set('isModalVisible', false)
    }, 1000)
  }

  toggleModal = () => {
    const { appStore } = this.props;
    appStore.set('isModalVisible', !appStore.get('isModalVisible'));
  }

  handleXdrInput = (text) => {
    console.log('text',text)
    const { appStore } = this.props;
    appStore.set('currentXdr', text);    
  }

  render() {
    const { appStore, isVisible, toggleModal, type, children } = this.props;
    const currentXdr = appStore.get('currentXdr');
    return (
      <Container> 
        <CloseButton onPress={this.toggleModal}>
          <Icon name="times-circle" color="white" size={32}></Icon>
        </CloseButton>
        <AddTransactionHeaderLabel>Add Transaction Envelope</AddTransactionHeaderLabel>
        <AddTransactionInput placeholder="Past your XDR here!" value={currentXdr} onChangeText={this.handleXdrInput}  />
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
            onPress={this.onPressHandler}
            successIconName="check" 
            label="Add"
            maxWidth={100}
            style={{ marginLeft: 16, borderWidth: 0 }}
          />          
        </View>   
      </Container>
    )
  }
}

export default AddTransactionForm;