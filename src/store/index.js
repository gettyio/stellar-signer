import { observable } from 'mobx';

const initialState = {
  isModalVisible: false,
  currentXdr: undefined,
  currentLink: undefined,
  currentTransaction: undefined
}

export default observable.map(initialState);