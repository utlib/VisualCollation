import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { btnLg, btnAuthCancel } from '../../styles/button';
import {floatFieldDark} from '../../styles/textfield';
/**
 * Contains the reset password request form that is used by the landing page 
 * component called `Landing`.  User inputs their email address and the app 
 * will email them a link to change their password. The component that handles the
 * password change is `ResetPassword`.
 */
class ResetPasswordRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      resetMessage: "",
      requested: false,
    };
  }

  /**
   * Update state when user inputs new value in a text field 
   */
  onInputChange(v, type) {
    this.setState({[type]: v});
  }

  /**
   * Validate email address and submit password reset request
   */
  resetPasswordRequest = (e) => {
    if (e) e.preventDefault();
    let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    let resetMessage = ""
    if (!this.state.email) {
      resetMessage = "Please enter your email address to reset the password.";
    } else if (!re.test(this.state.email)) {
      resetMessage = "Please enter a valid email address.";
    }
    else {
      this.props.action.resetPasswordRequest(this.state.email);
      resetMessage = "If this email address exists in our system, we've sent a password reset link to it."
      this.setState({requested:true});
    }
    this.setState({ resetMessage })
  };

  render() {
    let cancelButton = <FlatButton 
        default 
        onClick={() => this.props.tapCancel()}
        label="Go back" 
        {...btnAuthCancel}
      />;
    let submit = 
        <div className="spacingTop">
          <RaisedButton 
            label="Submit" 
            fullWidth 
            primary 
            type="submit"
            name="submit"
            {...btnLg}
            onClick={() => this.resetPasswordRequest(null)}
            />
        </div>;
    if (this.state.requested) {
      cancelButton = <RaisedButton
        fullWidth 
        onClick={() => this.props.tapCancel()}
        label="Okay" 
        {...btnLg}
      />;
      submit = "";
    }
    return (
      <form aria-label="request to reset password" onSubmit={this.resetPasswordRequest}>
        <p>{this.state.resetMessage}</p>
        <TextField fullWidth onChange={(e,v)=>this.onInputChange(v,"email")} name="email" floatingLabelText="E-mail" {...floatFieldDark} />
        { submit }
        <div className="spacingTop">
          { cancelButton }
        </div>
      </form>
    )
  }
}
export default ResetPasswordRequest;
