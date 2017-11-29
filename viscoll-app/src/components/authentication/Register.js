import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { btnLg, btnAuthCancel } from '../../styles/button';
import {floatFieldDark} from '../../styles/textfield';
/**
 * Contains the registration form that is used by the landing page component called `Landing`.
 */
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
    };
    this.submit = this.submit.bind(this);
  }
  /**
   * Update state when user inputs new value in a text field 
   * @param {string} v new value 
   * @param {string} type text field name
   * @public
   */
  onInputChange = (v, type) => {
    this.setState({[type]: v});
  }
  /**
   * Submit registration information
   * @public
   */
  submit = (e) => {
    if (e) e.preventDefault();
    this.props.action.registerUser({...this.state});
  }

  render() {
    let emailError = "";
    let passwordError = "";
    let registerSuccess = false;
    try {
      emailError = this.props.userState.errors.register.email;
      passwordError = this.props.userState.errors.register.password;
      registerSuccess = this.props.userState.registerSuccess;
    } catch (e) {}

    let registerForm = (
      <form aria-label="register" onSubmit={this.submit}>
        <TextField 
          fullWidth onChange={(e, v)=>this.onInputChange(v, "name")} 
          name="name"  
          floatingLabelText="Name" 
          {...floatFieldDark} 
        />
        
        <TextField 
          fullWidth onChange={(e,v)=>this.onInputChange(v, "email")} 
          name="email" 
          floatingLabelText="E-mail" 
          {...floatFieldDark} 
          errorText={emailError} 
          aria-invalid={emailError && emailError.length>0}
          aria-required={true}
        />
        
        <TextField 
          fullWidth 
          onChange={(e, v)=>this.onInputChange(v, "password")} 
          name="password" 
          floatingLabelText="Password" 
          {...floatFieldDark} 
          errorText={passwordError} 
          type="password" 
          aria-invalid={passwordError && passwordError.length>0}
          aria-required={true}
        />

        <br /><br />
        <RaisedButton 
          label="Submit" 
          primary 
          fullWidth {...btnLg} 
          type="submit"
          name="submit"
        />
        <div className="spacingTop">
          <FlatButton 
            onClick={() => this.props.tapCancel()}
            label="Go back" 
            {...btnAuthCancel}
          />
        </div>
      </form>
    );

    const successMessage = (
      <div>
        <p> 
          Registration successful! You will be notified by email once your account has been approved.
        </p>
        <br />
        <RaisedButton 
          fullWidth {...btnLg} 
          onClick={() => this.props.tapCancel()}
          label="Okay" 
        />
      </div>
    );
    
    if (registerSuccess) {
      return successMessage;
    } else {
      return registerForm;
    }
  }
  static propTypes = {
    /** User object from the store. */
    userState: PropTypes.object,
    /** Dictionary of actions. */
    action: PropTypes.objectOf(PropTypes.func), 
    /** Cancel callback to close this component. */
    tapCancel: PropTypes.func,
  }
}

export default Register;
