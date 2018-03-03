import { observable } from 'mobx';

const initialState = {
	sk: undefined,
	isAddModalVisible: false,
	isAddSecretModalVisible: false,
  isDetailModalVisible: false,
  currentXdr: undefined,
  currentLink: undefined,
	currentTransaction: undefined
}

export default observable.map(initialState);