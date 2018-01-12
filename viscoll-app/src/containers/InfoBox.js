import React from 'react';
import PropTypes from 'prop-types';
import GroupInfoBox from '../components/infoBox/GroupInfoBox';
import LeafInfoBox from '../components/infoBox/LeafInfoBox';
import SideInfoBox from '../components/infoBox/SideInfoBox';
import infoBoxStyle from '../styles/infobox';
import {Tabs, Tab} from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import AddGroupDialog from '../components/infoBox/dialog/AddGroupDialog';
import { connect } from "react-redux";
import { 
  addLeafs,
  updateLeaf, 
  updateLeafs,
  autoConjoinLeafs,
  deleteLeaf,
  deleteLeafs,
  addGroups,
  updateGroup,
  updateGroups,
  deleteGroup,
  deleteGroups,
  updateSide, 
  updateSides,
  addNote,
  linkNote,
} from '../actions/editCollation/modificationActions';
import {
  toggleVisibility,
  changeInfoBoxTab,
  reapplyFilterProject,
  toggleVisualizationDrawing,
} from '../actions/editCollation/interactionActions';


/** Container of the leaf, group and side infoboxes */
class InfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addGroupDialogOpen: false
    }
  }

  /**
   * Toggle the add group dialog
   * @param {boolean} value 
   * @public
   */
  toggleAddGroupDialog = (value=false) => {
    this.setState({ addGroupDialogOpen: value });
    this.props.togglePopUp(value);
  }

  /**
   * Submit add leaf request
   * @param {object} data 
   * @public
   */
  addLeafs = (data) => { 
    let leafIDs = [];
    const userID = this.props.user.id;
    for (let count = 0; count < data.additional.noOfLeafs; count++){
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      leafIDs.push(IDHash.substr(IDHash.length - 24))
    }
    let sideIDs = []
    for (let count = leafIDs.length; count < leafIDs.length+data.additional.noOfLeafs*2; count++) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      sideIDs.push(IDHash.substr(IDHash.length - 24));
    }
    data.additional["leafIDs"] = leafIDs;
    data.additional["sideIDs"] = sideIDs;
    this.props.addLeafs(data.leaf, data.additional, this.props.projectID, this.props.filters); 
  }

  /**
   * Submit update leaf request
   * @param {string} leafID 
   * @param {object} leaf 
   * @public
   */
  updateLeaf = (leafID, leaf) => { this.props.updateLeaf(leafID, leaf, this.props.projectID, this.props.filters); }

  /**
   * Submit update multiple leaves request
   * @param {object} leafs
   * @public
   */
  updateLeafs = (leafs) => { this.props.updateLeafs(leafs, this.props.projectID, this.props.filters); }

  /**
   * Submit conjoin leaves request
   * @public
   */
  autoConjoinLeafs = () => { 
    this.props.autoConjoinLeafs(this.props.selectedObjects.members, this.props.projectID, this.props.filters); }

  /**
   * Submit delete leaf request
   * @param {string} leafID
   * @public
   */
  deleteLeaf = (leafID) => { this.props.deleteLeaf(leafID, this.props.projectID, this.props.filters); }

  /**
   * Submit delete multiple leaves request
   * @param {object} leafs
   * @public
   */
  deleteLeafs = (leafs) => { this.props.deleteLeafs(leafs, this.props.projectID, this.props.filters); }

  /**
   * Submit update group request
   * @param {string} groupID
   * @param {object} group
   * @public
   */
  updateGroup = (groupID, group) => { this.props.updateGroup(groupID, group, this.props.projectID, this.props.filters); }

  /**
   * Submit update multiple groups request
   * @param {object} data
   * @public
   */
  updateGroups = (groups) => { this.props.updateGroups(groups, this.props.projectID, this.props.filters); }

  /**
   * Submit add multiple groups request
   * @param {object} data
   * @public
   */
  addGroups = (data) => { 
    const userID = this.props.user.id;
    let groupIDs = [];
    for (let count = 0; count < data.additional.noOfGroups; count++) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      groupIDs.push(IDHash.substr(IDHash.length - 24))
    }
    let leafIDs = [];
    for (let count = groupIDs.length; count < groupIDs.length+groupIDs.length*data.additional.noOfLeafs; count++) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      leafIDs.push(IDHash.substr(IDHash.length - 24))
    }
    let sideIDs = []
    for (let count = groupIDs.length*leafIDs.length; count < groupIDs.length*leafIDs.length+leafIDs.length*2; count++) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      sideIDs.push(IDHash.substr(IDHash.length - 24));
    }
    data.additional["groupIDs"] = groupIDs;
    data.additional["leafIDs"] = leafIDs;
    data.additional["sideIDs"] = sideIDs;
    this.props.addGroups(data.group, data.additional, this.props.projectID, this.props.filters); 
  }

  /**
   * Submit delete group request
   * @param {string} groupID
   * @public
   */
  deleteGroup = (groupID) => { this.props.deleteGroup(groupID, this.props.projectID, this.props.filters); }

  /**
   * Submit delete multiple groups request
   * @param {object} groups
   * @public
   */
  deleteGroups = (groups) => { this.props.deleteGroups(groups, this.props.projectID, this.props.filters); }

  /**
   * Submit update side request
   * @param {string} sideID
   * @param {object} side
   * @public
   */
  updateSide = (sideID, side) => { this.props.updateSide(sideID, side, this.props.projectID, this.props.filters); }

  /**
   * Submit update multiple sides request
   * @param {object} sides
   * @public
   */
  updateSides = (sides) => { this.props.updateSides(sides, this.props.projectID, this.props.filters); }



  linkNote = (noteID) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type==="Recto" || type==="Verso")
      type = "Side";
    for (let id of this.props.selectedObjects.members) {
      objects.push({id, type});
    }
    this.props.action.linkNote(noteID, objects, this.props.projectID, this.props.filters);
  }

  unlinkNote = (noteID, sideIndex) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    for (let id of this.props.selectedObjects.members) {
      objects.push({id, type});
    }
    this.props.action.unlinkNote(noteID, objects, this.props.projectID, this.props.filters);
  }

  createAndAttachNote = (noteTitle, noteType, description, show) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type==="Recto" || type==="Verso")
      type = "Side";
    for (let id of this.props.selectedObjects.members) {
      objects.push({id, type});
    }
    const userID = this.props.user.id;
    const date = Date.now().toString();
    const IDHash = userID + date;
    const id = IDHash.substr(IDHash.length - 24);
    let note = {
      project_id: this.props.projectID,
      id: id,
      title: noteTitle,
      type: noteType,
      description: description,
      show: show
    }
    this.props.createAndAttachNote(note, objects, this.props.projectID, this.props.filters);
  }

  handleChangeInfoBoxTab = (value, event) => {
    this.props.changeInfoBoxTab(
      value, 
      this.props.selectedObjects, 
      this.props.Leafs, 
      this.props.Rectos, 
      this.props.Versos, 
    )
  }


  render() {
    if (Object.keys(this.props.Groups).length===0){
      return (
        <div>
          <RaisedButton 
            primary 
            label={this.props.selectedGroups ? "Add" : "Add New Group"} 
            style={this.props.selectedGroups ? {width:"49%", float:"left", marginRight:"2%"} : {width:"100%", float:"left", marginRight:"2%"}}
            onClick={()=>this.toggleAddGroupDialog(true)}
          />
          <AddGroupDialog
            action={{addGroups: this.addGroups}}
            projectID={this.props.projectID}
            open={this.state.addGroupDialogOpen}
            selectedGroups={this.props.selectedObjects.members}
            closeDialog={this.toggleAddGroupDialog}
          />
        </div>
      );
    }

    if (this.props.selectedObjects.members.length === 0){
      return (<div></div>); 
    }

    const leafSideTabs = (
      <Tabs 
        tabItemContainerStyle={{backgroundColor: '#ffffff'}} 
        value={this.props.selectedObjects.type} 
        onChange={this.handleChangeInfoBoxTab} 
      >
        <Tab 
          aria-label="Leaf tab" 
          label="Leaf"
          value="Leaf"
          buttonStyle={infoBoxStyle.tab}
          tabIndex={this.props.tabIndex}
        /> 
        <Tab 
          aria-label="Recto tab" 
          label="Recto" 
          value="Recto" 
          buttonStyle={infoBoxStyle.tab} 
          tabIndex={this.props.tabIndex}
        />
        <Tab 
          aria-label="Verso tab" 
          label="Verso" 
          value="Verso" 
          buttonStyle={infoBoxStyle.tab} 
          tabIndex={this.props.tabIndex}
        />
      </Tabs>
    );

    const groupTab = (
      <Tabs tabItemContainerStyle={{backgroundColor: '#ffffff'}} value="Group" >
        <Tab label="Group" value="Group" buttonStyle={infoBoxStyle.tab} tabIndex={-1} />
      </Tabs>
    );

    const noteActions = {
      linkNote: this.linkNote,
      unlinkNote: this.unlinkNote,
      createAndAttachNote: this.createAndAttachNote
    }

    if (this.props.selectedObjects.type === "Group") {
      return (
        <div role="region" aria-label="infobox">
          {groupTab} 
          <GroupInfoBox 
            action={{
              updateGroup: this.updateGroup, 
              updateGroups: this.updateGroups, 
              toggleVisibility: this.props.toggleVisibility, 
              addGroups: this.addGroups, 
              addLeafs: this.addLeafs, 
              deleteGroup: this.deleteGroup, 
              deleteGroups: this.deleteGroups,
              toggleVisualizationDrawing: this.props.toggleVisualizationDrawing,
              ...noteActions
              }} 
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            rectoIDs={this.props.rectoIDs}
            versoIDs={this.props.versoIDs}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            commonNotes={this.props.commonNotes}
            openNoteDialog={this.props.openNoteDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedGroups={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.group}
            visibleAttributes={this.props.collationManager.visibleAttributes.group}
            notesManager={this.props.notesManager}
            tacketed={this.props.tacketed}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
            />
        </div>
      );
    } else if (this.props.selectedObjects.type === "Leaf") {
      return (
        <div role="region" aria-label="infobox"> 
          {leafSideTabs}
          <LeafInfoBox 
            action={{
              updateLeaf: this.updateLeaf, 
              updateLeafs: this.updateLeafs, 
              toggleVisibility: this.props.toggleVisibility, 
              addLeafs: this.addLeafs, 
              deleteLeaf: this.deleteLeaf, 
              deleteLeafs: this.deleteLeafs,
              ...noteActions
            }} 
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            rectoIDs={this.props.rectoIDs}
            versoIDs={this.props.versoIDs}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            commonNotes={this.props.commonNotes}
            openNoteDialog={this.props.openNoteDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedLeaves={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.leaf}
            visibleAttributes={this.props.collationManager.visibleAttributes.leaf}
            notesManager={this.props.notesManager}
            autoConjoinLeafs={this.autoConjoinLeafs}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      );
    } else if (this.props.selectedObjects.type === "Recto") {
      return (
        <div role="region" aria-label="infobox">
          {leafSideTabs} 
          <SideInfoBox 
            action={{
              updateSides: this.updateSides, 
              updateSide: this.updateSide, 
              toggleVisibility: this.props.toggleVisibility,
              ...noteActions
            }} 
            projectID={this.props.projectID}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            rectoIDs={this.props.rectoIDs}
            versoIDs={this.props.versoIDs}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Sides={this.props.Rectos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            commonNotes={this.props.commonNotes}
            openNoteDialog={this.props.openNoteDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedSides={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.side}
            visibleAttributes={this.props.collationManager.visibleAttributes.side}
            notesManager={this.props.notesManager}
            sideIndex={0}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      );
    } else if (this.props.selectedObjects.type === "Verso") {
      return (
        <div role="region" aria-label="infobox">
          {leafSideTabs} 
          <SideInfoBox 
            action={{
              updateSides: this.updateSides, 
              updateSide: this.updateSide, 
              toggleVisibility: this.props.toggleVisibility,
              ...noteActions
            }} 
            projectID={this.props.projectID}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            rectoIDs={this.props.rectoIDs}
            versoIDs={this.props.versoIDs}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Sides={this.props.Versos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            commonNotes={this.props.commonNotes}
            openNoteDialog={this.props.openNoteDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedSides={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.side}
            visibleAttributes={this.props.collationManager.visibleAttributes.side}
            notesManager={this.props.notesManager}
            sideIndex={1}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      );
    } else {
        return (<div></div>);
    }
  } 
  static propTypes = {
    /** Dictionary of actions */
    projectID: PropTypes.string,
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    projectID: state.active.project.id,
    Groups: state.active.project.Groups,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
    rectoIDs: state.active.project.rectoIDs,
    versoIDs: state.active.project.versoIDs,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    Notes: state.active.project.Notes,
    noteTypes: state.active.project.noteTypes,
    selectedObjects: state.active.collationManager.selectedObjects,
    collationManager: state.active.collationManager,
    notesManager: state.active.notesManager,
    filters: state.active.collationManager.filters,
    tacketed: state.active.collationManager.visualizations.tacketed,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleVisualizationDrawing: (data) => {
      dispatch(toggleVisualizationDrawing(data));
    },

    addLeafs: (leaf, additional, projectID, filters) => {
      dispatch(addLeafs(leaf, additional))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    updateLeaf: (leafID, leaf, projectID, filters) => {
      dispatch(updateLeaf(leafID, leaf))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    updateLeafs: (leafs, projectID, filters) => {
      dispatch(updateLeafs(leafs, projectID))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    autoConjoinLeafs: (leafIDs, projectID, filters) => {
      dispatch(autoConjoinLeafs(leafIDs))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    deleteLeaf: (leafID, projectID, filters) => {
      dispatch(deleteLeaf(leafID))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    deleteLeafs: (leafs, projectID, filters) => {
      dispatch(deleteLeafs(leafs))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    addGroups: (group, additional, projectID, filters) => {
      dispatch(addGroups(group, additional))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    updateGroup: (groupID, group, projectID, filters) => {
      dispatch(updateGroup(groupID, group))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    updateGroups: (groups, projectID, filters) => {
      dispatch(updateGroups(groups))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    deleteGroup: (groupID, projectID, filters) => {
      dispatch(deleteGroup(groupID))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    deleteGroups: (groups, projectID, filters) => {
      dispatch(deleteGroups(groups, projectID))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    updateSide: (sideID, side, projectID, filters) => {
      dispatch(updateSide(sideID, side))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    updateSides: (sides, projectID, filters) => {
      dispatch(updateSides(sides))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    toggleVisibility: (memberType, attributeName, visibility) => {
      dispatch(toggleVisibility(memberType, attributeName, visibility));
    },

    changeInfoBoxTab: (newType, selectedObjects, Leafs, Rectos, Versos) => {
      dispatch(changeInfoBoxTab(newType, selectedObjects, {Leafs, Rectos, Versos}));
    },

    createAndAttachNote: (note, objects, projectID, filters) => {
      dispatch(addNote(note))
      .then(() => dispatch(linkNote(note.id, objects)))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InfoBox);
