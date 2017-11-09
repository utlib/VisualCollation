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
          changeManagerMode,
          toggleFilterPanel,
          updateFilterSelection,
          toggleTacket,
} from "../actions/editCollation/interactionActions";
import { 
  loadProject, 
  updateGroup,
} from "../actions/editCollation/modificationActions";
import { exportProject } from "../actions/projectActions";
import { updateProject } from "../actions/projectActions";
import fileDownload from 'js-file-download';


/** Container for `TabularMode`, `VisualMode`, `InfoBox`, `TopBar`, `LoadingScreen`, and `Notification`. This container has the project sidebar embedded directly.  */
class CollationManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
      showTips: props.preferences.showTips
    };
  }

  componentWillMount() {
    if (this.props.collationManager.viewMode==="VIEWING") {
      this.setState({leftSideBarOpen:false});
    }
  }

  componentDidMount() {
    if (this.props.filterPanelOpen){
      let filterContainer = document.getElementById('filterContainer');
      if (filterContainer) {
        let filterPanelHeight = filterContainer.offsetHeight;
        this.filterHeightChange(filterPanelHeight);
      }
    }
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


  /**
   * Pass the newly clicked object to the `handleObjectClick` action
   * @param {object} object 
   * @param {object} event
   * @public
   */
  handleObjectClick = (object, event) => {
    this.props.handleObjectClick( 
      this.props.selectedObjects, 
      object, 
      event,
      this.props.project.Groups,
      this.props.project.Leafs,
      this.props.project.Rectos,
      this.props.project.Versos,
    );
  }
  /**
   * Pass new view mode value (`VISUAL`, `TABULAR` or `VIEWING`) to the `changeViewMode` action
   * @param {string} value 
   * @public
   */
  handleViewModeChange = (value) => {
    if (value==="VIEWING" && this.state.leftSideBarOpen) {
      this.setState({leftSideBarOpen: false}, ()=>this.props.changeViewMode(value));
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
    this.props.updateProject(project, this.props.project.id)
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
      if (this.state.export.open)
        this.props.exportProject(this.props.project.id, type);
    });
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
      >
        <Tabs 
          tabItemContainerStyle={{backgroundColor: '#ffffff'}}
          value={this.props.collationManager.viewMode} 
          onChange={this.handleViewModeChange}
        >
          <Tab label="Visual Mode" value="VISUAL" buttonStyle={topbarStyle.tab} />
          <Tab label="Tabular Mode" value="TABULAR" buttonStyle={topbarStyle.tab} />
          <Tab label="Viewing Mode" value="VIEWING" buttonStyle={topbarStyle.tab} />
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
              onTouchTap={this.closeTip}
              style={{width:"inherit",height:"inherit", padding:0}}
              iconStyle={{color:"#526C91"}}
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
          label="Select All Groups"
          labelStyle={{color:"#ffffff"}}
          iconStyle={{fill:"#4ED6CB"}}
          selected={true}
        />
        <RadioButton
          value="Leafs"
          label="Select All Leaves"
          labelStyle={{color:"#ffffff"}}
          iconStyle={{fill:"#4ED6CB"}}
        />
        <RadioButton
        value="Rectos"
        label="Select All Rectos"
        labelStyle={{color:"#ffffff"}}
        iconStyle={{fill:"#4ED6CB"}}
      />
      <RadioButton
        value="Versos"
        label="Select All Versos"
        labelStyle={{color:"#ffffff"}}
        iconStyle={{fill:"#4ED6CB"}}
      />
    </RadioButtonGroup>
    );

    const exportDialog = (
      <Export 
        label={this.state.export.label}
        exportOpen={this.state.export.open}
        handleExportToggle={this.handleExportToggle}
        exportedData={this.props.exportedData}
        exportedType={this.state.export.type}
        projectTitle={this.props.project.title}
        showCopyToClipboardNotification={this.showCopyToClipboardNotification}
      />
    );

    const sidebar = (
      <div className={this.state.leftSideBarOpen?"sidebar":"sidebar hidden"}>
        <hr />  
        {tipsDiv}
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
        <Panel title="Selector" defaultOpen={false}>
          {selectionRadioGroup}
          <FlatButton
            label="Clear selection" 
            onClick={(e)=>this.setState({selectAll:""},this.handleSelection(""))}
            secondary
            fullWidth
            style={this.state.selectAll===""?{display:"none"}:{}}
          />
        </Panel>
        <Panel title="Export" defaultOpen={false}>
          <h1>Export Collation Data</h1>
          <div className="export">
            <div>
              <FlatButton 
                label="JSON" 
                labelStyle={{color:"#ffffff"}}
                backgroundColor="rgba(255, 255, 255, 0.05)"
                style={{width: "100%"}}
                onClick={()=>this.handleExportToggle(true, "json", "JSON")}
              />
            </div>
            <div>
              <FlatButton 
                label="Viscoll XML" 
                labelStyle={{color:"#ffffff"}}
                backgroundColor="rgba(255, 255, 255, 0.05)"
                style={{width: "100%"}}
                onClick={()=>this.handleExportToggle(true, "xml", "XML")}
              />
            </div>
            <div>
              <FlatButton 
                label="Formula (Structure only)" 
                labelStyle={{color:"#ffffff"}}
                backgroundColor="rgba(255, 255, 255, 0.05)"
                style={{width: "100%", display:"none"}}
                onClick={()=>this.handleExportToggle(true, "formula", "Collation Formula")}
              />
            </div>
          </div>
          <h1>Export Collation Diagram</h1>
          <div className="export">
            <div>
              <FlatButton 
                label={this.props.collationManager.viewMode!=="VISUAL"? "Only available in visual mode" : "PNG" } 
                labelStyle={this.props.collationManager.viewMode!=="VISUAL"?{color:"#a5a5a5", fontSize:11, cursor:"not-allowed"} : {color:"#ffffff"}}
                backgroundColor="rgba(255, 255, 255, 0.05)"
                style={{width: "100%"}}
                onClick={this.handleDownloadCollationDiagram}
                disabled={this.props.collationManager.viewMode!=="VISUAL"}
              />
            </div>
          </div>
        </Panel>
        
      </div>
    );

    const infobox = (
        <div 
          className="infoBox" 
          style={{...this.state.contentStyle, ...this.state.infoBoxStyle}}
        >
          <InfoBox type={this.props.selectedObjects.type} user={this.props.user} />
        </div>
      )

    let workspace = <div></div>;
    if (this.props.project.groupIDs.length>0){
      if (this.props.collationManager.viewMode==="TABULAR") {
        workspace = (
          <div >
            <div className="projectWorkspace" style={this.state.contentStyle}>
                <TabularMode 
                  project={this.props.project}
                  collationManager={this.props.collationManager}
                  handleObjectClick={this.handleObjectClick}
                />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      } else if (this.props.collationManager.viewMode==="VISUAL") {
        workspace = (
          <div >
            <div className="projectWorkspace" style={this.state.contentStyle}>
              <VisualMode 
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                tacketing={this.props.tacketing}
                toggleTacket={this.props.toggleTacket}
                updateGroup={this.updateGroup}
              />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      } else {
        workspace = (
          <div >
            <div className="projectWorkspace" style={{...this.state.contentStyle, left: 0, margin: "1%", width: "73%"}}>
              <ViewingMode 
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                selectedObjects={this.props.selectedObjects}
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
        <div>
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
          fullWidth={this.props.collationManager.viewMode==="VIEWING"}
        />
        {workspace}
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
    tacketing: state.active.collationManager.visualizations.tacketing,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleTacket: (toggle) => {
      dispatch(toggleTacket(toggle));
    },

    loadProject: (projectID, props) => {
      dispatch(loadProject(projectID));
    },

    changeViewMode: (viewMode) => {
      dispatch(changeViewMode(viewMode));
    },

    handleObjectClick: (selectedObjects, object, event, Groups, Leafs, Rectos, Versos) => {
      dispatch(handleObjectClick(selectedObjects, object, event, {Groups, Leafs, Rectos, Versos}));
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

    updateGroup: (groupID, group, props) => {
      dispatch(updateGroup(groupID, group));
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

