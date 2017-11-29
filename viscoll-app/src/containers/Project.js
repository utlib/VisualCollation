import React, {Component} from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import CollationManager from './CollationManager'
import NotesManager from './NotesManager';
import ImageManager from './ImageManager';
import LoadingScreen from "../components/global/LoadingScreen";
import Notification from "../components/global/Notification";
import Feedback from "./Feedback";
import { loadProject } from "../actions/editCollation/modificationActions";


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
    const collationManager = (<CollationManager history={this.props.history} togglePopUp={this.togglePopUp} popUpActive={this.state.popUpActive} />);
    const notesManager = (<NotesManager history={this.props.history} togglePopUp={this.togglePopUp} popUpActive={this.state.popUpActive} />);
    const imageManager = (<ImageManager history={this.props.history} togglePopUp={this.togglePopUp} popUpActive={this.state.popUpActive} />);
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
      </div>
    )
  }

  static propTypes = {
    /** History object from React Router */
    history: PropTypes.object,
    /** Location object from React Router */
    location: PropTypes.object,
    /** User object from Redux store */
    user: PropTypes.object,
    /** Boolean if loading screen should appear - from Redux store */
    loading: PropTypes.bool,
    /** Notification message from Redux store */
    notification: PropTypes.string,
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

