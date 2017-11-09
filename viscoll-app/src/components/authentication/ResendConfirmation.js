import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { btnLg } from '../../styles/button';
import floatFieldDark from '../../styles/textfield';

/**
 * Resend confirmation form.
 */
class ResendConfirmation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: props.message,
      email: props.email,
      submitted: false,
    };
  }

  /**
   * Update state when user inputs new value in a text field 
   * @param {string} v new value 
   * @param {string} type text field name
   * @public
   */
  onChange(v, type) {
    this.setState({[type]: v});
  }

  /**
   * Send confirmation email 
   * @public
   */
  resendConfirmation = () => {
    this.props.action.resendConfirmation(this.state.email);
    this.setState({submitted:true, message: "An email confirmation has been resent to " + this.state.email});
  }


  render() {
    let form = this.state.submitted? "": <form onSubmit={this.submit}>
        <TextField fullWidth value={this.state.email} onChange={(e,v)=>this.onChange(v,"email")} name="email" floatingLabelText="E-mail" {...floatFieldDark} />
        <br /><br />
        <RaisedButton
          label="Resend confirmation email"
          primary
          fullWidth
          {...btnLg}
          onTouchTap={this.resendConfirmation}
        />
      </form>;

    return (
      <div>
        <p>{this.state.message}</p>
        {form}
        <div className="spacingTop">
          <RaisedButton default fullWidth onTouchTap={this.props.tapCancel} label={this.state.submitted?"Okay": "Cancel"} {...btnLg} />
        </div>
      </div>);
  }
}
export default ResendConfirmation;