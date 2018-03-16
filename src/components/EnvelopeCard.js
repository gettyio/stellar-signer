import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { Text, View, TouchableOpacity, Clipboard, ScrollView } from 'react-native'
import moment from 'moment'
import Button from 'react-native-micro-animated-button'

const Container = styled.View`
	background-color: #5b6a71;
`
const EnvelopeCard = styled.View`
	flex: 1;
  padding: 16px;
  background-color: #d5eef7;
`

const EnvelopeCardLabel = styled.Text`
  font-size: 26px;
  font-weight: 700;
  color: #5b6a71;
`
const EnvelopeAmount = styled.View`
  align-items: flex-end;
`
const EnvelopeDetail = styled.View`
  flex-direction: row;
  padding-top: 4px;
  padding-bottom: 4px;
`

const EnvelopeInfo = styled.View`
  flex: 1;
  align-items: ${props => (props.align ? props.align : 'flex-start')};
  justify-content: ${props => (props.justify ? props.justify : 'flex-start')};
`

const EnvelopeLabel = styled.Text`
  padding-top: 2px;
  font-size: ${props => (props.fontSize ? props.fontSize : '12px')};
  color: #5b6a71;
`

const StellarIcon = styled.Image``

class EnvelopeView extends PureComponent {

	reject = () => {
		const { tx, rejectTransaction } = this.props;
		this.cancelButton.success();
		rejectTransaction(tx);
	}

	sign = () => {
		const { tx, signTransaction } = this.props;
		this.signButton.success();
		signTransaction(tx);
	}

	copy = () => {
		const { copyToClipboard } = this.props;
		copyToClipboard();
		this.copyButton.success();
		this.copyButton.reset();
	}

	renderActionBar = () => {
		const { tx, showConfirmDelete } = this.props;

		if (!tx) {
			return
		}
	
		if (tx.status === 'SIGNED') {
			return (
				<View>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							padding: 16,
							backgroundColor: 'blue',
							borderRadius: 8,
							marginTop: 24
						}}
					>
						<Text style={{ color: 'white', fontWeight: '700' }}>SIGNED</Text>
					</View>
					<Button
							ref={ref => (this.copyButton = ref)}
							foregroundColor={'white'}
							backgroundColor={'#454545'}
							successColor={'#4cd964'}
							errorColor={'#ff3b30'}
							errorIconColor={'white'}
							successIconColor={'white'}
							shakeOnError={true}
							successIconName="check"
							label="Copy Signed XDR"
							onPress={this.copy}
							maxWidth={150}
							style={{
								marginLeft: 16,
								borderWidth: 1,
								alignSelf: 'center',
								marginTop: 16
							}}
						/>
				</View>
			)
		}
	
		if (tx.status === 'REJECTED') {
			return (
	
					<View>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'center',
								padding: 16,
								backgroundColor: '#ff3b30',
								borderRadius: 8,
								marginTop: 24
							}}
						>
							<Text style={{ color: 'white', fontWeight: '700' }}>REJECTED</Text>
						</View>
						<View style={{ alignSelf: 'center', marginTop: 8 }}>
							<TouchableOpacity onPress={()=> showConfirmDelete(tx)} style={{ padding: 32}}>
								<Text style={{ fontWeight: '700' }}>
									Delete
								</Text>
							</TouchableOpacity>
						</View>
					</View>
			)
		}
	
		if (tx.status === 'SUBMITTED') {
			return (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						padding: 16,
						backgroundColor: '#ff8300',
						borderBottomLeftRadius: 8,
						borderBottomRightRadius: 8
					}}
				>
					<Text style={{ color: 'white', fontWeight: '700' }}>SUBMITTED</Text>
				</View>
			)
		}
	
		if (tx.status === 'CONFIRMED') {
			return (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						padding: 16,
						backgroundColor: '#4cd964',
						borderBottomLeftRadius: 8,
						borderBottomRightRadius: 8
					}}
				>
					<Text style={{ color: 'white', fontWeight: '700' }}>CONFIRMED</Text>
				</View>
			)
		}
	
		return (
			<View>
				<View style={{ alignSelf: 'center', marginTop: 24 }}>
					<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
						<Button
							ref={ref => (this.cancelButton = ref)}
							foregroundColor={'#ff3b30'}
							onPress={this.reject}
							successIconName="check"
							label="Reject"
							maxWidth={100}
						/>
						<Button
							ref={ref => (this.signButton = ref)}
							foregroundColor={'#4cd964'}
							onPress={this.sign}
							successIconName="check"
							label="Sign"
							maxWidth={100}
							style={{ marginLeft: 16 }}
						/>
					</View>
					<View style={{ alignSelf: 'center', marginTop: 8 }}>
						<TouchableOpacity onPress={()=> showConfirmDelete(tx)} style={{ padding: 32}}>
							<Text style={{ fontWeight: '700' }}>
								Delete
							</Text>
						</TouchableOpacity>
					</View>
			</View>
		</View>

		)
	}


	render() {
		const { tx } = this.props;
		return (
			<ScrollView style={{ backgroundColor: '#d5eef7'}}>
					<EnvelopeCard>
						<StellarIcon
							source={require('./../assets/stellar-rocket.png')}
							resizeMode="contain"
							style={{
								width: 42,
								height: 42,
								position: 'absolute',
								marginTop: 8,
								marginLeft: 8
							}}
						/>
						<EnvelopeAmount>
							<EnvelopeCardLabel>{`${tx.amount} XLM`}</EnvelopeCardLabel>
						</EnvelopeAmount>
						<EnvelopeDetail>
							<EnvelopeInfo align="flex-start">
								<EnvelopeLabel>From:</EnvelopeLabel>
								<EnvelopeLabel fontSize="10px">{tx.sourceAccount}</EnvelopeLabel>
							</EnvelopeInfo>
						</EnvelopeDetail>
						<EnvelopeDetail>
							<EnvelopeInfo align="flex-start">
								<EnvelopeLabel>To:</EnvelopeLabel>
								<EnvelopeLabel fontSize="10px">{tx.destination}</EnvelopeLabel>
							</EnvelopeInfo>
						</EnvelopeDetail>
						<EnvelopeDetail>
							<EnvelopeInfo>
								<EnvelopeLabel>Memo:</EnvelopeLabel>
								<EnvelopeLabel>{tx.memo}</EnvelopeLabel>
							</EnvelopeInfo>
							<EnvelopeInfo align="flex-end">
								<EnvelopeLabel>Time:</EnvelopeLabel>
								<EnvelopeLabel>
									{moment(tx.createdAt).format('YYYY-MM-DD hh:mm:ss')}
								</EnvelopeLabel>
							</EnvelopeInfo>
						</EnvelopeDetail>
						{this.renderActionBar()}
					</EnvelopeCard>
					</ScrollView>
		)
	}
}

export default EnvelopeView;