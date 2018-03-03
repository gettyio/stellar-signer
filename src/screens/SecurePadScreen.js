import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { observer, inject } from "mobx-react";

@inject("appStore") @observer
class SecurePadScreen extends Component {
	render() {
		return (<View />)
	}
}
 
export default SecurePadScreen;