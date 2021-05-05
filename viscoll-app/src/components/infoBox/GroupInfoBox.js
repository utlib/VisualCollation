import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import AddGroupDialog from '../infoBox/dialog/AddGroupDialog';
import DeleteConfirmationDialog from '../infoBox/dialog/DeleteConfirmationDialog';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Chip from 'material-ui/Chip';
import IconButton from 'material-ui/IconButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconPencil from 'material-ui/svg-icons/content/create';
import Avatar from 'material-ui/Avatar';
import AddNote from './dialog/AddNote';
import VisualizationDialog from './dialog/VisualizationDialog';
import SelectField from '../global/SelectField';
import {btnBase} from '../../styles/button';
import { checkboxStyle } from '../../styles/checkbox';
import { renderNoteChip } from '../../helpers/renderHelper';

/** Group infobox */
export default class GroupInfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.emptyAttributeState(),
      ...this.otherAttributeStates(),
      ...this.visibilityHoverState(),
      addButtonPopoverOpen: false,
      addGroupDialogOpen: false,
      addLeafDialogOpen: false,
      visualizationDialogActive: "",
    }
    this.batchSubmit = this.batchSubmit.bind(this);
    this.hasActiveAttributes = this.hasActiveAttributes.bind(this);
  }

  visibilityHoverState() {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state["visibility_hover_" + this.props.defaultAttributes[i]["name"]]=false;
    }
    return state;
  }

  /**
   *  Creates a dictionary of attributes and if its toggled on or off during batch edit
   *  This is used for the checkbox states
   */
  otherAttributeStates() {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state["batch_" + this.props.defaultAttributes[i]["name"]]=false;
      state["editing_" + this.props.defaultAttributes[i]["name"]]=false;
    }
    return state;
  }

  /**
   * Creates a dictionary of attributes with no values
   */  
  emptyAttributeState() {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state[this.props.defaultAttributes[i]["name"]]="";
    }
    return state;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedGroups.length < 2) {
      this.setState({...this.emptyAttributeState()});
    }
  }

  hasActiveAttributes() {
    for (var i in this.props.defaultAttributes) {
      if (this.state["batch_" + this.props.defaultAttributes[i]["name"]] && 
          this.state[this.props.defaultAttributes[i]["name"]]!=="keep" &&
          this.state[this.props.defaultAttributes[i]["name"]]!=="") {
        return true;
      }
    }
    return false;
  }

  toggleAddGroupDialog = (value=false) => {
    this.setState({ addGroupDialogOpen: value, addButtonPopoverOpen: false, })
    if (value===false) this.props.togglePopUp(false);
  }

  toggleAddLeafDialog = (value=false) => {
    this.setState({ addLeafDialogOpen: value, addButtonPopoverOpen: false, })
    if (value===false) this.props.togglePopUp(false);
  }

  handleAddButtonTouchTap = (event) => {
    event.preventDefault();
    this.setState({
      addButtonPopoverOpen: true,
      popoverAnchorEl: event.currentTarget,
    });
  };

  handleAddButtonRequestClose = () => {
    this.setState({
      addButtonPopoverOpen: false,
    });
  };

  toggleCheckbox(target) {
    let newToggleState = {};
    newToggleState["batch_"+target]=!this.state["batch_"+target];
    this.setState(newToggleState);
  }

  dropDownChange = (value, attributeName) => {
    if (Object.keys(this.props.selectedGroups).length===1) {
      // In single edit - we submit change immediately
      this.singleSubmit(attributeName, value);
    } else {
      // In batch edit - save change of attribute to the state
      let updatedAttribute = {};
      updatedAttribute[attributeName] = value;
      this.setState(updatedAttribute); 
    }
  }

  onTextboxChange = (value, attributeName) => {
    let newAttributeState = {};
    newAttributeState[attributeName] = value;
    let newEditingState = {};
    newEditingState["editing_"+attributeName] = true;
    this.setState({...newAttributeState,...newEditingState});
  };

  textSubmit(e, attributeName) {
    e.preventDefault();
    let newEditingState = {};
    newEditingState["editing_"+attributeName] = false;
    this.setState({...newEditingState});
    if (!this.state.isBatch) {
      this.singleSubmit(attributeName, this.state[attributeName]);
    }
  }

  textCancel(e, attributeName) {
    let newAttributeState = {};
    newAttributeState[attributeName] = 
    this.props.Groups[this.props.selectedGroups[0]][attributeName];
    let newEditingState = {};
    newEditingState["editing_"+attributeName] = false;
    this.setState({...newAttributeState,...newEditingState});
  }

  singleSubmit = (attributeName, value) => {
    let group = {};
    group[attributeName] = value;
    let id = this.props.selectedGroups[0];
    this.props.action.updateGroup(id, group);
  }
  clickVisibility = (attributeName, value) => {
    if (attributeName!=="type"||this.props.viewMode==="TABULAR") {
      this.props.action.updatePreferences({group:{...this.props.preferences.group, [attributeName]:value}});
    }
  }
  batchFlip() {
    let groups = [];
    for (let id of this.props.selectedGroups) {
      let flippedDir
      const dir = this.props.Groups[id].direction;
      if(dir){
        flippedDir = (dir === "left-to-right") ? "right-to-left" : "left-to-right";
      } else {
        flippedDir = "right-to-left"
      }
      const attributes = {"direction": flippedDir};
      groups.push({id, attributes});
    }
    this.props.action.updateGroups(groups);
  }

  batchSubmit() {
    let attributes = {};
    for (var i in this.props.defaultAttributes) {
      let attrName = this.props.defaultAttributes[i]["name"];
      let attrValue = this.state[this.props.defaultAttributes[i]["name"]];
      if (attrValue !== "" && attrValue !== "keep" && attrValue !== "Keep same") {
        attributes[attrName] = attrValue;
      }
    }
    let groups = [];
    for (let id of this.props.selectedGroups) {
      groups.push({id, attributes});
    }
    this.props.action.updateGroups(groups);
    // Reset states
    this.setState({...this.otherAttributeStates()});
  }

  getAttributeValues(selectedGroups=this.props.selectedGroups) {
    let groupAttributes = {};
    for (var i in this.props.defaultAttributes) {
      let attributeName = this.props.defaultAttributes[i]['name'];
      for (let id of selectedGroups) {
        let group = this.props.Groups[id];
        if (groupAttributes[attributeName]===undefined) {
          groupAttributes[attributeName] = group[attributeName];
        } else if (groupAttributes[attributeName]!==group[attributeName]) {
          groupAttributes[attributeName] = null;
          break;
        }
      }
    }
    return groupAttributes;
  }

  renderNotes = () => {
    let chips = [];
    for (let noteID of this.props.commonNotes) {
      const note = this.props.Notes[noteID];
      chips.push(renderNoteChip(this.props, note));
    }
    return chips;
  }

  closeNoteDialog = () => {
    this.setState({activeNote: null});
  }

  toggleTacketDrawing = (e) => {
    e.stopPropagation();
    this.props.action.toggleVisualizationDrawing({type:"tacketed", value: this.props.selectedGroups[0]});
    this.handleAddButtonRequestClose();
  }

  toggleSewingDrawing = (e) => {
    e.stopPropagation();
    this.props.action.toggleVisualizationDrawing({type:"sewing", value: this.props.selectedGroups[0]});
    this.handleAddButtonRequestClose();
  }

  handleTacketSewingChange = (type, leafID, index) => {
    const targetGroup = this.props.Groups[this.props.selectedGroups[0]];
    const value = leafID==="spine"? null : leafID;
    let groupPayload = {};
    groupPayload[type] = targetGroup[type];
    if (groupPayload[type].length===2) {
      groupPayload[type][index] = value;
    } else if (groupPayload[type].length===1 && index===0) {
      // Array has one item, which is the endleaf.  Insert startleaf ID
      groupPayload[type].splice(index, 0, value);
    } else if (groupPayload[type].length===1 && index===1) {
      // Array has one item, which is the endleaf.  Replace endleaf ID
      groupPayload[type] = [value];
    }
    if (!groupPayload[type][0])
      groupPayload[type].splice(0, 1)
    this.props.action.updateGroup(targetGroup.id, groupPayload);
  }

  deleteTacket = () => {
    this.singleSubmit("tacketed", []);
  }

  deleteSewing = () => {
    this.singleSubmit("sewing", []);
  }

  toggleVisualizationDialog = (value) => {
    this.setState({visualizationDialogActive:value});
    if (value==="") { 
      this.props.togglePopUp(false);
    } else {
      this.props.togglePopUp(true);
    }
  }

  toggleGroupDirection = () => {
    if(this.props.Groups[this.props.selectedGroups[0]].direction === "left-to-right"){
      this.singleSubmit("direction", "right-to-left")
    } else if(this.props.Groups[this.props.selectedGroups[0]].direction === "right-to-left"){
      this.singleSubmit("direction", "left-to-right")
    } else {
      this.singleSubmit("direction", "right-to-left")
    }
  }

  clickVisibility = (attributeName, value) => {
    if (attributeName!=="type"||this.props.viewMode==="TABULAR") {
      this.props.action.updatePreferences({group:{...this.props.preferences.group, [attributeName]:value}});
    }
  }

  renderTooltip = (eyeIsChecked, eyeStyle, attributeDict) => {
    return (
      <div className={this.state["visibility_hover_"+attributeDict.name]?"text active":"text"} style={Object.keys(eyeStyle).length>0?{display:"none"}:{}}>
        {eyeIsChecked?
          "Hide attribute in the collation"
          : "Show attribute in the collation"
        }
      </div>
    )
  }

  render() {
    const isBatch = this.props.selectedGroups.length > 1;
    let attributeDivs = [];
    let groupAttributes = this.getAttributeValues();
    this.props.defaultAttributes.forEach((attributeDict)=> {
      let label = attributeDict.displayName;
      let eyeCheckbox = "";
      let eyeStyle = {};
      let eyeIsChecked = this.props.preferences.group && this.props.preferences.group[attributeDict.name]?this.props.preferences.group[attributeDict.name] : false;
      if (this.props.viewMode!=="TABULAR") {
        if (attributeDict.name==="type") {
          eyeStyle = {fill: "#C2C2C2", cursor:"not-allowed"};
          eyeIsChecked = false;
        }
      }
      if (isBatch && !this.props.isReadOnly) {
        eyeCheckbox = 
          <div className="tooltip eyeToggle">
            <Checkbox
              aria-label={eyeIsChecked?"Hide '" + attributeDict.displayName + "' attribute in collation":"Show '" + attributeDict.displayName + "' attribute in collation"}
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onClick={()=>this.clickVisibility(attributeDict.name, !eyeIsChecked)}
              style={{display:this.props.windowWidth<=1024?"none":"inline-block",width:"25px",...eyeStyle}}
              iconStyle={{...checkboxStyle().iconStyle,...eyeStyle}}
              checked={eyeIsChecked}
              onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
              onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
              tabIndex={this.props.tabIndex}
            />
            {this.renderTooltip(eyeIsChecked, eyeStyle, attributeDict)}
          </div>
        label = <Checkbox
          aria-label={"Select '" + attributeDict.displayName + "' to batch edit"}
          label={attributeDict.displayName} 
          onClick={()=>this.toggleCheckbox(attributeDict.name)}
          labelStyle={!this.state["batch_"+attributeDict.name]?{color:"gray",fontSize:this.props.windowWidth<=768?"12px":null}:{fontSize:this.props.windowWidth<=768?"12px":null}}
          checked={this.state["batch_"+attributeDict.name]}
          style={{display:"inline-block",width:"25px"}}
          iconStyle={{...checkboxStyle().iconStyle}}
          tabIndex={this.props.tabIndex}
        />;
      } else {
        // In single edit - display eye icon with label
        label = 
          <div className="tooltip eyeToggle">
            <Checkbox
              aria-label={eyeIsChecked?"Hide '" + attributeDict.displayName + "' attribute in collation":"Show '" + attributeDict.displayName + "' attribute in collation"}
              label={attributeDict.displayName} 
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onClick={()=>this.clickVisibility(attributeDict.name, !eyeIsChecked)}
              style={{display:"inline-block",width:"25px",...eyeStyle}}
              {...checkboxStyle()}
              iconStyle={{...checkboxStyle().iconStyle, color:"gray", ...eyeStyle}}
              checked={eyeIsChecked}
              onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
              onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
              tabIndex={this.props.tabIndex}
            />
            {this.renderTooltip(eyeIsChecked, eyeStyle, attributeDict)}
          </div>
      }
      // Generate dropdown or text box depending on the current attribute 
      let input = groupAttributes[attributeDict.name];
      if (!this.props.isReadOnly) {
        if (attributeDict.options!==undefined) {
          // Drop down menu
          let menuItems = [];
          let value = "keep";
          attributeDict.options.forEach((option, index)=> {
            menuItems.push({value:option, text: option});
          });
          if (groupAttributes[attributeDict.name]===null) {
            menuItems.push({value:"keep", text:"Keep same"});
          }
          if (groupAttributes[attributeDict.name]!==null) {
            value = groupAttributes[attributeDict.name];
          }
          input = (<SelectField
                    id={"GIB_"+attributeDict.name}
                    label={attributeDict.displayName + " attribute dropdown" }
                    onChange={(v)=>this.dropDownChange(v,attributeDict.name)}
                    disabled={isBatch && !this.state["batch_"+attributeDict.name]}
                    tabIndex={this.props.tabIndex}
                    data={menuItems}
                    value={value}
                  >
                  </SelectField>
                );
        } else {
          // Text box
          let textboxButtons = ""; 
          if (!isBatch && this.state["editing_"+attributeDict.name]) {
            textboxButtons = (
              <div>
                <RaisedButton
                  aria-label="Submit"
                  primary
                  icon={<IconSubmit />}
                  style={{minWidth:this.props.windowWidth<=768?"35px":"60px",marginLeft:"5px"}}
                  onClick={(e)=>this.textSubmit(e,attributeDict.name)}
                  tabIndex={this.props.tabIndex}
                />
                <RaisedButton
                  aria-label="Cancel"
                  secondary
                  icon={<IconClear />}
                  style={{minWidth:this.props.windowWidth<=768?"35px":"60px",marginLeft:"5px"}}
                  onClick={(e)=>this.textCancel(e,attributeDict.name)}
                  tabIndex={this.props.tabIndex}
                />
              </div>
            );
          }
          let value = "Keep same";
          if (this.state["editing_"+attributeDict.name]) {
            value = this.state[attributeDict.name];
          } else if (groupAttributes[attributeDict.name]) {
            value = groupAttributes[attributeDict.name];
          }
          input = (<div>
            <form onSubmit={(e)=>this.textSubmit(e,attributeDict.name)}>
              <TextField
                aria-label={attributeDict.displayName + " attribute textfield"}
                name={attributeDict.name}
                fullWidth={true}
                value={value}
                onChange={(e,v)=>this.onTextboxChange(v,attributeDict.name)}
                disabled={isBatch && !this.state["batch_"+attributeDict.name]}
                tabIndex={this.props.tabIndex}
                inputStyle={{fontSize:this.props.windowWidth<=1024?"12px":"16px"}}
              />
              {textboxButtons}
            </form>
          </div>)
        }
      } else {
        if (!input && this.props.selectedGroups.length>1) {
          input = <div style={{color:"gray", fontStyle: "italic", fontSize: this.props.windowWidth<=768?"0.7em":"0.9em", padding:"10px 0px"}}>Different values</div>;
        } else {
          input = <div style={{padding:"10px 0px", fontSize:this.props.windowWidth<=768?"0.7em":null}}>{input}</div>;
        }
      }
      attributeDivs.push(
        <div className="row" key={attributeDict.name}>
          <div className="label">
            {eyeCheckbox}
            {label}
          </div>
          <div className="input">
            {input}
          </div>
        </div>
      );
    });
    let submitBtn = "";
    if (isBatch && this.hasActiveAttributes()) {
      submitBtn = <RaisedButton 
                    primary fullWidth
                    onClick={this.batchSubmit}
                    label="Submit changes" 
                    style={{marginBottom:10}}
                    tabIndex={this.props.tabIndex}
                  />
    }
    let addBtn = "";
    let addButtonPopover = "";
    if (!isBatch) {
      addButtonPopover = <Popover
                            open={this.state.addButtonPopoverOpen}
                            anchorEl={this.state.popoverAnchorEl}
                            anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
                            targetOrigin={{horizontal: 'middle', vertical: 'top'}}
                            onRequestClose={this.handleAddButtonRequestClose}
                            animation={PopoverAnimationVertical}
                          >
                            <Menu>
                              <MenuItem  primaryText="Add New Group" onClick={()=>{this.props.togglePopUp(true);this.toggleAddGroupDialog(true)}} />
                              <MenuItem primaryText="Add Leaf(s) Inside" onClick={()=>{this.props.togglePopUp(true);this.toggleAddLeafDialog(true)}}/>
                            </Menu>
                          </Popover>

      addBtn = <RaisedButton 
          primary 
          label={this.props.selectedGroups ? "Add" : "Add New Group"} 
          onClick={this.handleAddButtonTouchTap}
          tabIndex={this.props.tabIndex}
          {...btnBase()}
          style={this.props.selectedGroups ? {...btnBase().style, width: "48%", float:"left", marginRight:"2%"} : {width:"100%", float:"left", marginRight:"2%"}}
        />
    }

    let flipBtn = <RaisedButton 
                    primary 
                    label={"Flip View Direction"} 
                    onClick={() => {if(this.props.selectedGroups.length > 1){this.batchFlip()}else{this.toggleGroupDirection()}}}
                    tabIndex={this.props.tabIndex}
                    {...btnBase()}
                    style={(this.props.selectedGroups && this.props.selectedGroups.length === 1) ? {...btnBase().style, width: "48%", float:"left", marginRight:"2%", marginTop:"2%"} : {width:"100%", float:"left", marginRight:"2%", marginTop:"2%", marginBottom:"2%"}}
                  />
    let deleteBtn = 
                <DeleteConfirmationDialog
                  fullWidth={isBatch}
                  action={{singleDelete: this.props.action.deleteGroup, batchDelete: this.props.action.deleteGroups}}
                  selectedObjects={this.props.selectedGroups}
                  memberType="Group"
                  Groups={this.props.Groups}
                  groupIDs={this.props.groupIDs}
                  leafIDs={this.props.leafIDs}
                  tabIndex={this.props.tabIndex}
                  togglePopUp={this.props.togglePopUp}
                />
    let attributeSewing = "";
    const sewing = this.props.Groups[this.props.selectedGroups[0]].sewing;
    if (this.props.selectedGroups.length===1 && sewing.length===0 && this.props.viewMode!=="VIEWING") {
      attributeSewing = <div>
      <div style={{float:'right', marginTop:-10}}>
        <IconButton
          tooltip="Add sewing"
          aria-label="Add sewing"
          onClick={(e)=>{if(this.props.viewMode==="TABULAR"){this.toggleVisualizationDialog("sewing")}else{this.toggleSewingDrawing(e)}}}
          tabIndex={this.props.tabIndex}
        > 
          <IconAdd />
        </IconButton>
      </div>
      <h3>Sewing</h3>
    </div>
    } else if (this.props.selectedGroups.length===1 && sewing.length>0) {
      attributeSewing =
      <div>
        <div>
        <h3>Sewing</h3>
        <Chip 
          aria-label="Click to edit sewing"
          style={{marginRight:4, marginBottom:4}}
          onRequestDelete={this.props.viewMode!=="VIEWING"?()=>{this.deleteSewing()}:null}
          onClick={()=>{if(this.props.viewMode!=="VIEWING")this.toggleVisualizationDialog("sewing")}}
          tabIndex={this.props.tabIndex}
        >
          <div>
            <div style={{display:"inline-block",fontSize:this.props.windowWidth<=768?10:null}}>
              {sewing.length===1? 
                  "Spine to Leaf " + (this.props.leafIDs.indexOf(sewing[0])+1) :
                  "Leaf " + (this.props.leafIDs.indexOf(sewing[0]) + 1) + " to Leaf " + (this.props.leafIDs.indexOf(sewing[1])+1)
              }
            </div>
            <div style={this.props.viewMode==="VISUAL"?{display:"inline-block",margin:0,paddingLeft:8}:{display:"none"}}>
              <div style={{position:'relative',top:5}}>
                <Avatar size={20} style={{margin:0,padding:0}} color={"#E0E0E0"} className="editIcon" icon={<IconPencil alt="Redraw" style={{width:20,height:20}} onClick={this.toggleSewingDrawing}/> }/>
              </div>
            </div>
          </div>
        </Chip>
        </div>
        <div style={{clear:"both"}}></div>
      </div>
    }
    const tacketed = this.props.Groups[this.props.selectedGroups[0]].tacketed;
    let attributeTacket = "";
    if (this.props.selectedGroups.length===1 && tacketed.length===0 && this.props.viewMode!=="VIEWING") {
      attributeTacket = <div>
        <div style={{float:'right', marginTop:-10}}>
          <IconButton 
            tooltip="Add tacket"
            aria-label="Add tacket"
            onClick={(e)=>{if(this.props.viewMode==="VISUAL"){this.toggleTacketDrawing(e)}else{this.toggleVisualizationDialog("tacketed")}}}
            tabIndex={this.props.tabIndex}
          > 
            <IconAdd />
          </IconButton>
        </div>
        <h3>Tacket</h3>
      </div>
    } else if (this.props.selectedGroups.length===1 && tacketed.length>0) {
      attributeTacket =
      <div>
        <div>
        <h3>Tacket</h3>
        <Chip 
          aria-label="Click to edit tacketing"
          style={{marginRight:4, marginBottom:4}}
          onRequestDelete={this.props.viewMode!=="VIEWING"?()=>{this.deleteTacket()}:null}
          onClick={()=>{if(this.props.viewMode!=="VIEWING")this.toggleVisualizationDialog("tacketed")}}
          tabIndex={this.props.tabIndex}
        >
          <div>
            <div style={{display:"inline-block",fontSize:this.props.windowWidth<=768?10:null}}>
              {tacketed.length===1? 
                "Spine to Leaf " + (this.props.leafIDs.indexOf(tacketed[0])+1) :
                "Leaf " + (this.props.leafIDs.indexOf(tacketed[0])+1) + " to Leaf " + (this.props.leafIDs.indexOf(tacketed[1])+1)
              }
            </div>
            <div style={this.props.viewMode==="VISUAL"?{display:"inline-block",margin:0,paddingLeft:8}:{display:"none"}}>
              <div style={{position:'relative',top:5}}>
                <Avatar size={20} style={{margin:0,padding:0}} color={"#E0E0E0"} className="editIcon" icon={<IconPencil alt="Redraw" style={{width:20,height:20}} onClick={this.toggleTacketDrawing}/> }/>
              </div>
            </div>
          </div>
        </Chip>
        </div>
        <div style={{clear:"both"}}></div>
      </div>
    }
    const notes = this.renderNotes();
    return (
      <div className="inner" style={{minHeight:"135px"}}>
          <div>
            {attributeDivs}
            {!this.props.isReadOnly? 
            <AddNote 
              commonNotes={this.props.commonNotes}
              Notes={this.props.Notes}
              action={{
                linkNote: this.props.action.linkNote, 
                createAndAttachNote: this.props.action.createAndAttachNote
              }}
              noteTypes={this.props.noteTypes}
              tabIndex={this.props.tabIndex}
              togglePopUp={this.props.togglePopUp}
              groupIDs={this.props.groupIDs}
              leafIDs={this.props.leafIDs}
            /> : ""}
            <h3 key="notesHeading" style={this.props.isReadOnly&&notes.length===0?{display:'none'}:{}}>{this.props.selectedGroups.length>1?"Notes in common" : "Notes"}</h3>
            <div className="notesInfobox" style={notes.length===0?{display:'none'}:{}}>
              {notes}
            </div>
          </div>
          {attributeSewing}
          {attributeTacket}
          {submitBtn} 
          {addButtonPopover}
          <div style={{clear:"both"}}></div>
          <div style={this.props.isReadOnly?{display:"none"}:{}}>
            <h3>Actions</h3>
              <div style={{textAlign:"center"}}>
                {addBtn}
                {deleteBtn}
                {flipBtn}
              </div>
          </div>
          <AddGroupDialog
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            groupIDs={this.props.groupIDs}
            selectedGroups={this.props.selectedGroups}
            action={{addGroups: this.props.action.addGroups}}           
            open={this.state.addGroupDialogOpen}
            closeDialog={this.toggleAddGroupDialog}
          />
          <AddGroupDialog
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            groupIDs={this.props.groupIDs}
            selectedGroups={this.props.selectedGroups}
            addLeafs={true}
            action={{addLeafs: this.props.action.addLeafs}}
            open={this.state.addLeafDialogOpen}
            closeDialog={this.toggleAddLeafDialog}
          />
          <VisualizationDialog
            open={this.state.visualizationDialogActive!==""}
            type={this.state.visualizationDialogActive}
            closeDialog={()=>this.toggleVisualizationDialog("")}
            group={this.props.selectedGroups.length>0? this.props.Groups[this.props.selectedGroups[0]] : null}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
            tacketed={this.props.Groups[this.props.selectedGroups[0]].tacketed}
            sewing={this.props.Groups[this.props.selectedGroups[0]].sewing}
            Leafs={this.props.Leafs}
            activeGroup={this.props.Groups[this.props.selectedGroups[0]]}
            handleTacketSewingChange={this.handleTacketSewingChange}
            delete={()=>this.singleSubmit(this.state.visualizationDialogActive, [])}
            updateGroup={this.singleSubmit}
            popUpActive={this.props.popUpActive}
          />
      </div>
    );
  }
}
