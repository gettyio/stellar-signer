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
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Screen, Container, EmptyScreen, CardWrapper, CardContent, ErrorMessageLabel, ErrorInputValueLabel, TransactionRow, AmountCard, AmountLabel, LabelsRow, CreatedAtLabel, StatusLabel, AccountInfoCard, AccountLabel } from '../shared';
import realm from './../store/realm';

class TransactionList extends PureComponent {

  state = {
    transactions: [],
    currentTx: undefined,
    hasError: undefined,
    isLoadingList: false,
  }

  componentDidMount() {
    realm.addListener('change', this.refreshList);
    this.refreshList();
  }

  refreshList = ()=> {
    const transactions = realm.objects('Transaction').sorted('createdAt', true);;
    this.setState({ transactions });
  }

  renderRow = ({ item })=> {
    if (item.type === 'error') {
      return (
      <TransactionRow>
        <CardWrapper>
          <Icon name="times-circle" color="red" size={32}></Icon>
          <CardContent>
            <ErrorMessageLabel>{`${item.message}`}</ErrorMessageLabel>
            <ErrorInputValueLabel>{`XDR: ${item.xdr}`}</ErrorInputValueLabel>
            <LabelsRow>
              <StatusLabel status={item.status}>{item.status}</StatusLabel>
              <CreatedAtLabel>{moment(item.createdAt, "YYYYMMDD hh:mm:ss").fromNow()}</CreatedAtLabel>
            </LabelsRow>   
                  
          </CardContent>
        </CardWrapper>
      </TransactionRow>
      )
    }
    
    return (
      <TouchableOpacity key={item.id} onPress={() => {}}>
        <TransactionRow>
          <CardWrapper>
            <Icon name="check-circle" color="#3ED235" size={32}></Icon>
            <CardContent>
              <AmountCard>
                <AmountLabel>{`${item.amount} XLM`}</AmountLabel>
              </AmountCard>
              <LabelsRow>
                <AccountLabel>{`${item.memo}`}</AccountLabel>
              </LabelsRow>   
              <LabelsRow>
                <StatusLabel status={item.status}>{item.status}</StatusLabel>
                <CreatedAtLabel>{moment(item.createdAt, "YYYYMMDD hh:mm:ss").fromNow()}</CreatedAtLabel>
              </LabelsRow>                         
            </CardContent>
          </CardWrapper>
        </TransactionRow>
      </TouchableOpacity>
    )
  }

  render() {
    const { isLoadingList, hasError, transactions } = this.state;
    
    if (isLoadingList) {
      return (
        <View style={{ flex: 1, marginTop: 64 }}>
          <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
        </View>
      );
    }

    if (hasError) {
      return (
        <View full={true} justify="center" align="center">
          <Text>Error</Text>
        </View>
      );
    }

    if (transactions.length < 1) {
      return (
        <EmptyScreen>
          <Image 
            source={require('./../shared/empty.png')} 
            resizeMode="contain" 
            style={{ width: 170 }}  
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>No Transactions Found!</Text>
        </EmptyScreen>         
      )
    }

    return (
      <Container>
        <FlatList
          data={transactions}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => `${item.id}`}
        />
      </Container>
    );
  }
}


export default TransactionList;
