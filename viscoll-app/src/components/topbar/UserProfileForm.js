import React from 'react';
import PropTypes from 'prop-types';
import {floatFieldLight} from '../../styles/textfield';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';

/**
 * Form to edit user account information
 */
class UserProfileForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      email: props.email,
      emailMessagePending: false,
      emailMessage: false,
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
      errors: {
        name: "",
        email: "",
        newPassword: "",
        newPasswordConfirm: "",
        currentPassword: ""
      },
      editing: {
        name: false,
        email: false,
        newPassword: false,
        newPasswordConfirm: false,
        currentPassword: false,
      },
      deleteDialog: false,
      unsavedDialog: false,
    };
  }


  componentWillReceiveProps(nextProps) {
    this.setState({ 
      name: nextProps.name,
      errors: {
        ...this.state.errors,
        currentPassword: nextProps.currentPasswordError.toString(),
        email: nextProps.emailTakenError.toString(),
      },
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
      unsavedDialog: false, 
      changed: false,
    }, () => {
      if (this.state.emailMessagePending && this.state.errors.email === "") {
        this.setState({emailMessage:true,emailMessagePending:false});
      }
    });
  }

  /**
   * Validate user input and display appropriate error message
   * @param {string} type text field name
   * @public
   */
  checkValidationError = () => {
    const errors = {};
    // Validate password
    if (this.state.editing.currentPassword || this.state.newPassword) {
      if (!this.state.currentPassword) {
        errors.currentPassword = "Current password cannot be blank";
      } else {
        errors.currentPassword = "";
      }
      if (!this.state.newPasswordConfirm) {
        errors.newPasswordConfirm = "New password confirmation cannot be blank";
      } else if (this.state.newPassword !== this.state.newPasswordConfirm) {
        errors.newPasswordConfirm = "Password confirmation does not match new password";
      } else {
        errors.newPasswordConfirm = "";
      }
      if (!this.state.newPassword) {
        errors.newPassword = "New password cannot be blank";
      } else {
        errors.newPassword = "";
      }
    }
    // Validate name
    if (this.state.editing.name && !this.state.name) {
      errors.name = "Name cannot be blank";
    } else {
      errors.name = "";
    }
    // Validate email
    if (this.state.editing.email) {
      let re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
      if (!this.state.email) {
        errors.email = "Email cannot be blank";
      } else if (!re.test(this.state.email)) {
        errors.email = "Invalid email address";
      } else {
        errors.email = "";
      }
    } 
    return errors;
  }

  /**
   * Return true if any errors exist in the project form
   * @public
   */
  ifErrorsExist = (type) => {
    return (this.state.errors[type]!=="");
  }

  /**
   * Return true if any input fields have been changed and not saved
   * @public
   */
  isEditing = () => {
    return (this.state.editing.name || this.state.editing.email || this.state.editing.currentPassword || this.state.editing.newPassword || this.state.editing.newPasswordConfirm);
  }

  /**
   * Update state when user inputs new value in a text field 
   * @param {string} event 
   * @param {string} newValue new value 
   * @param {string} type text field name
   * @public
   */
  onInputChange = (newValue, type) => {
    this.setState({[type]: newValue, editing: {...this.state.editing, [type]:true}}, () => {
      this.setState({errors: {...this.state.errors, ...this.checkValidationError()}})
    });
  }

  /**
   * Toggle delete confirmation dialog
   * @param {boolean} deleteDialog show dialog?
   * @public
   */
  handleDeleteDialogToggle = (deleteDialog=false) => {
    this.setState({ deleteDialog });
  };

  /**
   * Show ignore changes dialog or close user profile, depending on parameter
   * @param {boolean} ignoreChanges show ignore changes dialog?
   * @public
   */
  handleUserProfileClose = (ignoreChanges=false) => {
    // Check for any unsaved changes before closing and show the warning dialog.
    if (this.isEditing() && !ignoreChanges){
      this.setState({ unsavedDialog: true });
    }
    else {
      this.setState({
        name: this.props.name,
        email: this.props.email,
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
        errors: {
          name: "",
          email: "",
          newPassword: "",
          newPasswordConfirm: "",
          currentPassword: ""
        },
        editing: {
          name: false,
          email: false,
          newPassword: false,
          newPasswordConfirm: false,
          currentPassword: false,
        }
      }, () => this.props.toggleUserProfile());
      
    }
  }

  /**
   * Delete user account
   * @public
   */
  handleUserAccountDelete = () => {
    this.props.toggleUserProfile(false);
    this.props.handleUserAccountDelete();
  }

  /**
   * Toggle unsaved dialog
   * @public
   */
  handleUnsavedDialogToggle = (unsavedDialog=false) => {
    this.setState({ unsavedDialog });
  };

  /**
   * Reset input field to original value 
   * @param {string} type text field name
   * @public
   */
  handleCancelUpdate = (type) => {
    if (type==="currentPassword") {
      this.setState({
        currentPassword:"",
        newPassword:"",
        newPasswordConfirm:"",
        editing: {
          ...this.state.editing,
          currentPassword: false,
          newPassword: false,
          newPasswordConfirm: false,
        },
        errors: {
          ...this.state.errors,
          currentPassword:"",
          newPassword:"",
          newPasswordConfirm:"",
        }
      });
    } else {
      this.setState({
        [type]: this.props[type],
        editing: {
          ...this.state.editing,
          [type]: false,
        },
        errors: {
          ...this.state.errors,
          [type]: "",
        }
      })
    }
  }

  /**
   * Return a generated HTML of submit and cancel buttons for a specific input name
   * @param {string} type text field name
   * @public
   */
  submitButtons = (type) => {
    if (this.state.editing[type]) {
      return (
        <div style={{float:"right"}}>
          <RaisedButton
            aria-label="Submit"
            primary
            icon={<IconSubmit />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            name="submit"
            type="submit"
            disabled={type==="currentPassword"? (this.ifErrorsExist("currentPassword")||this.ifErrorsExist("newPassword")||this.ifErrorsExist("newPasswordConfirm")) : this.ifErrorsExist(type) } 
            onClick={() => this.handleUserUpdate(null, type)}
          />
          <RaisedButton
            aria-label="Cancel"
            secondary
            icon={<IconClear />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            onClick={() => this.handleCancelUpdate(type)}
          />
        </div>
      )
    } else {
      return "";
    }
  }

  /**
   * Update a field in user
   * @param {object} event
   * @param {string} type text field name
   * @public
   */
  handleUserUpdate = (event, type) => {
    if (event) event.preventDefault();
    let updatedUser = { 
      user: {
        [type]: this.state[type],
      }
    };
    if (this.state.currentPassword!=="") {
      updatedUser = {user: {
        current_password: this.state.currentPassword,
        password: this.state.newPassword
      }};
    }
    this.props.handleUserProfileUpdate(updatedUser);
    let types = {};
    if (type==="password") {
      types = {currentPassword: false, newPassword: false, newPasswordConfirm: false};
    } else {
      types = {[type]: false};
    }
    this.setState({editing:{...this.state.editing, ...types}}, ()=> {
      if (type==="email") {
        this.setState({emailMessagePending:true});
      }
    });
  }

  render() {
    const userProfileActions = [
      <FlatButton
        label="Close"
        primary
        keyboardFocused={true}
        onClick={() => this.handleUserProfileClose()}
      />,
      <RaisedButton
        label="Delete Account"
        labelColor="#b53c3c"
        onClick={() => this.handleDeleteDialogToggle(true)}
        style={{float: 'left'}}
      />
    ];
    
    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary
        keyboardFocused
        onClick={() => this.handleDeleteDialogToggle()}
      />,
      <FlatButton
        label="Yes"
        primary
        onClick={() => this.handleUserAccountDelete()}
      />,
    ];

    const unsaveActions = [
      <FlatButton
        label="Go Back"
        primary
        onClick={() => this.handleUnsavedDialogToggle()}
        
      />,
      <FlatButton
        label="Ignore Changes"
        primary
        keyboardFocused
        onClick={() => this.handleUserProfileClose(true)}
      />,
    ];

    const emailConfirmActions = [
      <FlatButton
        label="Okay"
        primary
        onClick={() => this.setState({emailMessage:false})}
        keyboardFocused
      />
    ];

    let nameField = (
      <div>
        <form onSubmit={(e)=>this.handleUserUpdate(e, "name")}>
          <TextField 
            onChange={(e, v)=>this.onInputChange(v, "name")} 
            name="name"  
            floatingLabelText="Name" 
            floatingLabelStyle={{color:"#6e6e6e"}}
            errorText={this.state.errors.name}
            value={this.state.name}
            fullWidth
          />
          {this.submitButtons("name")}
        </form>
      </div>
    );

    let emailField =  (
      <div>
        <form onSubmit={(e)=>this.handleUserUpdate(e, "email")}>
          <TextField 
            onChange={(e,v)=>this.onInputChange(v, "email")} 
            name="email" 
            floatingLabelText="E-mail" 
            floatingLabelStyle={{color:"#6e6e6e"}}
            errorText={this.state.errors.email} 
            value={this.state.email}
            fullWidth
          />
          {this.submitButtons("email")}
        </form>
      </div>
    );

    let password = (
      <div>
        <form onSubmit={(e)=>this.handleUserUpdate(e, "password")}>
          <TextField 
            onChange={(e, v)=>this.onInputChange(v, "currentPassword")} 
            name="currentPassword" 
            floatingLabelText="Current Password" 
            {...floatFieldLight}
            errorText={this.state.errors.currentPassword} 
            type="password" 
            value={this.state.currentPassword}
            fullWidth
          />
          <TextField 
            onChange={(e, v)=>this.onInputChange(v, "newPassword")} 
            name="newPassword" 
            floatingLabelText="New Password" 
            {...floatFieldLight}
            errorText={this.state.errors.newPassword} 
            type="password" 
            value={this.state.newPassword}
            fullWidth
          />
          <TextField 
            onChange={(e, v)=>this.onInputChange(v, "newPasswordConfirm")} 
            name="newPasswordConfirm" 
            floatingLabelText="Confirm New Password" 
            {...floatFieldLight}
            errorText={this.state.errors.newPasswordConfirm} 
            type="password" 
            value={this.state.newPasswordConfirm}
            fullWidth
          />
          {this.submitButtons("currentPassword")}
        </form>
      </div>
    );


    return (
      <div>
        <Dialog
          title="Your Profile"
          actions={userProfileActions}
          modal={true}
          open={this.props.userProfileModalOpen}
          contentStyle={{textAlign: "center", maxWidth: 450}}
          autoScrollBodyContent={true}
          titleStyle={{textAlign:"center"}}
        >
          
          {nameField}
          <br/>
          {emailField}
          <br/>
          <h3 style={{color:"#4e4e4e",marginBottom:0,textAlign:"left"}}>Update your password</h3>
          {password}

          <Dialog
            key="unsavedActionsDialog"
            title="It looks like you have been editing something. If you leave before saving, your changes will be lost."
            actions={unsaveActions}
            open={this.state.unsavedDialog}
            onRequestClose={this.handleUnsavedDialogToggle}
          />
          <Dialog
            key="deleteConfirmationDialog"
            title="Are you sure you want to delete your account?"
            actions={deleteActions}
            open={this.state.deleteDialog}
            onRequestClose={this.handleDeleteDialogToggle}
          />


        </Dialog>
        <Dialog
          actions={emailConfirmActions}
          open={this.state.emailMessage}
          contentStyle={{textAlign: "center"}}
        >
          A confirmation link has been sent to your new email address. 
          <br/>
          Your current email will still remain active until the new email is activated.
        </Dialog>

      </div>
    );
  }
  static propTypes = {
    /** User's name */
    name: PropTypes.string,
    /** User's email address */
    email: PropTypes.string,
    /** Error message for the current password text field */
    currentPasswordError: PropTypes.string,
    /** Error message for the email text field */
    emailTakenError: PropTypes.string,
    /** True if user profile modal should be opened */
    userProfileModalOpen: PropTypes.bool,
    /** Callback to update user account  */
    handleUserProfileUpdate: PropTypes.func,
    /** Callback to toggle the user profile modal  */
    toggleUserProfile: PropTypes.func,
    /** Callback to delete user account  */
    handleUserAccountDelete: PropTypes.func,
  }
}
       
export default UserProfileForm;
