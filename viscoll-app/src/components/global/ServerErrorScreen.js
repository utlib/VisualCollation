import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from "react-redux";

/** Dialog for server error */
class ServerErrorScreen extends Component {

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
        open={this.props.serverError}
        style={{zIndex: 2500}}
        title="Uh-oh!"
        actions={actions}
      >
        Something has gone wrong likely having to do with internets and tubes. <br/>
        Re-login into your account to get back to business. <br/>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    serverError: state.global.serverError
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch({type: "LOGOUT_SUCCESS"})
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServerErrorScreen);
