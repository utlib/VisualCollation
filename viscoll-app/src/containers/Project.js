import React, {Component} from 'react';
import { connect } from "react-redux";
import CollationManager from './CollationManager'
import NotesManager from './NotesManager';
import ImageManager from './ImageManager';
import LoadingScreen from "../components/global/LoadingScreen";
import Notification from "../components/global/Notification";
import ServerErrorScreen from "../components/global/ServerErrorScreen";
import NetworkErrorScreen from "../components/global/NetworkErrorScreen";
import Feedback from "./Feedback";
import { loadProject } from "../actions/backend/projectActions";


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
    this.props.user.authenticated ? this.props.loadProject(projectID) : this.props.history.push('/');
  }

  componentDidUpdate() {
    if (!this.props.user.authenticated) this.props.history.push('/');
  }

  togglePopUp = (value) => {
    this.setState({popUpActive: value});
  }

  render() { 
    const collationManager = (<CollationManager history={this.props.history} togglePopUp={this.togglePopUp} popUpActive={this.state.popUpActive||this.props.loading} />);
    const notesManager = (<NotesManager history={this.props.history} togglePopUp={this.togglePopUp} popUpActive={this.state.popUpActive||this.props.loading} />);
    const imageManager = (<ImageManager history={this.props.history} togglePopUp={this.togglePopUp} popUpActive={this.state.popUpActive||this.props.loading} />);
    let manager;
    switch (this.props.managerMode) {
      case "collationManager":
        manager = collationManager;
        break;
      case "notesManager":
        manager = notesManager;
        break;
      case "imageManager":
        manager = imageManager;
        break;
      default:
        // Must never reach here.
        manager = (<div> Oh No !! Something went wrong </div>);
    }
    return (
      <div>
        {manager}
        <LoadingScreen loading={this.props.loading} />
        <Notification message={this.props.notification} />
        <Feedback togglePopUp={this.togglePopUp} tabIndex={this.state.popUpActive?-1:0} />
        <ServerErrorScreen />
        <NetworkErrorScreen />
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
    managerMode: state.active.managerMode,
    loading: state.global.loading,
    notification: state.global.notification,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadProject: (projectID) => {
      dispatch(loadProject(projectID))
    }
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(Project);

