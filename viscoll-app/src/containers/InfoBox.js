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
  conjoinLeafs,
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
  updateNote,
  deleteNote,
  linkNote,
  unlinkNote,
} from '../actions/editCollation/modificationActions';
import {
  toggleVisibility,
  flashLeaves,
  flashGroups,
  changeInfoBoxTab,
  reapplyFilterProject,
  toggleTacket,
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
    this.setState({ addGroupDialogOpen: value })
  }

  /**
   * Submit add leaf request
   * @param {object} data 
   * @public
   */
  addLeafs = (data) => { this.props.addLeafs(data.leaf, data.additional, this.props.projectID, this.props.filters); }

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
  conjoinLeafs = () => { 
    this.props.conjoinLeafs(this.props.selectedObjects.members, this.props.projectID, this.props.filters); }

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
  addGroups = (data) => { this.props.addGroups(data.group, data.additional, this.props.projectID, this.props.filters); }

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

   /**
   * Returns items in common
   * @param {array} list1
   * @param {array} list2
   * @public
   */
  intersect = (list1, list2) => {
    if (list1.length >= list2.length)
      return list1.filter((id1)=>{return list2.includes(id1)});
    else
      return list2.filter((id1)=>{return list1.includes(id1)});
  }

  /**
   * Returns notes of currently selected objects
   * @public
   */
  getCommonNotes = () => {
    // Find the common notes of all currently selected objects
    const memberType = this.props.selectedObjects.type;
    const members = this.props.selectedObjects.members;
    let notes = this.props[memberType+"s"][members[0]].notes;
    for (let id of members) {
      notes = this.intersect(notes, this.props[memberType+"s"][id].notes);
    }
    return notes;
  }

  updateNote = (noteID, note) => {
    this.props.updateNote(noteID, note, this.props.projectID, this.props.filters);
  }

  linkDialogNote = (noteID, objects) => {
    this.props.linkNote(noteID, objects, this.props.projectID, this.props.filters);
  }
  
  linkNote = (noteID) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type==="Recto" || type==="Verso")
      type = "Side";
    for (let id of this.props.selectedObjects.members) {
      objects.push({id, type});
    }
    this.props.linkNote(noteID, objects, this.props.projectID, this.props.filters);
  }

  linkAndUnlinkNotes = (noteID, linkObjects, unlinkObjects) => {
    this.props.linkAndUnlinkNotes(noteID, linkObjects, unlinkObjects, this.props.projectID, this.props.filters);
  }

  unlinkDialogNote = (noteID, objects) => {
    this.props.unlinkNote(noteID, objects, this.props.projectID, this.props.filters);
  }

  unlinkNote = (noteID, sideIndex) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type==="Recto" || type==="Verso")
      type = "Side";
    for (let id of this.props.selectedObjects.members) {
      objects.push({id, type});
    }
    this.props.unlinkNote(noteID, objects, this.props.projectID, this.props.filters);
  }

  createAndAttachNote = (noteTitle, noteType, description) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type==="Recto" || type==="Verso")
      type = "Side";
    for (let id of this.props.selectedObjects.members) {
      objects.push({id, type});
    }
    let note = {
      project_id: this.props.projectID,
      title: noteTitle,
      type: noteType,
      description: description,
    }
    this.props.createAndAttachNote(note, objects, this.props.projectID, this.props.filters);
  }

  deleteNote = (noteID) => {
    this.props.deleteNote(noteID, this.props.projectID, this.props.filters)
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

  filterActiveSide = (sideOrder) => {
    let filteredSelectedObjects = {};
    for (let sideID in this.props.selectedObjects.members) {
      let side = this.props.selectedObjects.members[sideID];
      if (side.order===sideOrder)
        filteredSelectedObjects[sideID] = side;
    }
    return filteredSelectedObjects;
  }


  render() {
    if (Object.keys(this.props.Groups).length===0){
      return (
        <div>
          <RaisedButton 
            primary 
            label={this.props.selectedGroups ? "Add" : "Add New Group"} 
            style={this.props.selectedGroups ? {width:"49%", float:"left", marginRight:"2%"} : {width:"100%", float:"left", marginRight:"2%"}}
            onTouchTap={()=>this.toggleAddGroupDialog(true)}
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
          label="Leaf" 
          value="Leaf" 
          buttonStyle={infoBoxStyle.tab}
        /> 
        <Tab label="Recto" value="Recto" buttonStyle={infoBoxStyle.tab} />
        <Tab label="Verso" value="Verso" buttonStyle={infoBoxStyle.tab} />
      </Tabs>
    );

    const groupTab = (
      <Tabs tabItemContainerStyle={{backgroundColor: '#ffffff'}} value="Group" >
        <Tab label="Group" value="Group" buttonStyle={infoBoxStyle.tab}> </Tab>
      </Tabs>
    );

    const noteActions = {
      updateNote: this.updateNote, 
      deleteNote: this.deleteNote, 
      linkNote: this.linkNote,
      unlinkNote: this.unlinkNote,
      linkAndUnlinkNotes: this.linkAndUnlinkNotes,
      linkDialogNote: this.linkDialogNote,
      unlinkDialogNote: this.unlinkDialogNote,
      createAndAttachNote: this.createAndAttachNote
    }

    if (this.props.selectedObjects.type === "Group") {
      return (
        <div>
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
              toggleTacket: this.props.toggleTacket,
              ...noteActions
              }} 
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            viewMode={this.props.collationManager.viewMode}
            selectedGroups={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.group}
            visibleAttributes={this.props.collationManager.visibleAttributes.group}
            commonNotes={this.getCommonNotes()}
            notesManager={this.props.notesManager}
            tacketing={this.props.tacketing}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
            />
        </div>
      );
    } else if (this.props.selectedObjects.type === "Leaf") {
      return (
        <div> 
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
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            viewMode={this.props.collationManager.viewMode}
            selectedLeaves={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.leaf}
            visibleAttributes={this.props.collationManager.visibleAttributes.leaf}
            commonNotes={this.getCommonNotes()}
            notesManager={this.props.notesManager}
            conjoinLeafs={this.conjoinLeafs}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
          />
        </div>
      );
    } else if (this.props.selectedObjects.type === "Recto") {
      return (
        <div>
          {leafSideTabs} 
          <SideInfoBox 
            action={{
              updateSides: this.updateSides, 
              updateSide: this.updateSide, 
              toggleVisibility: this.props.toggleVisibility,
              ...noteActions
            }} 
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Sides={this.props.Rectos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            viewMode={this.props.collationManager.viewMode}
            selectedSides={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.side}
            visibleAttributes={this.props.collationManager.visibleAttributes.side}
            commonNotes={this.getCommonNotes()}
            notesManager={this.props.notesManager}
            sideIndex={0}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
          />
        </div>
      );
    } else if (this.props.selectedObjects.type === "Verso") {
      return (
        <div>
          {leafSideTabs} 
          <SideInfoBox 
            action={{
              updateSides: this.updateSides, 
              updateSide: this.updateSide, 
              toggleVisibility: this.props.toggleVisibility,
              ...noteActions
            }} 
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Sides={this.props.Versos}
            Notes={this.props.Notes}
            noteTypes={this.props.noteTypes}
            viewMode={this.props.collationManager.viewMode}
            selectedSides={this.props.collationManager.selectedObjects.members}
            defaultAttributes={this.props.collationManager.defaultAttributes.side}
            visibleAttributes={this.props.collationManager.visibleAttributes.side}
            commonNotes={this.getCommonNotes()}
            notesManager={this.props.notesManager}
            sideIndex={1}
            isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
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
    projectID: state.active.project.id,
    Groups: state.active.project.Groups,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    Notes: state.active.project.Notes,
    noteTypes: state.active.project.noteTypes,
    selectedObjects: state.active.collationManager.selectedObjects,
    collationManager: state.active.collationManager,
    notesManager: state.active.notesManager,
    filters: state.active.collationManager.filters,
    tacketing: state.active.collationManager.visualizations.tacketing,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleTacket: (toggle) => {
      dispatch(toggleTacket(toggle));
    },

    addLeafs: (leaf, additional, projectID, filters) => {
      dispatch(addLeafs(leaf, additional))
      .then(()=> {
        dispatch(flashLeaves({order: additional.order, ...additional}));
        setTimeout(()=>dispatch({type: "UNFLASH"}), 3000);
      })
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

    conjoinLeafs: (leafIDs, projectID, filters) => {
      dispatch(conjoinLeafs(leafIDs))
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
      .then(()=> {
        dispatch(flashGroups({order: group.order, ...additional}));
        setTimeout(()=>dispatch({type: "UNFLASH"}), 3000);
      })
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

    updateNote: (noteID, note, projectID, filters) => {
      dispatch(updateNote(noteID, note))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },
    
    deleteNote: (noteID, projectID, filters) => {
      dispatch(deleteNote(noteID))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    createAndAttachNote: (note, objects, projectID, filters) => {
      dispatch(addNote(note))
      .then((action)=> {
        if ((action.type).includes("SUCCESS")){
          for (let noteID in action.payload.Notes){
            if (action.payload.Notes[noteID].title===note.title){
              dispatch(linkNote(noteID, objects));
              break;
            }
          }
        }
      })
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    linkNote: (noteID, object, projectID, filters) => {
      dispatch(linkNote(noteID, object))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    unlinkNote: (noteID, object, projectID, filters) => {
      dispatch(unlinkNote(noteID, object))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    linkAndUnlinkNotes: (noteID, linkObjects, unlinkObjects, projectID, filters) => {
      if (linkObjects.length > 0 && unlinkObjects.length > 0){
        dispatch(linkNote(noteID, linkObjects))
        .then(action=>dispatch(unlinkNote(noteID, unlinkObjects)))
        .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
      }
      else if (linkObjects.length > 0) {
        dispatch(linkNote(noteID, linkObjects))
        .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
      }
      else if (unlinkObjects.length > 0) {
        dispatch(unlinkNote(noteID, unlinkObjects))
        .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InfoBox);
