import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as DOM from 'react-dom-factories'
import bind from 'bind-decorator'

interface ButtonProps {
  modifier?: string
  title?: string
}

interface ButtonState {
  count: number
}

export default class Button extends React.PureComponent<ButtonProps, ButtonState> {
  constructor (props: ButtonProps) {
    super(props)

    this.state = {
      count: 5,
    }
  }

  @bind
  onButtonClick (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    this.setState({count: this.state.count * 2})
  }

  @bind
  onMouseOver (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    this.setState({count: this.state.count * 2})
  }

  render () {
    return <button
      onClick={this.onButtonClick}
      onMouseEnter={this.onMouseOver}
      className={`Button Button--${this.props.modifier}`}
    >
      {this.props.title} {this.state.count}
      <SomeFunctionalComponent count={this.state.count} />
    </button>
  }
}


function SomeFunctionalComponent(props: any) {
  return <span>{`I AM A FUNCTIONAL COMPONENT ${props.count}`}</span>
}





