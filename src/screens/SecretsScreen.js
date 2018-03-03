
import React, { Component } from 'react';
import {
    View
	} from 'react-native';
import Modal from 'react-native-modal';
import uuid from "uuid/v4";
import { observer, inject } from "mobx-react";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Screen, Container, Header, Title, LoadButton, TextInput, CloseButton } from './../shared'
import SecretList from './../modules/secrets/SecretList';

@inject("appStore") @observer
class SecretsScreen extends Component {

  render() {
    return (
      <Screen>
        <Header>
          <Title>My Secrets</Title>
					<LoadButton onPress={this.toggleAddModal}>
              <Icon name="plus-circle" color="white" size={32}></Icon>
          </LoadButton>
        </Header>
				<SecretList />
      </Screen>
    )
  }
}

export default SecretsScreen;