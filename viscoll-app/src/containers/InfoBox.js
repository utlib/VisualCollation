import React from 'react';
import GroupInfoBox from '../components/infoBox/GroupInfoBox';
import LeafInfoBox from '../components/infoBox/LeafInfoBox';
import SideInfoBox from '../components/infoBox/SideInfoBox';
import infoBoxStyle from '../styles/infobox';
import { Tabs, Tab } from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import AddGroupDialog from '../components/infoBox/dialog/AddGroupDialog';
import { connect } from 'react-redux';
import {
  addLeafs,
  updateLeaf,
  updateLeafs,
  autoConjoinLeafs,
  deleteLeaf,
  deleteLeafs,
  generateFolioNumbers,
  generatePageNumbers,
} from '../actions/backend/leafActions';
import {
  addGroups,
  updateGroup,
  updateGroups,
  deleteGroup,
  deleteGroups,
} from '../actions/backend/groupActions';
import { updateSide, updateSides } from '../actions/backend/sideActions';
import { addTerm, linkTerm } from '../actions/backend/termActions';
import {
  changeInfoBoxTab,
  toggleVisualizationDrawing,
} from '../actions/backend/interactionActions';
import { reapplyFilterProject } from '../actions/backend/filterActions';
import { updatePreferences } from '../actions/backend/projectActions';

/** Container of the leaf, group and side infoboxes */
class InfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addGroupDialogOpen: false,
    };
  }

  toggleAddGroupDialog = (value = false) => {
    this.setState({ addGroupDialogOpen: value });
    this.props.togglePopUp(value);
  };

  addLeafs = data => {
    let leafIDs = [];
    const userID = this.props.user.id;
    for (let count = 0; count < data.additional.noOfLeafs; count++) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      leafIDs.push(IDHash.substr(IDHash.length - 24));
    }
    let sideIDs = [];
    for (
      let count = leafIDs.length;
      count < leafIDs.length + data.additional.noOfLeafs * 2;
      count++
    ) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      sideIDs.push(IDHash.substr(IDHash.length - 24));
    }
    data.additional['leafIDs'] = leafIDs;
    data.additional['sideIDs'] = sideIDs;
    this.props.addLeafs(
      data.leaf,
      data.additional,
      this.props.projectID,
      this.props.filters
    );
  };

  updateLeaf = (leafID, leaf) => {
    this.props.updateLeaf(
      leafID,
      leaf,
      this.props.projectID,
      this.props.filters
    );
  };

  updateLeafs = leafs => {
    this.props.updateLeafs(leafs, this.props.projectID, this.props.filters);
  };

  autoConjoinLeafs = () => {
    this.props.autoConjoinLeafs(
      this.props.selectedObjects.members,
      this.props.projectID,
      this.props.filters
    );
  };

  deleteLeaf = leafID => {
    this.props.deleteLeaf(leafID, this.props.projectID, this.props.filters);
  };

  deleteLeafs = leafs => {
    this.props.deleteLeafs(leafs, this.props.projectID, this.props.filters);
  };

  updateGroup = (groupID, group) => {
    this.props.updateGroup(
      groupID,
      group,
      this.props.projectID,
      this.props.filters
    );
  };

  updateGroups = groups => {
    this.props.updateGroups(groups, this.props.projectID, this.props.filters);
  };

  addGroups = data => {
    const userID = this.props.user.id;
    let groupIDs = [];
    for (let count = 0; count < data.additional.noOfGroups; count++) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      groupIDs.push(IDHash.substr(IDHash.length - 24));
    }
    let leafIDs = [];
    for (
      let count = groupIDs.length;
      count < groupIDs.length + groupIDs.length * data.additional.noOfLeafs;
      count++
    ) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      leafIDs.push(IDHash.substr(IDHash.length - 24));
    }
    let sideIDs = [];
    for (
      let count = groupIDs.length * leafIDs.length;
      count < groupIDs.length * leafIDs.length + leafIDs.length * 2;
      count++
    ) {
      const date = Date.now().toString();
      const IDHash = userID + date + count;
      sideIDs.push(IDHash.substr(IDHash.length - 24));
    }
    data.additional['groupIDs'] = groupIDs;
    data.additional['leafIDs'] = leafIDs;
    data.additional['sideIDs'] = sideIDs;
    this.props.addGroups(
      data.group,
      data.additional,
      this.props.projectID,
      this.props.filters
    );
  };

  deleteGroup = groupID => {
    this.props.deleteGroup(groupID, this.props.projectID, this.props.filters);
  };

  deleteGroups = groups => {
    this.props.deleteGroups(groups, this.props.projectID, this.props.filters);
  };

  updateSide = (sideID, side) => {
    this.props.updateSide(
      sideID,
      side,
      this.props.projectID,
      this.props.filters
    );
  };

  updateSides = sides => {
    this.props.updateSides(sides, this.props.projectID, this.props.filters);
  };

  linkTerm = termID => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type === 'Recto' || type === 'Verso') type = 'Side';
    for (let id of this.props.selectedObjects.members) {
      objects.push({ id, type });
    }
    this.props.action.linkTerm(
      termID,
      objects,
      this.props.projectID,
      this.props.filters
    );
  };

  unlinkTerm = (termID, sideIndex) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    for (let id of this.props.selectedObjects.members) {
      objects.push({ id, type });
    }
    this.props.action.unlinkTerm(
      termID,
      objects,
      this.props.projectID,
      this.props.filters
    );
  };

  createAndAttachTerm = (termTitle, noteType, description, uri, show) => {
    let objects = [];
    let type = this.props.selectedObjects.type;
    if (type === 'Recto' || type === 'Verso') type = 'Side';
    for (let id of this.props.selectedObjects.members) {
      objects.push({ id, type });
    }
    const userID = this.props.user.id;
    const date = Date.now().toString();
    const IDHash = userID + date;
    const id = IDHash.substr(IDHash.length - 24);
    let term = {
      project_id: this.props.projectID,
      id: id,
      title: termTitle,
      type: noteType,
      description: description,
      uri: uri,
      show: show,
    };
    this.props.createAndAttachTerm(
      term,
      objects,
      this.props.projectID,
      this.props.filters
    );
  };

  generateFolioNumbers = startNumber => {
    let leafIDs = this.props.collationManager.selectedObjects.members;

    this.props.generateFolioNumbers(startNumber, leafIDs);
  };

  generatePageNumbers = startNumber => {
    let leafIDs = this.props.collationManager.selectedObjects.members;
    let rectoIDs = [];
    let versoIDs = [];

    for (const leafID of leafIDs) {
      const leaf = this.props.Leafs[leafID];
      rectoIDs.push(leaf.rectoID);
      versoIDs.push(leaf.versoID);
    }
    this.props.generatePageNumbers(startNumber, rectoIDs, versoIDs);
  };

  handleChangeInfoBoxTab = (value, event) => {
    this.props.changeInfoBoxTab(
      value,
      this.props.selectedObjects,
      this.props.Leafs,
      this.props.Rectos,
      this.props.Versos
    );
  };

  updatePreferences = newPreferences => {
    const preferences = { ...this.props.preferences, ...newPreferences };
    this.props.updatePreferences(this.props.projectID, { preferences });
  };

  render() {
    if (Object.keys(this.props.Groups).length === 0) {
      return (
        <div>
          <RaisedButton
            primary
            label={this.props.selectedGroups ? 'Add' : 'Add New Group'}
            style={
              this.props.selectedGroups
                ? { width: '49%', float: 'left', marginRight: '2%' }
                : { width: '100%', float: 'left', marginRight: '2%' }
            }
            onClick={() => this.toggleAddGroupDialog(true)}
          />
          <AddGroupDialog
            action={{ addGroups: this.addGroups }}
            projectID={this.props.projectID}
            open={this.state.addGroupDialogOpen}
            selectedGroups={this.props.selectedObjects.members}
            closeDialog={this.toggleAddGroupDialog}
          />
        </div>
      );
    }

    if (this.props.selectedObjects.members.length === 0) {
      return <div></div>;
    }

    const leafSideTabs = (
      <Tabs
        tabItemContainerStyle={{ backgroundColor: '#ffffff' }}
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
      <Tabs
        tabItemContainerStyle={{ backgroundColor: '#ffffff' }}
        value="Group"
      >
        <Tab
          label="Group"
          value="Group"
          buttonStyle={infoBoxStyle.tab}
          tabIndex={-1}
        />
      </Tabs>
    );

    const termActions = {
      linkTerm: this.linkTerm,
      unlinkTerm: this.unlinkTerm,
      createAndAttachTerm: this.createAndAttachTerm,
    };

    if (this.props.selectedObjects.type === 'Group') {
      return (
        <div role="region" aria-label="infobox">
          {groupTab}
          <GroupInfoBox
            action={{
              updateGroup: this.updateGroup,
              updateGroups: this.updateGroups,
              addGroups: this.addGroups,
              addLeafs: this.addLeafs,
              deleteGroup: this.deleteGroup,
              deleteGroups: this.deleteGroups,
              toggleVisualizationDrawing: this.props.toggleVisualizationDrawing,
              updatePreferences: this.updatePreferences,
              ...termActions,
            }}
            projectID={this.props.projectID}
            preferences={this.props.preferences}
            Groups={this.props.Groups}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            rectoIDs={this.props.rectoIDs}
            versoIDs={this.props.versoIDs}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Terms={this.props.Terms}
            noteTypes={this.props.noteTypes}
            commonTerms={this.props.commonTerms}
            openTermDialog={this.props.openTermDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedGroups={this.props.collationManager.selectedObjects.members}
            defaultAttributes={
              this.props.collationManager.defaultAttributes.group
            }
            termsManager={this.props.termsManager}
            tacketed={this.props.tacketed}
            isReadOnly={this.props.collationManager.viewMode === 'VIEWING'}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      );
    } else if (this.props.selectedObjects.type === 'Leaf') {
      return (
        <div role="region" aria-label="infobox">
          {leafSideTabs}
          <LeafInfoBox
            action={{
              updateLeaf: this.updateLeaf,
              updateLeafs: this.updateLeafs,
              addLeafs: this.addLeafs,
              deleteLeaf: this.deleteLeaf,
              deleteLeafs: this.deleteLeafs,
              generateFolioNumbers: this.generateFolioNumbers,
              generatePageNumbers: this.generatePageNumbers,
              updatePreferences: this.updatePreferences,
              ...termActions,
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
            Terms={this.props.Terms}
            noteTypes={this.props.noteTypes}
            commonTerms={this.props.commonTerms}
            openTermDialog={this.props.openTermDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedLeaves={this.props.collationManager.selectedObjects.members}
            defaultAttributes={
              this.props.collationManager.defaultAttributes.leaf
            }
            preferences={this.props.preferences}
            termsManager={this.props.termsManager}
            autoConjoinLeafs={this.autoConjoinLeafs}
            isReadOnly={this.props.collationManager.viewMode === 'VIEWING'}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      );
    } else if (
      this.props.selectedObjects.type === 'Recto' ||
      this.props.selectedObjects.type === 'Verso'
    ) {
      const sideIndex = this.props.selectedObjects.type === 'Recto' ? 0 : 1;
      return (
        <div role="region" aria-label="infobox">
          {leafSideTabs}
          <SideInfoBox
            action={{
              updateSides: this.updateSides,
              updateSide: this.updateSide,
              updatePreferences: this.updatePreferences,
              ...termActions,
            }}
            preferences={this.props.preferences}
            projectID={this.props.projectID}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            rectoIDs={this.props.rectoIDs}
            versoIDs={this.props.versoIDs}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            Sides={this.props[this.props.selectedObjects.type + 's']}
            Terms={this.props.Terms}
            noteTypes={this.props.noteTypes}
            commonTerms={this.props.commonTerms}
            openTermDialog={this.props.openTermDialog}
            viewMode={this.props.collationManager.viewMode}
            selectedSides={this.props.collationManager.selectedObjects.members}
            defaultAttributes={
              this.props.collationManager.defaultAttributes.side
            }
            termsManager={this.props.termsManager}
            sideIndex={sideIndex}
            isReadOnly={this.props.collationManager.viewMode === 'VIEWING'}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}
const mapStateToProps = state => {
  return {
    user: state.user,
    projectID: state.active.project.id,
    preferences: state.active.project.preferences,
    Groups: state.active.project.Groups,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
    rectoIDs: state.active.project.rectoIDs,
    versoIDs: state.active.project.versoIDs,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    Terms: state.active.project.Terms,
    noteTypes: state.active.project.noteTypes,
    selectedObjects: state.active.collationManager.selectedObjects,
    collationManager: state.active.collationManager,
    termsManager: state.active.termsManager,
    filters: state.active.collationManager.filters,
    tacketed: state.active.collationManager.visualizations.tacketed,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleVisualizationDrawing: data => {
      dispatch(toggleVisualizationDrawing(data));
    },

    addLeafs: (leaf, additional, projectID, filters) => {
      dispatch(addLeafs(leaf, additional)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    updateLeaf: (leafID, leaf, projectID, filters) => {
      dispatch(updateLeaf(leafID, leaf)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    updateLeafs: (leafs, projectID, filters) => {
      dispatch(updateLeafs(leafs, projectID)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    autoConjoinLeafs: (leafIDs, projectID, filters) => {
      dispatch(autoConjoinLeafs(leafIDs)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    deleteLeaf: (leafID, projectID, filters) => {
      dispatch(deleteLeaf(leafID)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    deleteLeafs: (leafs, projectID, filters) => {
      dispatch(deleteLeafs(leafs)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    addGroups: (group, additional, projectID, filters) => {
      dispatch(addGroups(group, additional)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    updateGroup: (groupID, group, projectID, filters) => {
      dispatch(updateGroup(groupID, group)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    updateGroups: (groups, projectID, filters) => {
      dispatch(updateGroups(groups)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    deleteGroup: (groupID, projectID, filters) => {
      dispatch(deleteGroup(groupID)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    deleteGroups: (groups, projectID, filters) => {
      dispatch(deleteGroups(groups, projectID)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    updateSide: (sideID, side, projectID, filters) => {
      dispatch(updateSide(sideID, side)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    updateSides: (sides, projectID, filters) => {
      dispatch(updateSides(sides)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    changeInfoBoxTab: (newType, selectedObjects, Leafs, Rectos, Versos) => {
      dispatch(
        changeInfoBoxTab(newType, selectedObjects, { Leafs, Rectos, Versos })
      );
    },

    createAndAttachTerm: (term, objects, projectID, filters) => {
      dispatch(addTerm(term))
        .then(() => dispatch(linkTerm(term.id, objects)))
        .then(() => dispatch(reapplyFilterProject(projectID, filters)));
    },

    generateFolioNumbers: (startNumber, leafIDs) => {
      dispatch(generateFolioNumbers(startNumber, leafIDs));
    },

    generatePageNumbers: (startNumber, rectoIDs, versoIDs) => {
      dispatch(generatePageNumbers(startNumber, rectoIDs, versoIDs));
    },

    updatePreferences: (projectID, project) => {
      dispatch(updatePreferences(projectID, project));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InfoBox);
