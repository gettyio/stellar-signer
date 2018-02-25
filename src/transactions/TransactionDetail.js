
import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Button from 'react-native-micro-animated-button';
import Icon from 'react-native-vector-icons/FontAwesome';
import DisplayTab from './DisplayTab'
import ErrorMessage from './ErrorMessage';
import EnvelopTab from './EnvelopTab'
import EnvelopeCard from './../shared/EnvelopeCard';

class TransactionDetail extends Component {

  state = {
    tabView: {
      index: 0,
      routes: [
        { key: 'display', title: 'Operation' },
        { key: 'envelop', title: 'Envelope' },
        { key: 'signed', title: 'Signed' }
      ]
    }
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

  renderActionBar = () => {
    const { tx, cancelTransaction, signTransaction } = this.props;
    if (!tx) {
      return;
    }
  
    if (tx.status === 'SIGNED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: 'blue'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>SIGNED</Text>
        </View>      
      )
    }
  
    if (tx.status === 'REJECTED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#ff3b30'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>REJECTED</Text>
        </View>      
      )
    }
  
    if (tx.status === 'SUBMITTED') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'center', padding: 16, backgroundColor: '#ff8300'}}>
          <Text style={{ color: 'white', fontWeight: '700' }}>SUBMITTED</Text>
        </View>      
      )
    }
    
    if (tx.status === 'CONFIRMED') {
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
          onPress={()=> cancelTransaction(this.cancelButton)}
          successIconName="check" 
          label="Reject"
          maxWidth={100}
        />
  
        <Button 
          ref={ref => (this.signButton = ref)}
          foregroundColor={'#4cd964'}
          onPress={()=> signTransaction(this.signTransaction)}
          successIconName="check" 
          label="Sign"
          maxWidth={100}
          style={{ marginLeft: 16 }}
        /> 
      </View>      
    )
  }

  renderTab = (route, tx) => {
    const { currentXdr, signedXdr } = this.state;
		switch (route.key) {
			case 'display':
				return (<DisplayTab tx={tx} />);
			case 'envelop':
        return (<EnvelopTab xdr={currentXdr} />);
      case 'signed':   
        return (<EnvelopTab xdr={signedXdr} />);     
			default:
				return null;
		}
  }
    
  render() {
    const { tx } = this.props;
    
    if (tx.type === 'error') {
      return (
        <ErrorMessage tx={tx} />
      )
    }

    if (tx) {
      return (
        <View style={{ height: '80%', justifyContent: 'center', backgroundColor: 'white' , margin: 8 }}>
          {/**<ActivityIndicator size="large" color="#4b9ed4"></ActivityIndicator> **/}
            <TabViewAnimated
              navigationState={this.state.tabView}
              renderScene={({ route })=> this.renderTab(route, tx)}
              renderHeader={this.renderTabHeader}
              onIndexChange={this.handleTabIndexChange}
            />
            {this.renderActionBar()}
        </View>
      );
    }

    return <View></View>
    
  }
}

export default TransactionDetail;