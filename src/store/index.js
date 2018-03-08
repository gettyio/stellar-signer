import { observable } from 'mobx'

const initialState = {
  sk: undefined,
  pwd: '12345678',
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

export default observable.map(initialState)
