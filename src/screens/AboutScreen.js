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

  render() {
    return (
			<SafeAreaView style={{ backgroundColor: 'blue' }}>
					<Screen style={{ backgroundColor: 'white' }}>
						<ScrollView>
						<Header>
							<TitleWrapper>
								<Title>About <Text style={{ fontSize: 10 }}>{`v${version}`}</Text></Title>
							</TitleWrapper>
						</Header>
						<ContainerFlex>
							<View>
								<Text style={{ fontSize: 14, padding: 16, lineHeight: 24, textAlign: 'justify' }}>
									<Text style={{ fontSize: 14, fontWeight: '700' }}>StellarSigner </Text> 
									is a new and free secure key store app to sign Stellar transactions for mobile phones. 
									With StellarSigner you never share your secret keys with third party services.
									StellarSigner is designed to be among the most secure apps to sign Stellar transactions on iOS and Android.
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
								<Text style={{ fontSize: 14, paddingTop: 8, paddingLeft: 16, lineHeight: 8 }}>> @gettyio</Text>
								<Text style={{ fontSize: 14, fontWeight: '700', padding: 16 }}>Sponsored by Getty/IO Inc.</Text>
								<Text style={{ fontSize: 14, paddingTop: 4, paddingLeft: 16, lineHeight: 8 }}>www.getty.io</Text>
								<Text style={{ fontSize: 12, padding: 16, lineHeight: 16, textAlign: 'justify' }}>
									Notes: On mobile devices, nothing is 100% secure. Any data stored on the phone can be accessed by hardware and OS vendors because they have full control of the device, they can throw whatever computing power they want at cracking any security or encryption. A jailbroken device can access your iOS Keychain/ Android shared preference and key store in plain text, it is necessary to add another layer of protection so even jailbreaking won't leak your data. Because of that we encrypt your keys with a your password before store it locally on your phone. We are planning to add another layer using seed keys soon.
								</Text>
							</View>
						</ContainerFlex>
						</ScrollView>
					</Screen>
			</SafeAreaView>
    )
  }
}

export default AboutScreen
