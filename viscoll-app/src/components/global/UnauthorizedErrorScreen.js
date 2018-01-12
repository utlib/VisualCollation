import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from "react-redux";
import { logout } from "../../actions/userActions";

class AnauthorizedErrorScreen extends Component {

  render() {

    const actions = [
      <FlatButton
        label="Logout Now"
        primary={true}
        keyboardFocused={true}
        onClick={()=>this.props.logout()}
      />,
    ];

    return (
      <Dialog
        open={this.props.unauthorizedError}
        style={{zIndex: 2500}}
        title="Uh-oh!"
        actions={actions}
      >
        Your session has expired. Please logout and log back in to get back to business. 
      </Dialog>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    unauthorizedError: state.global.unauthorizedError
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(logout())
    }
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(AnauthorizedErrorScreen);
