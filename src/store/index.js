import { AsyncStorage } from 'react-native'
import { observable, action } from 'mobx'

// App Initial State
const appStore = {
  sk: undefined,
	pwd: undefined,
	seed: undefined,
  secretList: undefined,
  isAddModalVisible: false,
  isAddSecretModalVisible: false,
  isSecurityRequired: false,
  isDetailModalVisible: false,
  currentXdr: undefined,
  currentLink: undefined,
  currentTransaction: undefined,
  securityFormError: undefined
}

// create the state
export default observable.map(appStore)
