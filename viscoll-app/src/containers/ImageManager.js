import React, {Component} from 'react';
import { connect } from "react-redux";
import TopBar from "./TopBar";
import {Tabs, Tab} from 'material-ui/Tabs';
import topbarStyle from "../styles/topbar";
import Panel from '../components/global/Panel';
import { 
  changeManagerMode,
  changeImageTab, 
} from "../actions/backend/interactionActions";
import { 
  createManifest,
  updateManifest,
  deleteManifest,
  cancelCreateManifest,
} from "../actions/backend/manifestActions";
import {
  sendFeedback,
} from "../actions/backend/userActions";
import {
  mapSidesToImages,
  uploadImages,
  linkImages,
  unlinkImages,
  deleteImages,
} from "../actions/backend/imageActions";
import ManageManifests from '../components/imageManager/ManageManifests';
import MapImages from '../components/imageManager/MapImages';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import FlatButton from 'material-ui/FlatButton';
import {radioBtnDark} from "../styles/button";
import ManagersPanel from '../components/global/ManagersPanel';

class ImageManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectAll: "",
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  resizeHandler = () => {
    this.setState({windowWidth:window.innerWidth});
  }

  createManifest = (manifest) => {
    this.props.createManifest(this.props.projectID, manifest)
  }

  updateManifest = (manifest) => {
    this.props.updateManifest(this.props.projectID, manifest)
  }

  deleteManifest = (manifest) => {
    this.props.deleteManifest(this.props.projectID, manifest)
  }

  linkImages = (imageIDs) => {
    this.props.linkImages([this.props.projectID], imageIDs, this.props.manifests["DIYImages"], this.props.images);
  }

  unlinkImages = (imageIDs) => {
    this.props.unlinkImages([this.props.projectID], imageIDs, this.props.manifests["DIYImages"]);
  }

  uploadImages = (images) => {
    this.props.uploadImages(images, this.props.projectID);
  }

  handleSelection = (selectAll) => {
    this.setState({ selectAll })
  }


  deleteImages = (imageIDs) => {
    this.props.deleteImages(imageIDs, this.props.manifests["DIYImages"]);
  }

  renderRadioButton = (value, label) => {
    return (
      <RadioButton
        value={value}
        label={label}
        aria-label={label}
        labelStyle={{color:"#ffffff",fontSize:"0.9em"}}
        iconStyle={{fill:"#4ED6CB"}}
        tabIndex={this.props.popUpActive?-1:0}
        {...radioBtnDark()}
      />
    )
  }

  render() {
    let content = "";
    if (this.props.activeTab==="MANAGE") {
      content = (
        <ManageManifests 
          projectID={this.props.projectID}
          manifests={this.props.manifests} 
          action={{
            createManifest:this.createManifest,
            updateManifest:this.updateManifest,
            deleteManifest:this.deleteManifest,
            cancelCreateManifest:this.props.cancelCreateManifest,
            linkImages: this.linkImages,
            unlinkImages:this.unlinkImages,
            deleteImages:this.deleteImages,
            uploadImages: this.uploadImages,
          }}
          createManifestError={this.props.createManifestError}
          images={this.props.images}
          tabIndex={this.props.popUpActive?-1:0}
          togglePopUp={this.props.togglePopUp}
        />
      )
    } else {
      content = (
        <MapImages 
          manifests={this.props.manifests}
          leafIDs={this.props.leafIDs}
          rectoIDs={this.props.rectoIDs} 
          versoIDs={this.props.versoIDs}  
          Leafs={this.props.Leafs} 
          Rectos={this.props.Rectos} 
          Versos={this.props.Versos}
          selectAll={this.state.selectAll} 
          mapSidesToImages={this.props.mapSidesToImages}
          tabIndex={this.props.popUpActive?-1:0}
          togglePopUp={this.props.togglePopUp}
          windowWidth={this.state.windowWidth}
        />
      )
    }

    let selectionRadioGroup = (
      <RadioButtonGroup 
        name="selectionRadioGroup" 
        defaultSelected={this.state.selectAll} 
        valueSelected={this.state.selectAll}
        onChange={(e,v)=>this.setState({selectAll: v})}
      >
        {this.renderRadioButton("sideMapBoard", "Select All Mapped Sides")}
        {this.renderRadioButton("imageMapBoard", "Select All Mapped Images")}
        {this.renderRadioButton("sideBacklog", "Select All Backlog Sides")}
        {this.renderRadioButton("imageBacklog", "Select All Backlog Images")}
      </RadioButtonGroup>
    );

    let sidebarClasses = "sidebar";
    if (this.props.popUpActive) sidebarClasses += " lowerZIndex";

    const sidebar = (
      <div className={sidebarClasses} role="region" aria-label="sidebar">
        <hr />  
        <ManagersPanel
          popUpActive={this.props.popUpActive}
          managerMode={this.props.managerMode}
          changeManagerMode={this.props.changeManagerMode}
        />
        {this.props.activeTab==="MAP" ? 
          <Panel title="Selector" defaultOpen={true} tabIndex={this.props.popUpActive?-1:0}>
            {selectionRadioGroup}
            <FlatButton
              label="Clear selection" 
              onClick={(e)=>this.setState({selectAll:""})}
              secondary
              fullWidth
              style={this.state.selectAll===""?{display:"none"}:{}}
              tabIndex={this.props.popUpActive?-1:0}
            />
          </Panel>
          : null
        }
      </div>
    );

    return (
      <div>
        <div className="imageManager">
          <TopBar 
            history={this.props.history}
            onValueChange={this.onValueChange}
            onTypeChange={this.onTypeChange}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.popUpActive?-1:0}
            popUpActive={this.props.popUpActive}
            windowWidth={this.state.windowWidth}
            showUndoRedo={true}
          >
            <Tabs 
              tabItemContainerStyle={{backgroundColor: '#ffffff'}}
              value={this.props.activeTab} 
              onChange={(v)=>this.props.changeImageTab(v)}
            >
              <Tab label="Manage images" value="MANAGE" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0}/>
              <Tab label="Map images" value="MAP" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0}/>
            </Tabs>
          </TopBar>
          {sidebar}
          <div className="imageWorkspace">
            {content}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    projectID: state.active.project.id,
    manifests: state.active.project.manifests,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    leafIDs: state.active.project.leafIDs,
    rectoIDs: state.active.project.rectoIDs,
    versoIDs: state.active.project.versoIDs,
    activeTab: state.active.imageManager.activeTab,
    managerMode: state.active.managerMode,
    createManifestError: state.active.imageManager.manageSources.error,
    images: state.dashboard.images,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    changeManagerMode: (managerMode) => {
      dispatch(changeManagerMode(managerMode));
    },
    changeImageTab: (tabName) => {
      dispatch(changeImageTab(tabName));
    },
    sendFeedback: (title, message) => {
      dispatch(sendFeedback(title, message))
    },
    createManifest: (projectID, manifest) => {
      dispatch(createManifest(projectID, manifest))
    },
    updateManifest: (projectID, manifest) => {
      dispatch(updateManifest(projectID, manifest))
    },
    deleteManifest: (projectID, manifest) => {
      dispatch(deleteManifest(projectID, manifest))
    },
    cancelCreateManifest: () => {
      dispatch(cancelCreateManifest())
    },
    mapSidesToImages: (sideMappings) => {
      dispatch(mapSidesToImages(sideMappings))
    },
    linkImages: (projectIDs, imageIDs, manifest, allImages) => {
      dispatch(linkImages(projectIDs, imageIDs));
    },
    unlinkImages: (projectIDs, imageIDs, manifest) => {
      dispatch(unlinkImages(projectIDs, imageIDs));
    },
    deleteImages: (imageIDs, manifest) => {
      dispatch(deleteImages(imageIDs));
    },
    uploadImages: (images, projectID) => {
      dispatch(uploadImages(images, projectID));
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageManager);
