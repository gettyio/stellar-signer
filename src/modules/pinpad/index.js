import React from 'react'
import styled, { css } from 'styled-components/native'
import { SafeAreaView, StatusBar } from 'react-native'

const Container = styled(SafeAreaView)`
  background-color: white;
`

const Text = styled.Text`
  font-weight: bold;
  ${props => props.color && css`
    color: ${props.color};
  `}
`

const Pad = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`

const Key = styled.TouchableHighlight.attrs({
  underlayColor: '#EAEAEA'
})`
  flex: 1;
  min-width: 33%;
  height: 70px;
  align-items: center;
  justify-content: center;
  border-color: #EAEAEA;
  ${props => props.color && css`
    background-color: ${props.color};
    border-width: 0;
  `}
  ${props => props.borderHorizontal && css`
    border-right-width: 1px;
    border-left-width: 1px;
  `}
  ${props => props.borderBottom && css`
    border-bottom-width: 1px;
  `}
  ${props => props.disabled && css`
    background-color: #9A9A9A;
  `}
`

const InputBar = styled.View`
  background-color: blue;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
  height: 50px;
`

class PinPad extends React.PureComponent {
  static defaultProps = {
    onSubmit: value => console.log(value)
  }
  
  state = {
    value: ''
  }

  _MAX_INPUT_SIZE = 6

  _handleOnPress = value => {
    if (this.state.value.length < this._MAX_INPUT_SIZE) {
      this.setState({ value: this.state.value + value })
    }
  }

  _keys = () => ([
    {
      value: '1',
      onPress: () => this._handleOnPress('1'),
      borderBottom: true
    },
    {
      value: '2',
      onPress: () => this._handleOnPress('2'),
      borderHorizontal: true,
      borderBottom: true
    },
    {
      value: '3',
      onPress: () => this._handleOnPress('3'),
      borderBottom: true
    },
    {
      value: '4',
      onPress: () => this._handleOnPress('4'),
      borderBottom: true
    },
    {
      value: '5',
      onPress: () => this._handleOnPress('5'),
      borderHorizontal: true,
      borderBottom: true
    },
    {
      value: '6',
      onPress: () => this._handleOnPress('6'),
      borderBottom: true
    },
    {
      value: '7',
      onPress: () => this._handleOnPress('7')
    },
    {
      value: '8',
      onPress: () => this._handleOnPress('8'),
      borderHorizontal: true,
      borderBottom: true
    },
    {
      value: '9',
      onPress: () => this._handleOnPress('9')
    },
    {
      value: 'C',
      color: 'red',
      onPress: () => this.setState({ value: this.state.value.slice(0, -1) }),
      onLongPress: () => this.setState({ value: '' }),
      textColor: 'white'
    },
    {
      value: '0',
      onPress: () => this._handleOnPress('0')
    },
    {
      value: 'OK',
      color: 'limegreen',
      onPress: () => this.props.onSubmit(this.state.value),
      textColor: 'white',
      disabled: this.state.value.length !== this._MAX_INPUT_SIZE
    }
  ])

  render() {
    return (
      <Container>
        <StatusBar />
        <InputBar>
          <Text color="white">{this.state.value}</Text>
        </InputBar>
        <Pad>
          {this._keys().map(({ value, textColor, ...props }) => (
            <Key key={value} {...props}>
              <Text color={textColor}>{value}</Text>
            </Key>
          ))}
        </Pad>
      </Container>
    )
  }
}

export default PinPad