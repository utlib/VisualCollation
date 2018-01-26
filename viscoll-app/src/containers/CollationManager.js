import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'material-ui/Tabs';
import FlatButton from 'material-ui/FlatButton';
import TabularMode from '../components/collationManager/TabularMode';
import VisualMode from '../components/collationManager/VisualMode';
import ViewingMode from '../components/collationManager/ViewingMode';
import Panel from '../components/global/Panel';
import Export from '../components/export/Export';
import InfoBox from './InfoBox';
import Filter from './Filter';
import TopBar from "./TopBar";
import topbarStyle from "../styles/topbar";
import IconClear from 'material-ui/svg-icons/content/clear';
import IconButton from 'material-ui/IconButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { connect } from "react-redux";
import {  changeViewMode,
          handleObjectClick,
          handleObjectPress,
          changeManagerMode,
          toggleFilterPanel,
          updateFilterSelection,
          reapplyFilterProject,
          toggleVisualizationDrawing,
} from "../actions/editCollation/interactionActions";
import { 
  loadProject, 
  updateGroup,
  updateNote,
  deleteNote,
  linkNote,
  unlinkNote,
} from "../actions/editCollation/modificationActions";
import { exportProject, updateProject } from "../actions/dashboardActions";
import fileDownload from 'js-file-download';
import NoteDialog from '../components/collationManager/dialog/NoteDialog';
import {radioBtnDark} from "../styles/button";

/** Container for `TabularMode`, `VisualMode`, `InfoBox`, `TopBar`, `LoadingScreen`, and `Notification`. This container has the project sidebar embedded directly.  */
class CollationManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      contentStyle: {  
        transition: 'top 450ms cubic-bezier(0.23, 1, 0.32, 1)',
        top: 60,
      },
      infoboxStyle: {
        maxHeight: "90%"
      },
      export: {
        open: false,
        label: "",
        type: ""
      },
      selectAll: "",
      leftSideBarOpen: true,
      showTips: props.preferences.showTips,
      imageViewerEnabled: false,
      activeNote: null,
    };
  }

  // componentWillMount() {
  //   if (this.props.collationManager.viewMode==="VIEWING") {
  //     this.setState({leftSideBarOpen:false});
  //   }
  // }

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
    if (this.props.filterPanelOpen){
      let filterContainer = document.getElementById('filterContainer');
      if (filterContainer) {
        let filterPanelHeight = filterContainer.offsetHeight;
        this.filterHeightChange(filterPanelHeight);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  componentWillReceiveProps(nextProps) {
    const newSelectedObjects = nextProps.selectedObjects!==this.props.selectedObjects;
    const differentNumOfSelectedObjects = this.state.selectAll && nextProps.selectedObjects.members.length!==Object.keys(this.props.project[this.state.selectAll]).length;
    const differentTypeOfSelectedObjects = this.state.selectAll!==(nextProps.selectedObjects.type+"s");
    if (this.state.selectAll && newSelectedObjects && (differentTypeOfSelectedObjects || differentNumOfSelectedObjects)) {
      this.setState({selectAll:""});
    } 
    if (nextProps.selectedObjects.type && Object.keys(nextProps.project[nextProps.selectedObjects.type+"s"]).length===nextProps.selectedObjects.members.length) {
      this.setState({selectAll:nextProps.selectedObjects.type+"s"});
    }

    // Update active note 
    const commonNotes = this.getCommonNotes(nextProps);
    if (this.state.activeNote!==null && commonNotes.findIndex((noteID)=>noteID===this.state.activeNote.id)<0 && !this.state.clickedFromDiagram) {
      // Hide note when note was clicked from infobox and removed from selected object
      this.setState({activeNote:null});
    } else if (this.state.activeNote) {
      // Update note object
      this.setState({activeNote: nextProps.project.Notes[this.state.activeNote.id]})
    }
  }

  resizeHandler = () => {
    this.setState({windowWidth:window.innerWidth});
  }

  /**
   * Toggle filter panel
   * @public
   */
  toggleFilterDrawer = () => {
    this.props.toggleFilterPanel(!this.props.filterPanelOpen);
    let filterPanelHeight = document.getElementById('filterContainer').offsetHeight;
    if (this.props.filterPanelOpen) {
      filterPanelHeight = 0;
    }
    this.filterHeightChange(filterPanelHeight);
  }

  handleObjectPress = (object, event) => {
    this.props.handleObjectPress(this.props.selectedObjects, object, event);
  }

  /**
   * Pass the newly clicked object to the `handleObjectClick` action
   * @param {object} object 
   * @param {object} event
   * @public
   */
  handleObjectClick = (object, event) => {
    event.stopPropagation();
    this.props.handleObjectClick( 
      this.props.selectedObjects, 
      object, 
      event,
      this.props.project.groupIDs,
      this.props.project.leafIDs,
      this.props.project.rectoIDs,
      this.props.project.versoIDs,
    );
  }
  /**
   * Pass new view mode value (`VISUAL`, `TABULAR` or `VIEWING`) to the `changeViewMode` action
   * @param {string} value 
   * @public
   */
  handleViewModeChange = (value) => {
    if (value==="VIEWING") {
      this.setState({leftSideBarOpen: true, imageViewerEnabled: false}, ()=>this.props.changeViewMode(value));
    } else if (value!=="VIEWING" && this.state.leftSideBarOpen===false) {
      this.setState({leftSideBarOpen: true}, ()=>this.props.changeViewMode(value));
    } else {
      this.props.changeViewMode(value);
    }
  }

  /**
   * Update the content style when filter panel height changes
   * @param {number} value new height
   * @public
   */
  filterHeightChange = (value) => {
    let infoboxHeight = "90%";
    if (value>0) infoboxHeight = window.innerHeight - value - 56 - 30 + "px";
    this.setState({
      contentStyle:{...this.state.contentStyle, top:value+56},
      infoBoxStyle: {maxHeight: infoboxHeight},
    });
  }

  /**
   * Submit update group request
   * @param {string} groupID
   * @param {object} group
   * @public
   */
  updateGroup = (groupID, group) => { this.props.updateGroup(groupID, group, this.props); }
  

  closeTip = () => {
    const project = {
      preferences: {
        showTips: false
      }
    };
    this.props.hideProjectTip();
    this.props.updateProject(project, this.props.project.id);
  }

  handleSelection = (selection) => {
    this.props.updateFilterSelection(
      selection, 
      this.props.project.Groups,
      this.props.project.Leafs,
      this.props.project.Rectos,
      this.props.project.Versos
    );
  }


  handleExportToggle = (open, type, label) => {
    this.setState({export: {open, type, label}}, ()=>{
      if (this.state.export.open && type!=="png")
        this.props.exportProject(this.props.project.id, type);
    });
    this.props.togglePopUp(open);
  };


  showCopyToClipboardNotification = () => {
    this.props.showCopyToClipboardNotification();
  }

  handleDownloadCollationDiagram = () => {
    let canvas = document.getElementById("myCanvas");
    canvas.toBlob((blob)=>{
      const filename = this.props.project.title.replace(/\s/g, "_");
      fileDownload(blob, `${filename}.PNG`)
    });
  }

  toggleImageViewer = () => {
    this.setState({imageViewerEnabled: !this.state.imageViewerEnabled, leftSideBarOpen: !this.state.leftSideBarOpen});
  }

  closeNoteDialog = () => {
    this.setState({activeNote: null, clickedFromDiagram: false}, ()=>this.props.togglePopUp(false));
  }
  openNoteDialog = (note, clickedFromDiagram=false) => {
    this.setState({activeNote: note, clickedFromDiagram},()=>this.props.togglePopUp(true));
  }

  /**
   * Returns notes of currently selected objects
   * @public
   */
  getCommonNotes = (props=this.props) => {
    // Find the common notes of all currently selected objects
    const memberType = props.selectedObjects.type;
    const members = props.selectedObjects.members;
    let notes = [];
    if (members.length>0) {
      notes = props.project[memberType+"s"][members[0]].notes;
      for (let id of members) {
        notes = this.intersect(notes, props.project[memberType+"s"][id].notes);
      }
    }
    return notes;
  }

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

  updateNote = (noteID, note) => {
    this.props.updateNote(noteID, note, this.props.project.id, this.props.collationManager.filters);
  }

  linkDialogNote = (noteID, objects) => {
    this.props.linkNote(noteID, objects, this.props.project.id, this.props.collationManager.filters);
  }

  linkAndUnlinkNotes = (noteID, linkObjects, unlinkObjects) => {
    this.props.linkAndUnlinkNotes(noteID, linkObjects, unlinkObjects, this.props.project.id, this.props.collationManager.filters);
  }

  unlinkDialogNote = (noteID, objects) => {
    this.props.unlinkNote(noteID, objects, this.props.project.id, this.props.collationManager.filters);
  }

  deleteNote = (noteID) => {
    this.closeNoteDialog();
    this.props.deleteNote(noteID, this.props.project.id, this.props.collationManager.filters);
  }

  render() {
    const containerStyle = {top: 85, right: "2%", height: 'inherit', maxHeight: '80%', width: '28%'};
    if (!this.state.leftSideBarOpen) {
      containerStyle["width"] = "30%";
    }

    const topbar = (
      <TopBar 
        toggleFilterDrawer={this.toggleFilterDrawer} 
        filterOpen={this.props.filterPanelOpen}
        viewMode={this.props.collationManager.viewMode}
        history={this.props.history}
        showImageViewerButton={this.props.collationManager.viewMode==="VIEWING"}
        imageViewerEnabled={this.state.imageViewerEnabled}
        toggleImageViewer={this.toggleImageViewer}
        tabIndex={this.props.popUpActive?-1:0}
        togglePopUp={this.props.togglePopUp}
        popUpActive={this.props.popUpActive}
        windowWidth={this.state.windowWidth}
      >
        <Tabs 
          tabItemContainerStyle={{backgroundColor: '#ffffff'}}
          value={this.props.collationManager.viewMode} 
          onChange={this.handleViewModeChange}
        >
          <Tab label="Visual Mode" value="VISUAL" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0} />
          <Tab label="Tabular Mode" value="TABULAR" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0} />
          <Tab label="Viewing Mode" value="VIEWING" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0} />
        </Tabs>
      </TopBar>
    );

    const singleEditTip = 'Hold the CTRL key (or Command key for Mac users) to select multiple groups/leaves/sides. Hold SHIFT key to select a range of groups/leaves/sides.';
    const batchEditTip = 'You are in batch edit mode. To leave this mode, click on any group/leaf/side without holding down any keys.';
    const tip = this.props.selectedObjects.members.length>1 ? batchEditTip : singleEditTip
    let tipsDiv;
    if (this.props.managerMode==="collationManager" && this.props.preferences.showTips===true) {
      tipsDiv =
        <div className="selectMode">
          <div className="close">
            <IconButton 
              aria-label="Close tip panel"
              onClick={this.closeTip}
              style={{width:"inherit",height:"inherit", padding:0}}
              iconStyle={{color:"#526C91"}}
              tabIndex={this.props.popUpActive?-1:0}
            >
              <IconClear/>
            </IconButton>
          </div>
          <div className="tip">
            <span>TIP:</span> {tip}
          </div>
        </div>
    }

    const selectionRadioGroup = (
      <RadioButtonGroup 
        name="selectionRadioGroup" 
        defaultSelected={this.state.selectAll} 
        valueSelected={this.state.selectAll}
        onChange={(e,v)=>this.setState({selectAll: v}, ()=>{this.handleSelection(v+"_all")})}
      >
        <RadioButton
          value="Groups"
          aria-label="Select All Groups"
          label="Select All Groups"
          selected={true}
          tabIndex={this.props.popUpActive?-1:0}
          {...radioBtnDark()}
        />
        <RadioButton
          value="Leafs"
          aria-label="Select All Leaves"
          label="Select All Leaves"
          labelStyle={{color:"#ffffff",fontSize:"0.9em"}}
          iconStyle={{fill:"#4ED6CB"}}
          tabIndex={this.props.popUpActive?-1:0}
          {...radioBtnDark()}
        />
        <RadioButton
          value="Rectos"
          aria-label="Select All Rectos"
          label="Select All Rectos"
          labelStyle={{color:"#ffffff",fontSize:"0.9em"}}
          iconStyle={{fill:"#4ED6CB"}}
          tabIndex={this.props.popUpActive?-1:0}
          {...radioBtnDark()}
        />
        <RadioButton
          value="Versos"
          aria-label="Select All Versos"
          label="Select All Versos"
          labelStyle={{color:"#ffffff",fontSize:"0.9em"}}
          iconStyle={{fill:"#4ED6CB"}}
          tabIndex={this.props.popUpActive?-1:0}
          {...radioBtnDark()}
        />
    </RadioButtonGroup>
    );

    const exportDialog = (
      <Export 
        label={this.state.export.label}
        exportOpen={this.state.export.open}
        handleExportToggle={this.handleExportToggle}
        exportedData={this.props.exportedData}
        exportedImages={this.props.exportedImages}
        exportedType={this.state.export.type}
        projectTitle={this.props.project.title}
        showCopyToClipboardNotification={this.showCopyToClipboardNotification}
        downloadImage={this.handleDownloadCollationDiagram}
      />
    );

    let sidebarClasses = "sidebar";
    if (!this.state.leftSideBarOpen) sidebarClasses += " hidden";
    if (this.props.popUpActive) sidebarClasses += " lowerZIndex";

    const sidebar = (
      <div role="region" aria-label="sidebar" className={sidebarClasses}>
        <hr />
        {tipsDiv}
        { this.props.collationManager.viewMode !== "VIEWING"?
          <Panel title="Managers" defaultOpen={true} noPadding={true} tabIndex={this.props.popUpActive?-1:0}>
            <button
              className={ this.props.managerMode==="collationManager" ? "manager active" : "manager" }        
              onClick={() => this.props.changeManagerMode("collationManager")} 
              tabIndex={this.props.popUpActive?-1:0}
              aria-label="Collation Manager"
            >
              Collation
            </button>
            <button
              className={ this.props.managerMode==="notesManager" ? "manager active" : "manager" }        
              onClick={() => this.props.changeManagerMode("notesManager")} 
              tabIndex={this.props.popUpActive?-1:0}
              aria-label="Notes Manager"
            >
              Notes
            </button>
            <button
              className={ this.props.managerMode==="imageManager" ? "manager active" : "manager" }        
              onClick={() => this.props.changeManagerMode("imageManager")} 
              tabIndex={this.props.popUpActive?-1:0}
              aria-label="Image Manager"
            >
              Images
            </button>
          </Panel> : "" }
        <Panel title="Selector" defaultOpen={true} tabIndex={this.props.popUpActive?-1:0}>
          {selectionRadioGroup}
          <FlatButton
            aria-label="Clear selection"
            label="Clear selection" 
            onClick={(e)=>this.setState({selectAll:""},this.handleSelection(""))}
            secondary
            fullWidth
            style={this.state.selectAll===""?{display:"none"}:{}}
            tabIndex={this.props.popUpActive?-1:0}
            labelStyle={this.state.windowWidth<=768?{fontSize:"0.75em",padding:2}:{}}
          />
        </Panel>
        <Panel title="Export" defaultOpen={false} tabIndex={this.props.popUpActive?-1:0}>
          <h2>Export Collation Data</h2>
          <div className="export">
            <FlatButton 
              label="JSON" 
              aria-label="Export to JSON"
              labelStyle={this.props.project.leafIDs.length===0?{color:"#a5a5a5", cursor:"not-allowed", fontSize:this.state.windowWidth<=768?"0.75em":null}:{color:"#ffffff",fontSize:this.state.windowWidth<=768?"0.75em":null}}
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{width: "100%"}}
              onClick={()=>this.handleExportToggle(true, "json", "JSON")}
              tabIndex={this.props.popUpActive?-1:0}
              disabled={this.props.project.leafIDs.length===0}
            />
            <FlatButton 
              label="VisColl XML" 
              aria-label="Export to VisColl XML"
              labelStyle={this.props.project.leafIDs.length===0?{color:"#a5a5a5", cursor:"not-allowed", fontSize:this.state.windowWidth<=768?"0.75em":null}:{color:"#ffffff",fontSize:this.state.windowWidth<=768?"0.75em":null}}
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{width: "100%"}}
              onClick={()=>this.handleExportToggle(true, "xml", "XML")}
              tabIndex={this.props.popUpActive?-1:0}
              disabled={this.props.project.leafIDs.length===0}
            />
          </div>
          <h2>Export Collation Diagram</h2>
          <div className="export">
            <FlatButton 
              label={this.props.collationManager.viewMode==="TABULAR"? "Available in visual/viewing mode" : "PNG" } 
              aria-label={this.props.collationManager.viewMode==="TABULAR"? "Export to PNG only available in visual and viewing modes" : "Export to PNG" } 
              labelStyle={this.props.collationManager.viewMode==="TABULAR"||this.props.project.leafIDs.length===0?{color:"#a5a5a5", cursor:"not-allowed",fontSize:this.state.windowWidth<=768?"0.75em":null} : {color:"#ffffff",fontSize:this.state.windowWidth<=768?"0.75em":null}}
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{width: "100%"}}
              onClick={()=>{this.handleExportToggle(true, "png", "PNG")}}
              disabled={this.props.collationManager.viewMode==="TABULAR"||this.props.project.leafIDs.length===0}
              tabIndex={this.props.popUpActive?-1:0}
            />
          </div>
        </Panel>
        
      </div>
    );

    const infobox = (
        <div 
          className="infoBox" 
          style={{...this.state.contentStyle, ...this.state.infoBoxStyle}}
        >
          <InfoBox
            type={this.props.selectedObjects.type} 
            user={this.props.user} 
            closeNoteDialog={this.closeNoteDialog}
            commonNotes={this.getCommonNotes()}
            openNoteDialog={this.openNoteDialog}
            action={{linkNote: this.props.linkNote, unlinkNote: this.props.unlinkNote}}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.popUpActive?-1:0}
            windowWidth={this.state.windowWidth}
          />
        </div>
      )

    let workspace = <div></div>;
    if (this.props.project.groupIDs.length>0){
      if (this.props.collationManager.viewMode==="TABULAR") {
        workspace = (
          <div role="main">
            <div className="projectWorkspace" style={this.state.contentStyle}>
                <TabularMode 
                  project={this.props.project}
                  collationManager={this.props.collationManager}
                  handleObjectClick={this.handleObjectClick}
                  handleObjectPress={this.handleObjectPress}
                  popUpActive={this.props.popUpActive}
                  tabIndex={this.props.popUpActive?-1:0}
                  groupIDs={this.props.groupIDs}
                  leafIDs={this.props.leafIDs}
                />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      } else if (this.props.collationManager.viewMode==="VISUAL") {
        workspace = (
          <div role="main">
            <div className="projectWorkspace" style={this.state.contentStyle}>
              <VisualMode 
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                tacketed={this.props.collationManager.visualizations.tacketed}
                sewing={this.props.collationManager.visualizations.sewing}
                toggleVisualizationDrawing={this.props.toggleVisualizationDrawing}
                updateGroup={this.updateGroup}
                openNoteDialog={(note)=>this.openNoteDialog(note, true)}
                tabIndex={this.props.popUpActive?-1:0}
              />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      } else {
        workspace = (
          <div role="main">
            <div className="projectWorkspace" style={this.state.leftSideBarOpen?{margin: "1%", ...this.state.contentStyle}:{...this.state.contentStyle, left: 0, margin: "1%", width: "73%"}}>
              <ViewingMode 
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                selectedObjects={this.props.selectedObjects}
                imageViewerEnabled={this.state.imageViewerEnabled}
              />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      }
    }
    if (this.props.project.groupIDs.length===0 && !this.props.loading){
      workspace = (
        <div role="main">
          <div className="projectWorkspace">
            <h3>
              It looks like you have an empty project. Add a new Group to start collating. 
            </h3>
          </div>
          {infobox}
        </div>
      );
    }
    return (
      <div className="collationManager">
        {topbar}
        {sidebar}
        <Filter 
          open={this.props.filterPanelOpen} 
          filterHeightChange={this.filterHeightChange}
          fullWidth={this.props.collationManager.viewMode==="VIEWING" && this.state.imageViewerEnabled}
          tabIndex={this.props.popUpActive||!this.props.filterPanelOpen?-1:0}
          leafIDs={this.props.project.leafIDs}
        />
        {workspace}
        <NoteDialog
          open={this.state.activeNote!==null}
          commonNotes={this.getCommonNotes()}
          activeNote={this.state.activeNote ? this.state.activeNote : {id: null}}
          closeNoteDialog={this.closeNoteDialog}
          action={{
            updateNote: this.updateNote, 
            deleteNote: this.deleteNote, 
            linkNote: this.linkDialogNote, 
            unlinkNote: this.unlinkDialogNote,
            linkAndUnlinkNotes: this.linkAndUnlinkNotes,
          }} 
          projectID={this.props.project.id} 
          noteTypes={this.props.project.noteTypes}
          Notes={this.props.project.Notes}
          Groups={this.props.project.Groups}
          groupIDs={this.props.project.groupIDs}
          Leafs={this.props.project.Leafs}
          leafIDs={this.props.project.leafIDs}
          Rectos={this.props.project.Rectos}
          rectoIDs={this.props.project.rectoIDs}
          Versos={this.props.project.Versos}
          versoIDs={this.props.project.versoIDs}
          isReadOnly={this.props.collationManager.viewMode==="VIEWING"}
          togglePopUp={this.props.togglePopUp}
        />
      </div>
    );
  }

  static propTypes = {
    /** History object from React Router */
    history: PropTypes.object,
    /** Location object from React Router */
    location: PropTypes.object,
    /** Match object from React Router */
    match: PropTypes.object,
    /** User object from Redux store */
    user: PropTypes.object,
    /** Project that is being edited */
    project: PropTypes.object,
    /** Boolean if loading screen should appear - from Redux store */
    loading: PropTypes.bool,
    /** Dictionary containing arrays of updated leaf/group ID's to 'flash' - from Redux store */
    flashItems: PropTypes.shape({
      leaves: PropTypes.arrayOf(PropTypes.number),
      groups: PropTypes.arrayOf(PropTypes.number)
    }),
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
    project: state.active.project,
    preferences: state.active.project.preferences,
    managerMode: state.active.managerMode,
    filterPanelOpen: state.active.collationManager.filters.filterPanelOpen,
    selectedObjects: state.active.collationManager.selectedObjects,
    collationManager: state.active.collationManager,
    loading: state.global.loading,
    exportedData: state.active.exportedData,
    exportedImages: state.active.exportedImages,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadProject: (projectID, props) => {
      dispatch(loadProject(projectID));
    },

    changeViewMode: (viewMode) => {
      dispatch(changeViewMode(viewMode));
    },

    handleObjectPress: (selectedObjects, object, event) => {
      dispatch(handleObjectPress(selectedObjects, object, event));
    },

    handleObjectClick: (selectedObjects, object, event, Groups, Leafs, Rectos, Versos) => {
      dispatch(handleObjectClick(selectedObjects, object, event, { Groups, Leafs, Rectos, Versos}));
    },

    changeManagerMode: (managerMode) => {
      dispatch(changeManagerMode(managerMode));
    },

    toggleFilterPanel: (value) => {
      dispatch(toggleFilterPanel(value));
    },

    updateProject: (project, projectID) => {
      dispatch(updateProject(projectID, project));
    },

    hideProjectTip: () => {
      dispatch({type: "HIDE_PROJECT_TIP"});
    },

    updateGroup: (groupID, group, props) => {
      dispatch(updateGroup(groupID, group));
    },

    updateNote: (noteID, note, projectID, filters) => {
      dispatch(updateNote(noteID, note))
      .then(()=>dispatch(reapplyFilterProject(projectID, filters)));
    },

    deleteNote: (noteID, projectID, filters) => {
      dispatch(deleteNote(noteID))
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
    },
    toggleVisualizationDrawing: (data) => {
      dispatch(toggleVisualizationDrawing(data));
    },

    updateFilterSelection: (
      selection, 
      Groups,
      Leafs,
      Rectos,
      Versos
    ) => {
      dispatch(updateFilterSelection(
        selection, 
        [],
        {Groups, Leafs, Rectos, Versos}
      ));
    },

    exportProject: (projectID, format) => {
      dispatch(exportProject(projectID, format));
    },

    showCopyToClipboardNotification: () => {
      dispatch({ 
        type: "SHOW_NOTIFICATION",
        payload: "Successfully copied to clipboard"
      }); 
      setTimeout(()=>dispatch({type: "HIDE_NOTIFICATION"}), 4000);
    }
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CollationManager);

