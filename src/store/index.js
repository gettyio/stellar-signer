import { observable } from 'mobx';

const initialState = {
  isAddModalVisible: false,
  isDetailModalVisible: false,
  currentXdr: undefined,
  currentLink: undefined,
  currentTransaction: undefined
}

export default observable.map(initialState);