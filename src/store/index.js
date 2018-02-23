import { observable } from 'mobx';

const initialState = {
  isModalVisible: false
}

export default observable.map(initialState);