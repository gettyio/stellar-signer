import React, { Component } from 'react'
import { SafeAreaView } from 'react-native'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/FontAwesome'
import Button from 'react-native-micro-animated-button'
import SecurityForm from '../components/SecurityForm'
import {
  Screen,
  ContainerFlex,
  Header,
  Title,
  LoadButton,
  TextInput,
  ErrorLabel,
  CloseButton,
  Card,
  CardRow,
  CardLabel,
  CardTitle
} from '../components/utils'

// import store from './../store/realm'
// import getSecretStore from './../store/secrets'

@inject('appStore')
@observer
class SecurePadScreen extends Component {
  submit = value => {
    const { appStore } = this.props
		appStore.set('pwd', value)
		appStore.set('securityFormError', undefined)
		appStore.set('isSecurityRequired', false)
  }

  toggleModal = () => {
    const { appStore } = this.props
    appStore.set('isSecurityRequired', !appStore.get('isSecurityRequired'))
  }

  render() {
    const { appStore } = this.props
    const isSecurityRequired = appStore.get('isSecurityRequired')
    const securityFormError = appStore.get('securityFormError')
    return (
      <Modal isVisible={isSecurityRequired}>
				<SafeAreaView style={{ flex: 1 }}>
					<SecurityForm
						appStore={appStore}
						submit={this.submit}
						error={securityFormError}
						close={this.toggleModal}
					/>
				</SafeAreaView>
      </Modal>
    )
  }
}

export default SecurePadScreen
