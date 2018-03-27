import React, { Component } from 'react'
import { SafeAreaView, View, Text, ScrollView } from 'react-native'
import {
  Screen,
  ContainerFlex,
  Header,
	Title,
	TitleWrapper
} from '../components/utils'
import { version } from './../../package.json'

class AboutScreen extends Component {


	static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
				<Header>
					<TitleWrapper>
						<Title>About <Text style={{ fontSize: 10 }}>{`v${version}`}</Text></Title>
					</TitleWrapper>
				</Header>
				</SafeAreaView>
			)
		};
	};

  render() {
    return (
					<Screen style={{ backgroundColor: 'white' }}>
						<ScrollView>
							<ContainerFlex style={{ paddingBottom: 48 }}>
								<View>
									<Text style={{ fontSize: 14, padding: 16, lineHeight: 24, textAlign: 'justify' }}>
										<Text style={{ fontSize: 14, fontWeight: '700' }}>StellarSigner </Text> 
										is a new and free secure key store app to sign Stellar transactions. 
										With StellarSigner you never share your secret keys with third party services.
										StellarSigner is designed to be among the most secure mobile apps to sign Stellar transactions.
										StellarSigner can already sign transactions submitted to it from other apps or through the copy/paste buffer.
										StellarSigner is also a standalone app and any application that wishes to use it, including websites can use it to sign their transactions.
									</Text>

									<Text style={{ fontSize: 14, fontWeight: '700', padding: 16 }}>Contributors</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8, paddingBottom: 16, }}>Thanks goes to these wonderful people: 😃</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @dbuarque</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @mikefair</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @marlonbrgomes</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @vitorpereira</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @julianorafael</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @jordancassiano</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @pnakibar</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @nilocoelhojunior</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @leocolodette</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @jai</Text>
									<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @gettyio</Text>
									<Text style={{ fontSize: 14, fontWeight: '700', padding: 16 }}>Powered by Getty/IO Inc.</Text>
									<Text style={{ fontSize: 14, paddingTop: 4, paddingLeft: 16, lineHeight: 8 }}>www.getty.io</Text>
								</View>
							</ContainerFlex>
						</ScrollView>
					</Screen>
    )
  }
}

export default AboutScreen
