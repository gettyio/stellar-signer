import React, { Component } from 'react';
import {  View, Text, } from 'react-native';
import { observer, inject } from 'mobx-react'

@inject('appStore') @observer
class SaveSeedScreen extends Component {
	render() {
		return (
			<View>
				<Text> textInComponent </Text>
			</View>
		);
	}
}

export default SaveSeedScreen;