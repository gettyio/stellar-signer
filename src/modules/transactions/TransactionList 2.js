import React, { PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  FlatList,
  WebView,
  Keyboard,
  Clipboard,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import styled from "styled-components";
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Modal from 'react-native-modal';
import moment from 'moment';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Button from 'react-native-micro-animated-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import DisplayTab from './DisplayTab'
import EnvelopTab from './EnvelopTab'
import SecretModel from './SecretModel';
import TransactionModel from './TransactionModel';
import Realm from 'realm';
import { isNull, isUndefined } from 'lodash';

const versionBytes = {
  ed25519PublicKey: 6 << 3, // G
  ed25519SecretSeed: 18 << 3, // S
  preAuthTx: 19 << 3, // T
  sha256Hash: 23 << 3 // X
};


const TransactionRow = styled.View`
  padding: 8px;
  background-color: transparent;
  border-bottom-width: 0.3px;
  border-color: #cecece;  
`;

const AccountInfoCard = styled.View`
  border-radius: 10px;
`;

const AmountCard = styled.View`
  bottom: 0;
  margin-bottom: 8px;
  width: auto;
  padding: 8px;
  align-self: flex-end;
`;

const CreatedAtLabel = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #a9a8aa;
  padding: 3px;
`;

const StatusLabel = styled.Text`
  margin-top: 2px;
  margin-left: 8px;
  font-size: 12px;
  color: white;
  background-color: #a9a8aa;
  background-color: ${props => {
    if (props.status === "CREATED") return "#a9a8aa";
    if (props.status === "REJECTED") return "#ff3b30";
    if (props.status === "ERROR") return "#ff3b30";
    if (props.status === "SIGNED") return "blue";
    if (props.status === "SUBMITTED") return "#ff8300";
    if (props.status === "CONFIRMED") return "#4cd964";
  }};
  padding: 3px;
`;

const AccountLabel = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #a9a8aa;
`;

const AmountLabel = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #56c038;
`;

const LabelsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
`;

const TransactionDetail = styled.View`
  flex: 1;
  padding-top: 16px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const TransactionContent = styled.View`
  flex: 1;
  margin-top: 48px;
  background-color: white;
`;

const InfoTitleLabel = styled.Text`
`;

const TransactionInfoWrapper = styled.View`
  padding: 16px;
`;

const TransactionInfo = styled.Text`
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  margin-top: 24px;
  top: 0;
  right: 0;
`;

const AuthorizeButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  background-color: #00c400;
  border-radius: 50px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const AuthorizeButtonLabel = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: white;
`;

const Container = styled.View`
  flex: 1;
  background-color: transparent;
`;

const TextInput = styled.TextInput`
  height: 80px;
  padding: 8px;
  background-color: white;
  border-width: 1px;
  border-color: #f0f0f0;
  color: #a0a0a0;
`;

const PasteButton = styled.TouchableOpacity`
  border-radius: 10px;
  background-color: #cecece;
  border-width: 1px;
  border-color: #cecece;
`;

const PasteButtonLabel = styled.Text`
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

class TransactionList extends PureComponent {

  state = {
    realmTx: undefined,
    realm: undefined,
    currentTx: undefined,
    isModalVisible: false,
    secretInputValue: 'SCJKEGBTFVCVV7FLZLSTN2BJMVZYBJ6FUX3WYWTRKOPWNVEM4CUIXLSC',
    signedXdr: undefined,
    tabView: {
      index: 0,
      routes: [
        { key: 'display', title: 'Operation' },
        { key: 'envelop', title: 'Envelope' },
        { key: 'signed', title: 'Signed' }
      ]
    }
  }

  getRealmTx = () => {
    let realm = new Realm({schema: [TransactionModel], path: 'transactions.realm' });
    return realm;
  }

  getRealm = (pin) => {
    let realm = new Realm({schema: [SecretModel], encryptionKey: pin});
    return realm;
  }

  getSecretKey = (pin) => {
    let realm = this.getRealm(pin); 
    const secretObject = realm.objects('Secret')[0];
    return secretObject.sk;
  }

  createSecret = (pin, sk) => {
    let realm = this.getRealm(pin); 
    realm.write(() => {
      realm.create('Secret', {
        sk: sk
      });
    });
  }

  deleteSecret = (pin) => {
    let realm = this.getRealm(pin); 
    let secretObject = realm.objects('Secret')[0];
    realm.write(() => {
      realm.delete(secretObject);
    });
  }

  _handleIndexChange = index =>
    this.setState({ tabView: Object.assign({}, this.state.tabView, {
      index
    })})
  
  _renderHeader = props => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent' }}
      labelStyle={{ color: 'black' }}
      indicatorStyle={{ backgroundColor: '#00c400' }}
      scrollEnabled={true}
    />
  )
    
  renderRow = ({ item, index })=> {
    return (
      <TouchableOpacity key={item.id} onPress={() => this.toggleModal(item)}>
        <TransactionRow>
          <AmountCard>
            <AmountLabel>{`${item.amount} XLM`}</AmountLabel>
          </AmountCard>
          <LabelsRow>
            <CreatedAtLabel>{moment(item.createdAt, "YYYYMMDD hh:mm:ss").fromNow()}</CreatedAtLabel>
            <StatusLabel status={item.status}>{item.status}</StatusLabel>
          </LabelsRow>
          <AccountInfoCard>
            <AccountLabel>{item.dst}</AccountLabel>
          </AccountInfoCard>          
        </TransactionRow>
      </TouchableOpacity>
    )
  }


  renderList = ()=> {
    const { allStellarTransactions } = this.props.allAccountTransactionsQuery;
    let realm = this.getRealmTx();
    let obj = realm.objects('Transaction')[0];
    return (
      <FlatList
        data={allStellarTransactions}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => item.id}
      />
    )
  }

  pasteHandler = async ()=> {
    const content = await this.getClipboardValue();
    this.refs.view
      .fadeOutLeft(300)
      .then(() => this.setState({ secretInputValue: content }, ()=> {
        Keyboard.dismiss();
      }))
  }

  renderPasteButton = ()=> {
    const { secretInputValue } = this.state;
    if (!secretInputValue || secretInputValue === "") {
      return (
        <Animatable.View ref="view" style={{ position: 'absolute', marginTop: 18, marginLeft: -6 }}>
          <PasteButton onPress={this.pasteHandler} >
            <PasteButtonLabel>Click to paste your public key or start type.</PasteButtonLabel>
          </PasteButton>
        </Animatable.View>
      )
    }
  }

  getClipboardValue = async ()=> {
    return await Clipboard.getString();
  }

  setSecretValue = (text)=> {
    this.setState({ secretInputValue: text })
  }

  saveXDR = (event) => {
    const { currentTx } = this.state;
    const id = currentTx.id;
    const signedXdr = event.nativeEvent.data;
    const status = 'SIGNED';
    this.props.updateStellarTransactionMutation({ variables: { id, signedXdr, status } });
    this.signButton.success();
    setTimeout(()=> { this.setState({ isModalVisible: false, signedXdr }) }, 1000)
  }

  cancelTransaction = () => {
    const { currentTx } = this.state;
    this.props.updateStellarTransactionMutation({ variables: { id: currentTx.id, signedXdr: '', status: 'REJECTED' } });
    this.cancelButton.success();
    setTimeout(()=> { this.setState({ isModalVisible: false }) }, 1000)
  }

  signTransaction = () => {
    const { secretInputValue, currentTx } = this.state;
    const xdr = currentTx.xdr;
    const data = JSON.stringify({ xdr, sk: secretInputValue });
    this.signingView.postMessage(data);
  }

  renderSigningView = () => {
    return (
      <WebView
        ref={signingView => (this.signingView = signingView)} 
        style={{ width: 0, height: 0 }}
        source={require(`./../webviews/sign-tx.html`)}
        javaScriptEnabled={true}
        onMessage={((event)=> this.saveXDR(event))}
      />
    )
  }

  renderTab = (route, tx) => {
    const { signedXdr } = this.state;
		switch (route.key) {
			case 'display':
				return (<DisplayTab tx={tx}></DisplayTab>);
			case 'envelop':
        return (<EnvelopTab xdr={tx.xdr} />);
      case 'signed':   
        return (<EnvelopTab xdr={signedXdr || tx.signedXdr}></EnvelopTab>);     
			default:
				return null;
		}
  }
  
  renderTransactionButtons = (currentTx) => {

    if (!currentTx) {
      return;
    }

    if (currentTx.status === 'SIGNED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: 'blue'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>SIGNED</Text>
        </View>      
      )
    }

    if (currentTx.status === 'REJECTED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#ff3b30'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>REJECTED</Text>
        </View>      
      )
    }

    if (currentTx.status === 'SUBMITTED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#ff8300'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>SUBMITTED</Text>
        </View>      
      )
    }
    
    if (currentTx.status === 'CONFIRMED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#4cd964'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>CONFIRMED</Text>
        </View>      
      )
    }
    
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center' }}>
        <Button 
          ref={ref => (this.cancelButton = ref)}
          foregroundColor={'#ff3b30'}
          onPress={this.cancelTransaction}
          successIconName="check" 
          label="Cancel"
          maxWidth={100}
        />

        <Button 
          ref={ref => (this.signButton = ref)}
          foregroundColor={'#4cd964'}
          onPress={this.signTransaction}
          successIconName="check" 
          label="Sign"
          maxWidth={100}
          style={{ marginLeft: 16 }}
        /> 
      </View>      
    )
  }

  renderModal = () => {
    const { currentTx, isModalVisible, secretInputValue } = this.state;

    return (
      <Modal 
        isVisible={isModalVisible}
        animationInTiming={600}
        animationOutTiming={600}
      >
        <TransactionDetail>
          <TransactionContent>
            
            <Container>
              <TextInput
                onChangeText={(text) => this.setSecretValue(text)}
                clearButtonMode={'always'}
                value={secretInputValue}
              />
              <TabViewAnimated
                navigationState={this.state.tabView}
                renderScene={({ route })=> this.renderTab(route, currentTx)}
                renderHeader={this._renderHeader}
                onIndexChange={this._handleIndexChange}
              />
              {this.renderPasteButton()}
            </Container>

            <View>
              {this.renderTransactionButtons(currentTx)}       
              {this.renderSigningView()}
            </View>
          </TransactionContent>
          
          <CloseButton onPress={this.toggleModal}>
            <Icon name="close" color="white" size={32}></Icon>
          </CloseButton>

        </TransactionDetail>
      </Modal>
    )
  }

  render() {
    const { history, allAccountTransactionsQuery } = this.props;

    if (allAccountTransactionsQuery && allAccountTransactionsQuery.loading) {
      return (
        <View style={{ flex: 1, marginTop: 64 }}>
          <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
        </View>
      );
    }

    if (allAccountTransactionsQuery && allAccountTransactionsQuery.error) {
      return (
        <View full={true} justify="center" align="center">
          <Text>Error</Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {this.renderList()}
        {this.renderModal()}
      </View>
    );
  }
}


const GET_ACCOUNT_TRANSACTIONS = gql`
  query AllAccountTransactions($account: String!) {
    allStellarTransactions(
      filter: { 
        OR: [
          { dst: $account },
          { src: $account },
        ]
      }, 
      orderBy: createdAt_DESC
    ) {
      id
      src
      dst
      xdr
      signedXdr
      amount
      memo
      status
      error
      message
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TRANSACTION = gql`
  mutation UpdateStellarTransaction($id: ID!, $signedXdr: String!, $status: TX_STATUS!) {
    updateStellarTransaction(
      id: $id
      signedXdr: $signedXdr
      status: $status
    ) {
      id
      status
      signedXdr
    }
  }
`;

export default compose(
  graphql(GET_ACCOUNT_TRANSACTIONS, {
    name: 'allAccountTransactionsQuery',
    options: (props) => ({ variables: { account: props.account } })
  }),
  graphql(UPDATE_TRANSACTION, {
    name: 'updateStellarTransactionMutation'
  })
)(TransactionList);
