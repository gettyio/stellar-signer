
import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import Modal from 'react-native-modal';

import AddTransactionForm from './AddTransactionForm';

export default ({ isVisible, toggleModal, type, children }) => {
  return (
    <Modal isVisible={isVisible}>
      <AddTransactionForm onPress={toggleModal} />
    </Modal>
  )
}