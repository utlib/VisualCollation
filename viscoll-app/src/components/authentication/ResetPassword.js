import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { btnLg } from '../../styles/button';
import {floatFieldDark} from '../../styles/textfield';
/**
 * Contains the form to update password when user forgets password.
 */
class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      passwordConfirm: "",
      resetMessage: ""
    };
  }

  /**
   * Update state when user inputs new value in a text field 
   * @param {string} v new value 
   * @param {string} type text field name
   * @public
   */
  onInputChange = (v, type) => {
    this.setState({ [type]: v });
  }

  /**
   * Validate password input and submit password change
   * @public
   */
  submit = (e) => {
    if (e) e.preventDefault();
    let resetMessage = ""
    if (!this.state.password || !this.state.passwordConfirm) {
      resetMessage = "Error: Both Password & Password Confirmation must be filled";
    } else if (this.state.password !== this.state.passwordConfirm) {
      resetMessage = "Error: Both Password & Password Confirmation must match";
    }
    else {
      const reset_password_token = this.props.reset_password_token;
      const password = {
        password: this.state.password,
        password_confirmation: this.state.passwordConfirm
      };
      this.props.resetPassword(reset_password_token, password);
      this.props.handleResetPasswordSuccess();
    }
    this.setState({ resetMessage })
  };


  render() {
    return (
      <form aria-label="reset password" onSubmit={this.submit}>
        <h4 style={{color: "rgb(78, 214, 203)", textAlign: "center"}}>{this.state.resetMessage}</h4>
        <TextField fullWidth onChange={(e,v)=>this.onInputChange(v, "password")} name="password" type="password" floatingLabelText="New Password" {...floatFieldDark} />
        <TextField fullWidth onChange={(e,v)=>this.onInputChange(v, "passwordConfirm")} name="passwordConfirm" type="password" floatingLabelText="Confirm New Password" {...floatFieldDark} />
        <br /><br />
        <RaisedButton 
          label="Update Password" 
          primary 
          fullWidth 
          type="submit"
          name="submit"
          {...btnLg} 
          onClick={() => this.submit(null)}
        />
      </form>
    );
  }

  static propTypes = {
    /** Callback function to submit password change. */
    resetPassword: PropTypes.func,
    /** Reset password token. */
    reset_password_token: PropTypes.string, 
    /** Success callback to close this component. */
    handleResetPasswordSuccess: PropTypes.func,
  }
}

export default ResetPassword;
