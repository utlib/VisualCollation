import React, {Component} from 'react';
import { connect } from "react-redux";
import TopBar from "./TopBar";
import {Tabs, Tab} from 'material-ui/Tabs';
import topbarStyle from "../styles/topbar";
import Panel from '../components/global/Panel';
import { 
  changeManagerMode,
  changeImageTab, 
} from "../actions/editCollation/interactionActions";
import { 
  createManifest,
  updateManifest,
  deleteManifest,
  cancelCreateManifest
} from "../actions/projectActions";
import { mapSidesToImages } from "../actions/editCollation/modificationActions";
import { sendFeedback } from "../actions/userActions";
import ManageManifests from '../components/imageManager/ManageManifests';
import MapImages from '../components/imageManager/MapImages';

class ImageManager extends Component {

  createManifest = (manifest) => {
    this.props.createManifest(this.props.projectID, manifest)
  }

  updateManifest = (manifest) => {
    this.props.updateManifest(this.props.projectID, manifest)
  }

  deleteManifest = (manifest) => {
    this.props.deleteManifest(this.props.projectID, manifest)
  }

  render() {
    let content = "";
    if (this.props.activeTab==="MANAGE") {
      content = (
        <ManageManifests 
          manifests={this.props.manifests} 
          createManifest={this.createManifest}
          updateManifest={this.updateManifest}
          deleteManifest={this.deleteManifest}
          createManifestError={this.props.createManifestError}
          cancelCreateManifest={this.props.cancelCreateManifest}
        />
      )
    } else {
      content = (
        <MapImages 
          manifests={this.props.manifests} 
          Leafs={this.props.Leafs} 
          Rectos={this.props.Rectos} 
          Versos={this.props.Versos} 
          mapSidesToImages={this.props.mapSidesToImages}
        />
      )
    }

    const sidebar = (
      <div className={"sidebar"}>
        <hr />  
        <Panel title="Managers" defaultOpen={true}>
          <div
            className={ this.props.managerMode==="collationManager" ? "manager active" : "manager" }        
            onTouchTap={() => this.props.changeManagerMode("collationManager")} >
            Collation
          </div>
          <div
            className={ this.props.managerMode==="notesManager" ? "manager active" : "manager" }        
            onTouchTap={() => this.props.changeManagerMode("notesManager")} >
            Notes
          </div>
          <div
            className={ this.props.managerMode==="imageManager" ? "manager active" : "manager" }        
            onTouchTap={() => this.props.changeManagerMode("imageManager")} >
            Images
          </div>
        </Panel>
      </div>
    );

    return <div>
      <div className="imageManager">
        <TopBar 
          history={this.props.history}
          onValueChange={this.onValueChange}
          onTypeChange={this.onTypeChange}
        >
          <Tabs 
            tabItemContainerStyle={{backgroundColor: '#ffffff'}}
            value={this.props.activeTab} 
            onChange={(v)=>this.props.changeImageTab(v)}
          >
            <Tab label="Manage images" value="MANAGE" buttonStyle={topbarStyle.tab} />
            <Tab label="Map images" value="MAP" buttonStyle={topbarStyle.tab} />
          </Tabs>
        </TopBar>
        {sidebar}
        <div className="imageWorkspace">
          {content}
        </div>
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    projectID: state.active.project.id,
    manifests: state.active.project.manifests,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    activeTab: state.active.imageManager.activeTab,
    managerMode: state.active.managerMode,
    createManifestError: state.active.imageManager.manageSources.error
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
    mapSidesToImages: (linkedSideIDs, images, unlinkedSideIDs) => {
      dispatch(mapSidesToImages(linkedSideIDs, images, unlinkedSideIDs))
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageManager);
