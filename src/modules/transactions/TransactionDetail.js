
import React, { Component, Fragment } from 'react';
import {
  View,
	Text
	
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Button from 'react-native-micro-animated-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import ActionSheet from 'react-native-actionsheet'
import { observer, inject } from "mobx-react";
import DisplayTab from './DisplayTab'
import ErrorMessage from './ErrorMessage';
import EnvelopTab from './EnvelopTab'
import EnvelopeCard from './../../shared/EnvelopeCard';
import { Container, SelectSecret } from './../../shared';
import AddSecurityForm from './../security/AddSecurityForm';
import realm from './../../store/transactions';

@inject("appStore") @observer
class TransactionDetail extends Component {

  state = {
    tabView: {
      index: 0,
      routes: [
        { key: 'display', title: 'Operation' },
        { key: 'envelop', title: 'Envelope' },
        { key: 'signed', title: 'Signed' }
      ]
		},
		showSecurityForm: false
  }

  handleTabIndexChange = index => {
    this.setState({ tabView: Object.assign({}, this.state.tabView, {
      index
    })})
  }
  
  renderTabHeader = props => {
    return (
      <TabBar
        {...props}
        style={{ backgroundColor: 'transparent' }}
        labelStyle={{ color: 'black' }}
        indicatorStyle={{ backgroundColor: '#00c400' }}
        scrollEnabled={true}
      />
    )
  }
  
  rejectTransaction = () => {
    this.cancelButton.success();
    this.props.cancelTransaction();
  }

  signTransaction = () => {
    this.signButton.success();		
		this.setState({ showSecurityForm: true });
	}
	
	authTransaction = (pwd) => {
		this.actionSheet.show()
	}

  renderActionBar = () => {
    const { tx } = this.props;
    if (!tx) {
      return;
    }
  
    if (tx.status === 'SIGNED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: 'blue', borderBottomLeftRadius: 8, borderBottomRightRadius: 8}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>SIGNED</Text>
        </View>      
      )
    }
  
    if (tx.status === 'REJECTED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#ff3b30', borderBottomLeftRadius: 8, borderBottomRightRadius: 8}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>REJECTED</Text>
        </View>      
      )
    }
  
    if (tx.status === 'SUBMITTED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#ff8300', borderBottomLeftRadius: 8, borderBottomRightRadius: 8}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>SUBMITTED</Text>
        </View>      
      )
    }
    
    if (tx.status === 'CONFIRMED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#4cd964', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>CONFIRMED</Text>
        </View>      
      )
    }
    
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center' }}>
        <Button 
          ref={ref => (this.cancelButton = ref)}
          foregroundColor={'#ff3b30'}
          onPress={this.rejectTransaction}
          successIconName="check" 
          label="Reject"
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
	
  renderTab = (route, tx) => {
		switch (route.key) {
			case 'display':
				return (<DisplayTab tx={tx} />);
			case 'envelop':
        return (<EnvelopTab xdr={tx.xdr} />);
      case 'signed':   
        return (<EnvelopTab xdr={tx.sxdr} />);     
			default:
				return null;
		}
  }

  deleteTransaction = () => {
    const { appStore } = this.props;
    const currentTransaction = appStore.get('currentTransaction');
    this.deleteTransactionButton.success();
    appStore.set('isDetailModalVisible', !appStore.get('isDetailModalVisible'));
    setTimeout(()=> {
      realm.write(() => {
        realm.delete(currentTransaction);
      });
      appStore.set('currentTransaction', undefined);
    }, 800);
	}

	getOptions = () => {
		const { appStore } = this.props;
		const secretList = appStore.get('secretList');
		let options = [];
		secretList.forEach((el) => options.push(el.alias));
		return options;
	}

	submitSignature = (index)=> {
		const { appStore } = this.props;
		const secretList = appStore.get('secretList');
		const secret = secretList[index];
		this.props.signTransaction(secret.sk);
	}
	
  render() {
		const { appStore, tx, toggleModal } = this.props;
		const { showSecurityForm } = this.state;
		const secretOptions = this.getOptions();
    if (!tx) {
      return <View></View>
    }
		
    if (tx.type === 'error') {
      return (
        <Container>
          <ErrorMessage tx={tx} />
          <Button 
              ref={ref => (this.deleteTransactionButton = ref)}
              foregroundColor={'#ff3b30'}
              onPress={this.deleteTransaction}
              successIconName="check" 
              label="Delete"
              maxWidth={100}
              style={{ marginLeft: 16 }}
            /> 
        </Container>
      )
    }

    if (tx) {
      return (
        <Container style={{ height: '80%', justifyContent: 'center', backgroundColor: 'white' , margin: 8, borderRadius: 8 }}>
					{/**<ActivityIndicator size="large" color="#4b9ed4"></ActivityIndicator> **/}
						{!showSecurityForm && (
							<TabViewAnimated
							navigationState={this.state.tabView}
							renderScene={({ route })=> this.renderTab(route, tx)}
							renderHeader={this.renderTabHeader}
							onIndexChange={this.handleTabIndexChange}
							/>
						)}
						{!showSecurityForm && this.renderActionBar()}
						{showSecurityForm && (
							<Fragment>
								<AddSecurityForm submit={this.authTransaction} close={toggleModal} closeAfterSubmit={false} />
							</Fragment>
						)}
						<ActionSheet
							ref={o => this.actionSheet = o}
							title={'Select a Secret'}
							options={secretOptions}
							cancelButtonIndex={1}
							destructiveButtonIndex={2}
							onPress={this.submitSignature}
						/>
        </Container>
      );
    }

    return <View></View>
    
  }
}

export default TransactionDetail;