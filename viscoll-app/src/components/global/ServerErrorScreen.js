import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { connect } from "react-redux";
import { logout } from "../../actions/userActions";

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
        Re-Login into your account to get back to business. <br/>
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
      dispatch(logout())
    }
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(ServerErrorScreen);
