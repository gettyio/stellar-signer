import React, { Component, Fragment } from 'react'
import { SafeAreaView, View, Text, Alert, Clipboard, TouchableOpacity, ScrollView } from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'
import Button from 'react-native-micro-animated-button'
import Icon from 'react-native-vector-icons/Feather'
import ActionSheet from 'react-native-actionsheet'
import { observer, inject } from 'mobx-react'
import SInfo from 'react-native-sensitive-info';
import uuid from 'uuid/v4'
import crypto from 'crypto-js'
import { get, sortBy } from 'lodash'
import EnvelopeCard from './../components/EnvelopeCard'
import ErrorMessage from './../components/ErrorMessage'
import EnvelopeTab from './../components/EnvelopeTab'
import SecurityForm from './../components/SecurityForm'
import { Screen, ContainerFlex, SelectSecret, Header, Title, TitleWrapper, LoadButtonWrapper, LoadButton } from './../components/utils'
import { decodeFromXdr, signXdr } from './../utils/xdrUtils';
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })
const db2 = new PouchDB('Transactions', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class TransactionDetail extends Component {

	static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
			header: (
				<SafeAreaView style={{ backgroundColor: 'blue' }}>
					<Header>
						<TitleWrapper>
							<Title>Transaction Detail</Title>
						</TitleWrapper>
						<LoadButtonWrapper>
							<LoadButton onPress={()=> navigation.goBack()}>
								<Icon name="x-circle" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>						
					</Header>
				</SafeAreaView>
			)
		};
	};

	state = {
    tabView: {
      index: 0,
      routes: [
        { key: 'display', title: 'Operation' },
        { key: 'envelop', title: 'Envelope' },
        { key: 'signed', title: 'Signed' }
      ]
		},
		secrets: [],
		options: [],
    showSecurityForm: false
	}

  componentDidMount() {
		this.loadData();
	}
	
	loadData = () => {
		try {
			let self = this;
			db.allDocs({
				include_docs: true
			}).then((res)=> {
				const options = [];
				const secrets = res.rows;
				secrets.forEach(el => options.push(el.doc.alias));
				self.setState({ secrets, options, isLoadingList: false });
			})
		} catch (error) {
			alert(error.message)
		}
	}
	
	copyToClipboard = () => {
		const { appStore, navigation } = this.props
		const tx = appStore.get('currentTransaction')
		Clipboard.setString(tx.sxdr);
		alert('The signed xdr was copied to the clipboard.');
	}

  handleTabIndexChange = index => {
    this.setState({
      tabView: Object.assign({}, this.state.tabView, {
        index
      })
    })
  }

  signTransaction = () => {
    this.setState({ showSecurityForm: true })
  }

  authTransaction = pwd => {
		const { appStore, navigation } = this.props
		const currentPwd = appStore.get('pwd');
		if (currentPwd === pwd) {
			const { secrets } = this.state;
			if (!secrets || secrets.length === 0) {
				Alert.alert(
					`You don't have any secret!`,
					`Please, add a new secret on the secrets tab.`,
					[
						{
							text: 'Ok',
							onPress: () => navigation.goBack()
						}
					]
				)
			} else {
				this.actionSheet.show();
			}
		} else {
			appStore.set('securityFormError', 'Invalid password!')
		}
	}
	
	renderTabHeader = props => {
    return (
      <TabBar
        {...props}
        style={{ backgroundColor: 'white' }}
        labelStyle={{ color: 'black' }}
        indicatorStyle={{ backgroundColor: 'blue' }}
        scrollEnabled={true}
      />
    )
  }

  rejectTransaction = () => {
		const { appStore, navigation } = this.props
		const currentTransaction = appStore.get('currentTransaction')
		try {
      db2.put({
				_id: currentTransaction._id,
				...currentTransaction,
				status: 'REJECTED'
			});
			navigation.goBack()
	    setTimeout(()=> {
				appStore.set('currentTransaction', undefined)
			}, 1000)
		} catch (error) {
			alert(error.message)
		}
  }

  renderTab = (route, tx) => {
    switch (route.key) {
      case 'display':
				return <EnvelopeCard 
								tx={tx} 
								copyToClipboard={this.copyToClipboard}
								showConfirmDelete={this.showConfirmDelete} 
								rejectTransaction={this.rejectTransaction}
								signTransaction={this.signTransaction}
							/>
      case 'envelop':
        return <EnvelopeTab tx={tx.xdr} />
      case 'signed':
        return <EnvelopeTab tx={tx.sxdr} />
      default:
        return null
    }
  }

  deleteTransaction = async (currentTransaction) => {
		const { appStore, navigation } = this.props
		let ctx;
		try {
			if (currentTransaction) {
				ctx = currentTransaction;
			} else {
				ctx = appStore.get('currentTransaction')
			}
			const res = await db2.remove(ctx);
			navigation.goBack()
			setTimeout(()=> {
				appStore.set('currentTransaction', undefined)
			}, 1000)
		} catch (error) {
			alert(error.message);
		}
	}
	
	showConfirmDelete = tx => {
    Alert.alert(
      `Are you sure you want delete this?`,
      `${tx.memo}`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => this.deleteTransaction(tx)
        }
      ],
      { cancelable: true }
    )
  }

  submitSignature = index => {
    const { secrets } = this.state;
		const secret = secrets[index]
    this.showConfirmSignatureAlert(secret)
	}
	

  confirmSignTransaction = _id => {
    const { appStore, navigation } = this.props
		try {
			const pwd = appStore.get('pwd');
			const currentTransaction = appStore.get('currentTransaction')
			SInfo.getItem(_id,{}).then(value => {
				debugger;
				const bytes = crypto.AES.decrypt(value, `${_id}:${pwd}`);
				const sk = bytes.toString(crypto.enc.Utf8);
				const data = {
					type: 'sign',
					tx: currentTransaction,
					xdr: currentTransaction.xdr,
					sk
				};
				const signedTx = signXdr(data);
				this.saveCurrentTransaction(signedTx)
				navigation.goBack()
			});
		} catch (error) {
			alert(error.message)
		}
	}
	
	saveCurrentTransaction = data => {
		const { appStore } = this.props
		const currentTransaction = appStore.get('currentTransaction')
    if (data) {
      if (data.type === 'error') {
        //console.warn('Error: ', data);
        this.saveTransaction({
          xdr: data.xdr,
          createdAt: new Date().toISOString(),
          type: 'error',
          message: data.message,
          status: 'ERROR'
        })
      } else if (data.type === 'sign') {
        this.saveTransaction({
          ...currentTransaction,
          ...data,
					status: 'SIGNED',
					createdAt: new Date().toISOString()
        })
      } else {
				const tx = parseEnvelopeTree(data.tx)
        this.saveTransaction({
					...tx,
          type: data.type,
					xdr: data.xdr,
          createdAt: new Date().toISOString(),
          status: 'CREATED'
        })
      }
    } else {
      console.warn('Data not found!');
    }
	}
	
	saveTransaction = async tx => {
    const { appStore } = this.props
		try {
      db2.put({
				_id: uuid(),
				...tx
			});
		} catch (error) {
			alert(error.message)
		}
    appStore.set('currentXdr', undefined)
  }

  showConfirmSignatureAlert = secret => {
    Alert.alert(
      `${secret.doc.alias}`,
      `${secret.doc.sk}`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => this.confirmSignTransaction(secret.doc._id)
        }
      ],
      { cancelable: true }
    )
  }

  render() {
    const { appStore, toggleModal } = this.props
		const { showSecurityForm, options } = this.state
		const currentTransaction = appStore.get('currentTransaction');
		const securityFormError = appStore.get('securityFormError')

    if (currentTransaction && currentTransaction.type === 'error') {
      return (
        <Container>
          <ErrorMessage tx={currentTransaction} />
          <Button
            ref={ref => (this.deleteTransactionButton = ref)}
            foregroundColor={'white'}
            backgroundColor={'#ff3b30'}
            errorColor={'#ff3b30'}
            errorIconColor={'white'}
            successIconColor={'white'}
            onPress={this.deleteTransaction}
            successIconName="check"
            label="Delete"
            maxWidth={100}
            style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
          />
        </Container>
      )
    }

		return (
			<ContainerFlex>
						{!showSecurityForm && (
							<TabViewAnimated
								navigationState={this.state.tabView}
								renderScene={({ route }) => this.renderTab(route, currentTransaction)}
								renderHeader={this.renderTabHeader}
								onIndexChange={this.handleTabIndexChange}
							/>
						)}
						{showSecurityForm && (
							<SecurityForm
								error={securityFormError}
								submit={this.authTransaction}
								close={toggleModal}
								closeAfterSubmit={false}
							/>
						)}
						{(options && options.length > 0) && (
							<ActionSheet
								ref={o => (this.actionSheet = o)}
								title={'Select a Secret'}
								options={options}
								cancelButtonIndex={1}
								destructiveButtonIndex={2}
								onPress={this.submitSignature}
							/>
						)}
			</ContainerFlex>
		)
  }
}

export default TransactionDetail
