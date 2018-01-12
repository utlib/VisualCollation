import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import imgCollation from '../assets/collation.png';
import imgLogo from '../assets/logo_white.png';
import Register from '../components/authentication/Register';
import Login from '../components/authentication/Login';
import ResetPassword from '../components/authentication/ResetPassword';
import ResetPasswordRequest from '../components/authentication/ResetPasswordRequest';
import ResendConfirmation from '../components/authentication/ResendConfirmation';
import {btnLg} from '../styles/button';
import { connect } from "react-redux";
import NetworkErrorScreen from "../components/global/NetworkErrorScreen";
import { 
  login, 
  register, 
  confirm, 
  resetPasswordRequest, 
  resetPassword,
  logout,
  resendConfirmation,
} from "../actions/userActions";


/** Landing page of the app.  Contain register, login and password reset forms. */
class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      register: false,
      login: false,
      reset: false,
      resetRequest: false,
      reset_token: "",
      message: "",
      resendConfirmation: false,
      resendConfirmationSuccess: false,
    }
  }
  /**
   * Toggle the `Register` component
   * @public
   */
  toggleRegister = () => {
    this.setState({register: !this.state.register, message: ""});
  }

  /**
   * Toggle the `Login` component
   * @public
   */
  toggleLogin = () => {
    this.setState({login: !this.state.login, message: ""});
  }

  /**
   * Toggle the `ResetPassword` component
   * @public
   */
  toggleResetRequest = () => {
    this.setState({resetRequest: !this.state.resetRequest, message: ""});
  }

  /**
   * Unmount any mounted forms
   * @public
   */
  tapCancel = () => {
    this.setState({login: false, register: false, resetRequest: false, resendConfirmation: false, message: ""});
  }

  /**
   * Show message on reset password success
   * @public
   */
  handleResetPasswordSuccess = () => {
    this.setState({reset: false, message: "Your password has been successfully updated. Go ahead and login."});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.errors.confirmation.length>0) {
      this.setState({resendConfirmation: true});
    }
    if (nextProps.notification.includes("successfully confirmed your account")) {
      this.setState({message: nextProps.notification, resendConfirmationSuccess: true});
    }
  }

  componentDidMount() {
    const token = this.props.location.search.split('=')[1];
    if (token) {
      if (this.props.location.pathname.includes("confirmation")){
        this.props.confirmUser(token);
        if (this.props.user.authenticated) this.props.logoutUser();
      } else if (this.props.location.pathname.includes("password")) {
        this.setState({ reset: true, reset_token: token });
      }
    } else {
      if (this.props.user.authenticated) {
        this.props.history.push('/dashboard');
      }
    }
  }

  render() {
    const message = this.state.message? <p>{this.state.message}</p> : "";

    let resetPassword = "";
    let resetPasswordRequest = "";
    let resendConfirmation = "";

    let register = (
      <div className="spacingBottom">
        <RaisedButton 
          primary fullWidth 
          onClick={() => this.toggleRegister()}
          label="Create account" 
          {...btnLg} 
        />
      </div>
    );
    let login = (
      <div className="spacingBottom">
        <RaisedButton 
          fullWidth 
          onClick={() => this.toggleLogin()}
          label="Login" 
          {...btnLg} 
        />
      </div>
    );
    
    if (this.state.register) {
      register =  <Register 
                    action={{registerUser: this.props.registerUser}}
                    userState={this.props.user} 
                    tapCancel={this.tapCancel} 
                  />;
      login = "";
    } else if (this.state.resetRequest) {
      login = "";
      register = "";
      resetPassword =  "";
      resetPasswordRequest = <ResetPasswordRequest
                                action={{resetPasswordRequest: this.props.resetPasswordRequest}}
                                tapCancel={this.tapCancel}
                              />
    } else if (this.state.login) {
        register = "";
        login = <Login 
                  history={this.props.history}
                  user={this.props.user} 
                  action={{loginUser: this.props.loginUser, resendConfirmation: this.props.resendConfirmation}} 
                  tapCancel={this.tapCancel}
                  toggleResetRequest={this.toggleResetRequest}
                />;
    } else if (this.state.reset) {
      login = "";
      register = "";
      resetPassword =  <ResetPassword 
                          resetPassword={this.props.resetPassword}
                          reset_password_token={this.state.reset_token}
                          handleResetPasswordSuccess={this.handleResetPasswordSuccess}
                        />;
      
    } else if (this.state.resendConfirmation) {
      login = "";
      register = "";
      resendConfirmation = <ResendConfirmation 
        action={{resendConfirmation: this.props.resendConfirmation}}
        message={this.props.user.errors.confirmation}
        email={""}
        tapCancel={this.tapCancel}
      />
    } else if (this.state.resendConfirmationSuccess) {
      register = "";
    }

    return (
      <div className="landing">
        <div className="container">
          <div className="panelLogo">
            <img src={imgCollation} alt="Collation illustration"/>
          </div>
          <div className="panelLogin" role="main">
            <img src={imgLogo} alt="VisColl logo"/>
            <hr />
            <br />
            {message}
            {register}
            {login}
            {resetPasswordRequest}
            {resetPassword}
            {resendConfirmation}
          </div>
        </div>
        <div className="panelBottom"></div>
        <NetworkErrorScreen />
      </div>
    );
  }
  static propTypes = {
    /** History object from React Router */
    history: PropTypes.object,
    /** Location object from React Router */
    location: PropTypes.object,
    /** Match object from React Router */
    match: PropTypes.object,
    /** User object from Redux store */
    user: PropTypes.object,
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
    notification: state.global.notification,
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    logoutUser: () => {
      dispatch(logout());
    },
    loginUser: (user) => {
      dispatch(login(user));
    },
    registerUser: (user) => {
      dispatch(register(user));
    },
    confirmUser: (confirmation_token) => {
      dispatch(confirm(confirmation_token));
    },
    resetPasswordRequest: (email) => {
      dispatch(resetPasswordRequest(email));
    },
    resetPassword: (reset_token, password) => {
      dispatch(resetPassword(reset_token, password));
    },
    resendConfirmation: (email) => {
      dispatch(resendConfirmation(email));
    },
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(Landing);
