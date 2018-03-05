import { observable } from 'mobx';

const initialState = {
	sk: undefined,
	pwd: undefined,
	secretList: undefined,
	isAddModalVisible: false,
	isAddSecretModalVisible: false,
	isSecurityRequired: true,
  isDetailModalVisible: false,
  currentXdr: undefined,
  currentLink: undefined,
	currentTransaction: undefined,
	securityFormError: undefined
}

export default observable.map(initialState);