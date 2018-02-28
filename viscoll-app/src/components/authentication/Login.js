import React, { Component } from 'react';
import ResendConfirmation from './ResendConfirmation';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { btnLg, btnAuthCancel } from '../../styles/button';
import {floatFieldDark} from '../../styles/textfield';

/**
 * Contains the login form that is used by the landing page component called `Landing`.
 */
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.errors.login.errorMessage!==undefined) {
      this.setState({error: nextProps.user.errors.login.errorMessage[0]});
    }
  }

  componentDidUpdate() {
    if (this.props.user.authenticated) {
      this.props.history.push("/dashboard");
    }
  }

  /**
   * Update state when user inputs new value in a text field 
   */
  onInputChange(v, type) {
    this.setState({[type]: v});
  }
  /**
   * Submit login information and clear any message
   */
  submit = (e) => {
    if (e) e.preventDefault();
    this.setState({ error: ""});
    this.props.action.loginUser({email: this.state.email, password: this.state.password});
  }

  /**
   * Cancel button.  Resets local Login state.
   */
  cancel = () => {
    this.setState({email:"",password:"",error:""});
    this.props.tapCancel();
  }

  render() {
    let submitButton = <RaisedButton 
      label="Submit" 
      type="submit"
      name="submit"
      primary 
      fullWidth 
      {...btnLg} 
    />
    let content = <form aria-label="login" onSubmit={this.submit}>
      <p>{this.state.error}</p>
      <TextField fullWidth onChange={(e,v)=>this.onInputChange(v,"email")} name="email" floatingLabelText="E-mail" {...floatFieldDark} aria-invalid={this.state.error && this.state.error.length>0} aria-required={true}/>
      <TextField fullWidth onChange={(e,v)=>this.onInputChange(v,"password")} name="password" type="password" floatingLabelText="Password" {...floatFieldDark} aria-invalid={this.state.error && this.state.error.length>0} aria-required={true} />
      <br /><br />
      {submitButton}
      <div className="spacingTop">
        <FlatButton 
          onClick={() => this.cancel()}
          label={"Go back"} 
          {...btnAuthCancel}
        />
        <FlatButton 
          label="Forgot password?"
          labelStyle={{color:"#a5bde0"}}
          onClick={() => this.props.toggleResetRequest()}
        />
      </div>
     
    </form>;
    if (this.state.error && this.state.error.includes("unconfirmed")) {
      content = <ResendConfirmation 
          action={{resendConfirmation: this.props.action.resendConfirmation}}
          message="Your account has not been activated yet.  Resend confirmation email?" 
          email={this.state.email}
          tapCancel={this.props.tapCancel}
        /> 
    }
    return (
      content
    );
  }
}

export default Login;
