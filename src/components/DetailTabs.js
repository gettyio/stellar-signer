import React, { Component } from 'react';
import {  View, Text, ScrollView } from 'react-native';
import styled from 'styled-components'
import EnvelopeCard from './EnvelopeCard'
import EnvelopeTab from './EnvelopeTab'
import {
  Screen,
} from './utils'
const DetailTabsHeader = styled.View`
	flex-direction: row;
  background-color: #d5eef7;
`

const HeaderButton = styled.TouchableOpacity`
	flex: 1;
	justify-content: center;
  padding: 24px;
  background-color: white;
`

const HeaderLabel = styled.Text`
	align-self: center;
  color: black;
	font-weight: ${props => (props.name === props.tab ? '700' : '300' )};
`

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
        return <EnvelopeTab tx={currentTransaction.xdr} />
      case 'signed':
        return <EnvelopeTab tx={currentTransaction.sxdr} />
      default:
        return null
    }
  }

	render() {
		const { tab } = this.state;
		return (
			<Screen>
				<View>
					<DetailTabsHeader>
						<HeaderButton onPress={()=> this.setCurrentTab('display')}>
							<HeaderLabel name={'display'} tab={tab}>Display</HeaderLabel>
						</HeaderButton>
						<HeaderButton onPress={()=> this.setCurrentTab('envelope')}>
							<HeaderLabel name={'envelope'} tab={tab}>Envelope</HeaderLabel>
						</HeaderButton>
						<HeaderButton onPress={()=> this.setCurrentTab('signed')}>
							<HeaderLabel name={'signed'} tab={tab}>Signature</HeaderLabel>
						</HeaderButton>										
					</DetailTabsHeader>
				</View>
				<ScrollView
					keyboardShouldPersistTaps="always"
					keyboardDismissMode="interactive"
				>
					{this.renderTab(tab)}
				</ScrollView>
			</Screen>
		);
	}
}

export default DetailTabs;