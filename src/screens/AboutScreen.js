import React, { Component } from 'react'
import { SafeAreaView, View, Text } from 'react-native'
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
				<Screen>
					<Header>
						<TitleWrapper>
							<Title>About <Text style={{ fontSize: 10 }}>{`v${version}`}</Text></Title>
						</TitleWrapper>
					</Header>
				</Screen>
			</SafeAreaView>
    )
  }
}

export default AboutScreen
