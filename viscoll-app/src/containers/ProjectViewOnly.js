import React, {Component} from 'react';
import { connect } from "react-redux";
import CollationManager from './CollationManagerViewOnly'
import LoadingScreen from "../components/global/LoadingScreen";
import Notification from "../components/global/Notification";
import NetworkErrorScreen from "../components/global/NetworkErrorScreen";
import { loadProjectViewOnly } from "../actions/backend/projectActions";

/** Container for 'Manager (Collation or Notes or Image)', `LoadingScreen`, and `Notification`. */
class Project extends Component {

  constructor(props) {
    super(props);
    this.state = {
      popUpActive: false,
    };
  }

  componentWillMount() {
    const projectID = this.props.location.pathname.split("/")[2];
    this.props.loadProjectViewOnly(projectID);
  }

  togglePopUp = (value) => {
    this.setState({popUpActive: value});
  }

  render() { 
    return (
      <div>
        <CollationManager
          history={this.props.history}
          togglePopUp={this.togglePopUp}
          popUpActive={this.state.popUpActive || this.props.loading}
        />
        <LoadingScreen loading={this.props.loading} />
        <Notification message={this.props.notification} />
        <NetworkErrorScreen />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    loading: state.global.loading,
    notification: state.global.notification,
    projectID: state.active.project.id,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadProjectViewOnly: (projectID) => {
      dispatch(loadProjectViewOnly(projectID))
    },
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(Project);

