import { observable } from 'mobx';

const initialState = {
	sk: undefined,
	pwd: undefined,
	isAddModalVisible: false,
	isAddSecretModalVisible: false,
	isSecurityRequired: true,
  isDetailModalVisible: false,
  currentXdr: undefined,
  currentLink: undefined,
	currentTransaction: undefined
}

export default observable.map(initialState);