import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ResendConfirmation from './ResendConfirmation';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { btnLg } from '../../styles/button';
import floatFieldDark from '../../styles/textfield';
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
   * @param {string} v new value 
   * @param {string} type text field name
   * @public
   */
  onInputChange(v, type) {
    this.setState({[type]: v});
  }
  /**
   * Submit login information and clear any message
   * @public
   */
  submit = (e) => {
    e.preventDefault();
    this.setState({ error: ""});
    this.props.action.loginUser({email: this.state.email, password: this.state.password});
  }

  /**
   * Cancel button.  Resets local Login state.
   * @public
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
    let content = <form onSubmit={this.submit}>
      <p>{this.state.error}</p>
      <TextField fullWidth onChange={(e,v)=>this.onInputChange(v,"email")} name="email" floatingLabelText="E-mail" {...floatFieldDark} />
      <TextField fullWidth onChange={(e,v)=>this.onInputChange(v,"password")} name="password" type="password" floatingLabelText="Password" {...floatFieldDark} />
      <br /><br />
      {submitButton}
      <div className="spacingTop">
        <RaisedButton default fullWidth onTouchTap={this.cancel} label={"Cancel"} {...btnLg} />
      </div>
      <br /><br />
      <a onClick={this.props.toggleResetRequest}>Forgot password?</a>
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
  static propTypes = {
    /** History object provided by react router. */
    history: PropTypes.object,
    /** User object from the store. */
    user: PropTypes.object,
    /** Dictionary of actions. */
    action: PropTypes.objectOf(PropTypes.func), 
    /** Cancel callback to close this component. */
    tapCancel: PropTypes.func,
    /** Callback to show the reset password form. */
    toggleResetRequest: PropTypes.func,
  }
  
}

export default Login;
