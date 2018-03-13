import React, { Component } from 'react'
import { SafeAreaView } from 'react-native'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import crypto from 'crypto-js'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/FontAwesome'
import Button from 'react-native-micro-animated-button'
import SInfo from 'react-native-sensitive-info';
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

import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class SecurePadScreen extends Component {

	state = {
		firstSecret: undefined
	}

	componentDidMount() {
		const self = this;
		try {
			db.allDocs({
				include_docs: true
			}).then((res)=> {
				const row = res.rows[0];
				if (row) {
					this.setState({ firstSecret: row.doc })
				}
			})
		} catch (error) {
			appStore.set('securityFormError', 'Invalid password!')
		}
	}

  submit = pwd => {
		const { appStore } = this.props
		const { firstSecret } = this.state;
		try {
			if (firstSecret) {
				SInfo.getItem(firstSecret._id,{}).then(value => {
					const bytes = crypto.AES.decrypt(value, `${firstSecret._id}:${pwd}`);
					const val =  bytes.toString(crypto.enc.Utf8)
					if (val) {
						appStore.set('pwd', pwd)
						appStore.set('securityFormError', undefined)
						appStore.set('isSecurityRequired', false)
					} else {
						appStore.set('securityFormError', 'Invalid password!')
					}

				}).catch(err => {
					appStore.set('securityFormError', 'Invalid password!')
				})
			} else {
				appStore.set('pwd', pwd)
				appStore.set('securityFormError', undefined)
				appStore.set('isSecurityRequired', false)
			}
		} catch (error) {
			appStore.set('securityFormError', 'Invalid password!')
		}
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
				<SafeAreaView style={{ flex: 1, alignContent: 'flex-start', }}>
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
