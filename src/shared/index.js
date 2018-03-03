import styled from "styled-components";

export const Card = styled.View`
  width: 95%;
  background-color: white;
  border-radius: 16px;
  padding: 16px;
	align-self: center;
`

export const CardRow = styled.View`
  flex-direction: ${props => props.flexx ? props.flexx : "row"};
  align-items: ${props => props.align ? props.align : "center"};
`

export const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  padding-left: 8px;
`

export const SmallMessageLabel = styled.Text`
  font-size: 10px;
	color: #464646;
`

export const PasswordFormTitle = styled.Text`
	padding-top: 8px;
  font-size: 16px;
	font-weight: 700;
	color: #464646;
`

export const CardLabel = styled.Text`
  font-size: 12px;
  padding-top: 8px;
`

export const Screen = styled.View`
  display: flex;
`;

export const Header = styled.View`
  height: 100px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding-top: 16px;
  padding-right: 16px;
  background-color: blue;
`;

export const Container = styled.View`
  height: ${props => props.height ? props.height : 'auto' };
`;

export const ContainerFlex = styled.View`
  flex: 1;
`;

const EnvelopInfo = styled.View`
  flex: 1;
  align-items: ${props => props.align ? props.align : 'flex-start'};
  justify-content: ${props => props.justify ? props.justify : 'flex-start'};
`

export const EmptyScreen = styled.View`
  align-items: center;
  margin-top: 16px;
`;

export const PasteButton = styled.TouchableOpacity`
  border-radius: 10px;
  background-color: #cecece;
  border-width: 1px;
  border-color: #cecece;
`;

export const PasteButtonLabel = styled.Text`
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

export const ErrorLabel = styled.Text`
	margin-top: 8px;
  font-size: 10px;
  color: red; 
`;


export const AddTransactionHeaderLabel = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: white; 
  padding-bottom: 16px;
`;

export const AddTransactionInput = styled.TextInput`
  height: 40%;
  width: 100%;
  color: #344B67;
  padding: 16px;
  align-content: flex-start;
  background-color: white;
  border-radius: 16px;
`;

export const LoadButton = styled.TouchableOpacity`
  position: absolute;
  padding-top: 8px;
  padding-right: 8px;
  right: 0;
  height: 24px;
  width: 40px;
  border-radius: 10px;
`;

export const Title = styled.Text`
  color: white;
  font-weight: 700;
  padding-left: 16; 
  font-size: 28;
`;

export const TransactionRow = styled.View`
  padding: 8px;
  border-bottom-width: 0.3px;
  border-color: #cecece;  
`;

export const AccountInfoCard = styled.View`
  border-radius: 10px;
`;

export const AmountCard = styled.View`
  bottom: 0;
  margin-bottom: 8px;
  width: auto;
  align-self: flex-end;
`;

export const CreatedAtLabel = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #a9a8aa;
  padding: 3px;
`;

export const StatusLabel = styled.Text`
  margin-top: 2px;
  margin-left: 8px;
  font-size: 12px;
  color: #a9a8aa;
  padding: 3px;
`;

export const AccountLabel = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #a9a8aa;
`;

export const AmountLabel = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #3ED235;
`;

export const LabelsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
`;

export const TransactionDetail = styled.View`
  flex: 1;
  padding-top: 16px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

export const TransactionContent = styled.View`
  flex: 1;
  margin-top: 48px;
  background-color: white;
`;

export const InfoTitleLabel = styled.Text`
`;

export const TransactionInfoWrapper = styled.View`
  padding: 16px;
`;

export const TransactionInfo = styled.Text`
`;

export const CloseButton = styled.TouchableOpacity`
  margin-right: 8px;
  margin-bottom: 8px;
  align-self: flex-end;
  z-index: 1;
`;

export const AuthorizeButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  background-color: #00c400;
  border-radius: 50px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const AuthorizeButtonLabel = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: white;
`;

export const TextInput = styled.TextInput`
  height: 80px;
  padding: 8px;
  background-color: white;
  color: #a0a0a0;
`;

export const CardWrapper = styled.View`
  padding: ${props => props.pad ? props.pad : '0px'};
  flex-direction: row;
  align-items: center;
`;

export const CardContent = styled.View`
  flex: 1;
  margin-left: 16px;
`;

export const ErrorMessageLabel = styled.Text`
  color: #333;
  font-weight: 700;
`;

export const ErrorInputValueLabel = styled.Text`
  padding-top: 4px;
`;
