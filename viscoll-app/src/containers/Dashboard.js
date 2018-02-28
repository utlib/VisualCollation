import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import RaisedButton from 'material-ui/RaisedButton';
import NewProjectContainer from '../components/dashboard/NewProjectContainer';
import EditProjectForm from '../components/dashboard/EditProjectForm';
import ImageCollections from "../components/dashboard/ImageCollections";
import ListView from '../components/dashboard/ListView';
import LoadingScreen from "../components/global/LoadingScreen";
import ServerErrorScreen from "../components/global/ServerErrorScreen";
import NetworkErrorScreen from "../components/global/NetworkErrorScreen";
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
  cloneProject,
} from "../actions/backend/projectActions";
import {
  uploadImages,
  linkImages,
  unlinkImages,
  deleteImages,
} from '../actions/backend/imageActions';

/** Dashboard where user is directed to upon login.  This is where the user an create a new project or edit an existing project. */
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newProjectPopoverOpen: false,
      newProjectModalOpen: false,
      selectedProject: null,
      projectDrawerOpen: false,
      userProfileDialogOpen: false,
      feedbackOpen: false,
      deleteConfirmationOpen: false,
      page: "collations",
    };
  }

  componentWillMount() {
    this.props.user.authenticated ? this.props.loadProjects(this.props) : this.props.history.push('/');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notification!=="") {
      if (nextProps.projects.length>=this.props.projects.length && this.state.page==="collations") {
        this.setState({
          selectedProject: nextProps.projects[0],
          projectDrawerOpen: true,
        })
      } else {
        this.setState({
          selectedProject: null,
          projectDrawerOpen: false,
        })
      }
    }
  }

  componentDidUpdate() {
    if (!this.props.user.authenticated) this.props.history.push('/');
  }

  closeProjectPanel = () => {
    this.setState({projectDrawerOpen: false, selectedProject: null});
  }

  doubleClick = projectID => {
    this.props.resetActionHistory();
    this.props.history.push(`/project/${projectID}`);
  }

  handleProjectSelection = (index) => {
    if (index>=0) {
      let project = this.props.projects[index];
      this.setState({projectDrawerOpen: true, selectedProject: project});
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

  handleDeleteConfirmModalToggle = (value) => {
    this.setState({deleteConfirmationOpen: value});
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

  modalIsOpen = () => {
    return this.state.deleteConfirmationOpen || this.state.feedbackOpen || this.state.newProjectModalOpen || this.state.newProjectPopoverOpen || this.state.userProfileDialogOpen;
  }

  userProfileToggle = (userProfileDialogOpen) => {
    this.setState({userProfileDialogOpen});
  }

  render() {
    let sidebar = (
      <div role="region" aria-label="sidebar" className="sidebar lowerZIndex">
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
        <br />
        <br />
        <br />
          <button
            className={ this.state.page==="collations" ? "dashboard active" : "dashboard" }        
            onClick={() => this.setState({page:"collations", projectDrawerOpen: this.state.selectedProject!==null})} 
            tabIndex={this.modalIsOpen()?-1:0}
            aria-label="Collations"
          >
            Collations
          </button>
          <button
            className={ this.state.page==="image" ? "dashboard active" : "dashboard" }        
            onClick={() => this.setState({page:"image",projectDrawerOpen: false})} 
            tabIndex={this.modalIsOpen()?-1:0}
            aria-label="Image Collections"
          >
            Image Collections
          </button>
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
          selectedProject={this.state.selectedProject} 
          closeProjectPanel={this.closeProjectPanel}
          allProjects={this.props.projects}
          updateProject={this.props.updateProject}
          deleteProject={this.props.deleteProject}
          user={this.props.user}
          history={this.props.history}
          tabIndex={this.modalIsOpen()? -1 : 0}
          togglePopUp={this.handleDeleteConfirmModalToggle}
          />
      </Drawer>
    );

    return (
      <div>
        <TopBar 
          history={this.props.history} 
          tabIndex={this.modalIsOpen()? -1 : 0} 
          togglePopUp={this.userProfileToggle} 
          popUpActive={this.modalIsOpen()}
          goToDashboardProjectList={()=>this.setState({page:"collations"})}
          showUndoRedo={this.state.page==="image"}
        >
          <Tabs tabItemContainerStyle={{backgroundColor: '#ffffff'}}>
            <Tab tabIndex={-1} label="List view" buttonStyle={topbarStyle().tab} />
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
          cloneProject={this.props.cloneProject}
        />
        <div role="main" className={this.state.projectDrawerOpen? "dashboardWorkspace projectPanelOpen" : "dashboardWorkspace"}>
          {this.state.page==="collations"?
            <ListView 
              selectedProjectID={this.state.selectedProject?this.state.selectedProject.id:null}
              selectProject={this.handleProjectSelection} 
              allProjects={this.props.projects} 
              doubleClick={this.doubleClick} 
              tabIndex={this.modalIsOpen()? -1 : 0}
            />
            :
            <ImageCollections
              images={this.props.images}
              projects={this.props.projects}
              togglePopUp={(v)=>this.setState({deleteConfirmationOpen:v})}
              action={{
                uploadImages: this.props.uploadImages,
                linkImages: this.props.linkImages,
                unlinkImages: this.props.unlinkImages,
                deleteImages: this.props.deleteImages,
              }}
            />
          }
        </div>     
        <LoadingScreen loading={this.props.loading} />
        <ServerErrorScreen />
        <NetworkErrorScreen />
        <Notification message={this.props.notification} />
        <Feedback tabIndex={this.modalIsOpen()? -1 : 0 } togglePopUp={(v)=>this.setState({feedbackOpen:v})}/>
      </div>
      );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    projects: state.dashboard.projects,
    images: state.dashboard.images,
    importStatus: state.dashboard.importStatus,
    loading: state.global.loading,
    notification: state.global.notification,
    actionHistory: state.history,
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
    deleteProject: (projectID, deleteUnlinkedImages) => {
      dispatch(deleteProject(projectID, deleteUnlinkedImages));
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
    cloneProject: (projectID) => {
      dispatch(cloneProject(projectID));
    },
    uploadImages: (images) => {
      dispatch(uploadImages(images));
    },
    linkImages: (projectIDs, imageIDs) => {
      dispatch(linkImages(projectIDs, imageIDs));
    },
    unlinkImages: (projectIDs, imageIDs) => {
      dispatch(unlinkImages(projectIDs, imageIDs));
    },
    deleteImages: (imageIDs) => {
      dispatch(deleteImages(imageIDs));
    },
    resetActionHistory: () => {
      dispatch({type:"CLEAR_ACTION_HISTORY"})
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


