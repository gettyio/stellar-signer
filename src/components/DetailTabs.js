import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styled from 'styled-components'
import EnvelopeCard from './EnvelopeCard'
import EnvelopeTab from './EnvelopeTab'
import {
	Screen,
	HeaderTabs,
	HeaderTabsButton,
	HeaderTabsLabel
} from './utils'


class DetailTabs extends Component {

	state = {
		tab: 'display'
	}

	setCurrentTab = (tab) => {
		this.setState({ tab })
	}

	renderTab = (tab) => {
		const {
			currentTransaction,
			copyToClipboard,
			showConfirmDelete,
			rejectTransaction,
			signTransaction
		} = this.props;
		const xdr = currentTransaction.xdr;
		switch (tab) {
			case 'display':
				return (
					<EnvelopeCard
						tx={currentTransaction}
						copyToClipboard={copyToClipboard}
						showConfirmDelete={showConfirmDelete}
						rejectTransaction={rejectTransaction}
						signTransaction={signTransaction}
					/>
				)
			case 'envelope':
				return <EnvelopeTab tx={xdr} />
			default:
				return null
		}
	}

	render() {
		const { tab } = this.state;
		return (
			<View>
				<View>
					<HeaderTabs>
						<HeaderTabsButton onPress={() => this.setCurrentTab('display')}>
							<HeaderTabsLabel name={'display'} tab={tab}>Display</HeaderTabsLabel>
						</HeaderTabsButton>
						<HeaderTabsButton onPress={() => this.setCurrentTab('envelope')}>
							<HeaderTabsLabel name={'envelope'} tab={tab}>Envelope</HeaderTabsLabel>
						</HeaderTabsButton>
						{/* <HeaderTabsButton onPress={()=> this.setCurrentTab('signed')}>
							<HeaderTabsLabel name={'signed'} tab={tab}>Signature</HeaderTabsLabel>
						</HeaderTabsButton>*/}
					</HeaderTabs>
				</View>
				<ScrollView
					keyboardShouldPersistTaps="always"
					keyboardDismissMode="interactive"
				>
					{this.renderTab(tab)}
				</ScrollView>
			</View>
		);
	}
}

export default DetailTabs;