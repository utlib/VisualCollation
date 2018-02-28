import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { btnLg, btnAuthCancel } from '../../styles/button';
import {floatFieldDark} from '../../styles/textfield';

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
   */
  onChange(v, type) {
    this.setState({[type]: v});
  }

  /**
   * Send confirmation email 
   */
  resendConfirmation = () => {
    this.props.action.resendConfirmation(this.state.email);
    this.setState({submitted:true, message: "An email confirmation has been resent to " + this.state.email});
  }

  render() {
    let form = this.state.submitted? "": <form aria-label="resend confirmation" onSubmit={this.submit}>
        <TextField fullWidth value={this.state.email} onChange={(e,v)=>this.onChange(v,"email")} name="email" floatingLabelText="E-mail" {...floatFieldDark} />
        <br /><br />
        <RaisedButton
          label="Resend confirmation email"
          primary
          fullWidth
          {...btnLg}
          onClick={() => this.resendConfirmation()}
        />
      </form>;

      let cancel = <FlatButton 
        default 
        onClick={() => this.props.tapCancel()}
        label="Go back"
        {...btnAuthCancel} 
      />;

      if (this.state.submitted) {
        cancel = <RaisedButton 
          default 
          fullWidth 
          label="Okay"
          {...btnLg} 
          onClick={() => this.props.tapCancel()}
        />;
      }

    return (
      <div>
        <p>{this.state.message}</p>
        {form}
        <div className="spacingTop">
          {cancel}
        </div>
      </div>);
  }
}
export default ResendConfirmation;