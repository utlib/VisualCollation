import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Drawer from 'material-ui/Drawer';
import RaisedButton from 'material-ui/RaisedButton';
import NewProjectContainer from '../components/dashboard/NewProjectContainer';
import EditProjectForm from '../components/dashboard/EditProjectForm';
import ListView from '../components/dashboard/ListView';
import LoadingScreen from "../components/global/LoadingScreen";
import Notification from "../components/global/Notification";
import TopBar from "./TopBar";
import Feedback from "./Feedback";
import {Tabs,Tab} from 'material-ui/Tabs';
import topbarStyle from "../styles/topbar";
import {btnMd} from '../styles/button';
import { connect } from "react-redux";
import { 
  createProject, 
  updateProject, 
  deleteProject,
  loadProjects,
  importProject,
  cloneProjectExport,
  cloneProjectImport
} from "../actions/projectActions";

/** Dashboard where user is directed to upon login.  This is where the user an create a new project or edit an existing project. */
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newProjectPopoverOpen: false,
      newProjectModalOpen: false,
      selectedProjectIndex: -1,
      selectedProject: {},
      projectDrawerOpen: false,
      userProfileDialogOpen: false,
      feedbackOpen: false,
    };
  }

  componentWillMount() {
    this.props.user.authenticated ? this.props.loadProjects(this.props) : this.props.history.push('/');
  }

  componentDidUpdate() {
    if (!this.props.user.authenticated) this.props.history.push('/');
  }

  closeProjectPanel = () => {
    this.setState({projectDrawerOpen: false, selectedProjectIndex: -1, selectedProject: {}});
  }

  doubleClick = projectID => this.props.history.push(`/project/${projectID}`);

  handleProjectSelection = (index) => {
    if (index>=0) {
      let project = this.state.selectedProject;
      let toggle = this.state.projectDrawerOpen;
      project = this.props.projects[index];
      if (!Object.keys(this.state.selectedProject).length>0) {toggle = !toggle};
      this.setState({projectDrawerOpen: toggle, selectedProject: project, selectedProjectIndex: index});
    } 
  }

  handleNewProjectTouchTap = (event) => {
    event.preventDefault();
    this.setState({newProjectPopoverOpen: true, popoverAnchorEl: event.currentTarget});
  };

  handleNewProjectRequestClose = () => this.setState({ newProjectPopoverOpen: false });

  handleNewProjectModalToggle = (value) => {
    this.setState({newProjectModalOpen: value, newProjectPopoverOpen: false});
  }

  handleImportProject = (data) => {
    this.props.importProject(data)
    .then((action)=>{
      if (action.type==="IMPORT_PROJECT_SUCCESS"){
        this.handleProjectSelection(0);
        this.props.importProjectCallback();
      }
    });
  }

  handleCloneProject = (projectID) => {
    this.props.cloneProjectExport(projectID)
    .then((action)=>{
      if (action.type==="CLONE_PROJECT_EXPORT_SUCCESS"){
        const importData = JSON.stringify(action.payload, null, 4);
        this.props.cloneProjectImport({importData, importFormat: "json"})
        .then((action)=>{
          if (action.type==="CLONE_PROJECT_IMPORT_SUCCESS"){
            this.handleProjectSelection(0);
            this.props.importProjectCallback();
          }
        })
      }
    });
  }

  modalIsOpen = () => {
    return this.state.feedbackOpen || this.state.newProjectModalOpen || this.state.newProjectPopoverOpen || this.state.userProfileDialogOpen;
  }

  userProfileToggle = (userProfileDialogOpen) => {
    this.setState({userProfileDialogOpen});
  }

  render() {
    let sidebar = (
      <div role="region" aria-label="sidebar" className="sidebar">
        <hr />           
        <br />            
        <RaisedButton
          label="New"
          primary
          style={{width:"80%", marginLeft:"10%"}}
          {...btnMd}
          onClick={() => this.handleNewProjectModalToggle(true)}
          tabIndex={this.modalIsOpen()? -1 : 0}
          aria-label="Create new collation"
        />
      </div>
    );
    let projectPane = (
      <Drawer 
        openSecondary={true}
        open={this.state.projectDrawerOpen}
        docked={true}
        width={400}
        containerStyle={{top: 55}}
        zDepth={1}
      >
        <EditProjectForm 
          selectedProject={this.props.projects[this.state.selectedProjectIndex]} 
          selectedProjectIndex={this.state.selectedProjectIndex}
          closeProjectPanel={this.closeProjectPanel}
          allProjects={this.props.projects}
          updateProject={this.props.updateProject}
          deleteProject={this.props.deleteProject}
          user={this.props.user}
          history={this.props.history}
          tabIndex={this.modalIsOpen()? -1 : 0}
          />
      </Drawer>
    );

    return (
      <div>
        <TopBar history={this.props.history} tabIndex={this.modalIsOpen()? -1 : 0} togglePopUp={this.userProfileToggle}>
          <Tabs tabItemContainerStyle={{backgroundColor: '#ffffff'}}>
            <Tab tabIndex={-1} label="List view" buttonStyle={topbarStyle.tab} />
          </Tabs>
        </TopBar>
        {sidebar}
        {projectPane}
        <NewProjectContainer 
          allProjects={this.props.projects}
          open={this.state.newProjectModalOpen} 
          close={()=>this.handleNewProjectModalToggle(false)}
          user={this.props.user}
          createProject={this.props.createProject}
          importProject={this.handleImportProject}
          importStatus={this.props.importStatus}
          cloneProject={this.handleCloneProject}
        />
        <div role="main" className={this.state.projectDrawerOpen? "dashboardWorkspace projectPanelOpen" : "dashboardWorkspace"}>
          <ListView 
            selectedProjectIndex={this.state.selectedProjectIndex}
            selectProject={this.handleProjectSelection} 
            allProjects={this.props.projects} 
            doubleClick={this.doubleClick} 
            tabIndex={this.modalIsOpen()? -1 : 0}
          />
        </div>     
        <LoadingScreen loading={this.props.loading} />
        <Notification message={this.props.notification} />
        <Feedback tabIndex={this.modalIsOpen()? -1 : 0 } togglePopUp={(v)=>this.setState({feedbackOpen:v})}/>
      </div>
      );
  }
  static propTypes = {
    /** History object from React Router */
    history: PropTypes.object,
    /** User object from Redux store */
    user: PropTypes.object,
    /** Array of project objects from Redux store */
    projects: PropTypes.arrayOf(PropTypes.object),
    /** Boolean if loading screen should appear - from Redux store */
    loading: PropTypes.bool,
    /** Notification message from Redux store */
    notification: PropTypes.string,
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    projects: state.projects.projects,
    importStatus: state.projects.importStatus,
    loading: state.global.loading,
    notification: state.global.notification
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createProject: (newProject) => {
      dispatch(createProject(newProject));
    },
    updateProject: (projectID, project) => {
      dispatch(updateProject(projectID, project))
    },
    deleteProject: (projectID) => {
      dispatch(deleteProject(projectID));
    },
    loadProjects: (props) => {
      dispatch(loadProjects());
    },
    importProject: (data) => {
      return dispatch(importProject(data))
    },
    importProjectCallback: () => {
      dispatch({type: "IMPORT_PROJECT_SUCCESS_CALLBACK"});
    },
    cloneProjectExport: (projectID) => {
      return dispatch(cloneProjectExport(projectID));
    },
    cloneProjectImport: (data) => {
      return dispatch(cloneProjectImport(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


