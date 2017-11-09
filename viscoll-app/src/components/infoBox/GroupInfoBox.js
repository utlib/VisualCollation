import React from 'react';
import SelectField from 'material-ui/SelectField';
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
import NoteDialog from './dialog/NoteDialog';

export default class GroupInfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeNote: null,
      ...this.emptyAttributeState(),
      ...this.otherAttributeStates(),
      ...this.visibilityHoverState(),
      addButtonPopoverOpen: false,
      addGroupDialogOpen: false,
      addLeafDialogOpen: false,
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

  // Creates a dictionary of attributes and if its toggled on or off during batch edit
  // This is used for the checkbox states
  otherAttributeStates() {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state["batch_" + this.props.defaultAttributes[i]["name"]]=false;
      state["editing_" + this.props.defaultAttributes[i]["name"]]=false;
    }
    return state;
  }

  // Creates a dictionary of attributes with no values
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
    if (nextProps.commonNotes.length===0) {
      this.setState({activeNote:null});
    }
    // Update active note 
    nextProps.commonNotes.forEach((noteID)=> {
      if (this.state.activeNote!==null && noteID===this.state.activeNote.id) {
        this.setState({activeNote: nextProps.Notes[noteID]});
      }
    });
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
  }

  toggleAddLeafDialog = (value=false) => {
    this.setState({ addLeafDialogOpen: value, addButtonPopoverOpen: false, })
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


  toggleCheckbox(target, value) {
    let newToggleState = {};
    newToggleState["batch_"+target]=value;
    this.setState(newToggleState);
  }

  dropDownChange = (event, index, value, attributeName) => {
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
    this.props.project.Groups[this.props.selectedGroups[0]][attributeName];
    let newEditingState = {};
    newEditingState["editing_"+attributeName] = false;
    this.setState({...newAttributeState,...newEditingState});
  }

  singleSubmit(attributeName, value) {
    let group = {};
    group[attributeName] = value;
    let id = this.props.selectedGroups[0];
    this.props.action.updateGroup(id, group);
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
      let deleteFn = () => {this.props.action.unlinkNote(note.id)};
      if (this.props.isReadOnly) deleteFn = null;
      chips.push(
        <Chip 
          key={note.id}
          style={{marginRight:4, marginBottom:4}}
          onRequestDelete={deleteFn}
          onClick={()=>this.setState({activeNote: note})}
        >
          {note.title}
        </Chip>);
    }
    return chips;
  }

  closeNoteDialog = () => {
    this.setState({activeNote: null});
  }

  toggleTacketing = () => {
    this.props.action.toggleTacket(this.props.selectedGroups[0]);
    this.handleAddButtonRequestClose();
  }

  render() {
    const isBatch = this.props.selectedGroups.length > 1;
    let attributeDivs = [];
    let groupAttributes = this.getAttributeValues();
    this.props.defaultAttributes.forEach((attributeDict)=> {
      // Generate checkbox if we're in batch edit mode
      let label = attributeDict.displayName;
      // Generate eye toggle checkbox
      let eyeCheckbox = "";

      let eyeStyle = {};
      let eyeIsChecked = this.props.visibleAttributes[attributeDict.name];
      if (this.props.viewMode!=="TABULAR") {
        if (attributeDict.name==="type") {
          eyeStyle = {fill: "#C2C2C2", cursor:"not-allowed"};
          eyeIsChecked = true;
        }
      }
      if (isBatch && !this.props.isReadOnly) {
        eyeCheckbox = 
          <div className="tooltip eyeToggle">
            <Checkbox
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onCheck={(event,value)=>this.props.action.toggleVisibility("group", attributeDict.name, !this.props.visibleAttributes[attributeDict.name])}
              style={{display:"inline-block",width:"25px",...eyeStyle}}
              iconStyle={{marginRight:"10px",...eyeStyle}}
              checked={eyeIsChecked}
              onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
              onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
            />
            <div className={this.state["visibility_hover_"+attributeDict.name]===true?"text active":"text"} style={Object.keys(eyeStyle).length>0?{display:"none"}:{}}>
              {eyeIsChecked?
                "Hide attribute in the collation"
                : "Show attribute in the collation"
              }
            </div>
          </div>
        label = <Checkbox
          label={attributeDict.displayName} 
          onCheck={(event,value)=>this.toggleCheckbox(attributeDict.name,value)}
          labelStyle={!this.state["batch_"+attributeDict.name]?{color:"gray"}:{}}
          checked={this.state["batch_"+attributeDict.name]}
          style={{display:"inline-block",width:"25px"}}
          iconStyle={{marginRight:"10px"}}
        />;
      } else {
        // In single edit - display eye icon with label
        label = 
          <div className="tooltip eyeToggle">
            <Checkbox
              label={attributeDict.displayName} 
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onCheck={(event,value)=>this.props.action.toggleVisibility("group", attributeDict.name, !this.props.visibleAttributes[attributeDict.name])}
              style={{display:"inline-block",width:"25px",...eyeStyle}}
              iconStyle={{marginRight:"10px", color:"gray",...eyeStyle}}
              checked={eyeIsChecked}
              onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
              onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
            />
            <div className={this.state["visibility_hover_"+attributeDict.name]===true?"text active":"text"} style={Object.keys(eyeStyle).length>0?{display:"none"}:{}}>
              {eyeIsChecked?
                "Hide attribute in the collation"
                : "Show attribute in the collation"
              }
            </div>
          </div>
      }
      // Generate dropdown or text box depending on the current attribute 
      let input = groupAttributes[attributeDict.name];
      if (!this.props.isReadOnly) {
        if (attributeDict.options!==undefined) {
          // Drop down menu
          let menuItems = [];
          attributeDict.options.forEach((option, index)=> {
            menuItems.push(<MenuItem key={attributeDict.name+option} value={option} primaryText={option} />);
          });
          if (groupAttributes[attributeDict.name]===null) {
            menuItems.push(<MenuItem key={attributeDict.name+"keep"} value={"keep"} primaryText={"Keep same"} />);
          }
          let value = "keep";
          if (this.state[attributeDict.name]!=="" && isBatch) {
            value = this.state[attributeDict.name];
          } else if (groupAttributes[attributeDict.name]!==null) {
            value = groupAttributes[attributeDict.name];
          }
          input = (<SelectField
                  value={value}
                  onChange={(e, i, v)=>this.dropDownChange(e,i,v,attributeDict.name)}
                  fullWidth={true}
                  disabled={isBatch && !this.state["batch_"+attributeDict.name]}
                  >
                  {menuItems}
                </SelectField>
                );
        } else {
          // Text box
          let textboxButtons = ""; 
          if (!isBatch && this.state["editing_"+attributeDict.name]) {
            textboxButtons = (
              <div>
                <RaisedButton
                  primary
                  icon={<IconSubmit />}
                  style={{minWidth:"60px",marginLeft:"5px"}}
                  onTouchTap={(e)=>this.textSubmit(e,attributeDict.name)}
                />
                <RaisedButton
                  secondary
                  icon={<IconClear />}
                  style={{minWidth:"60px",marginLeft:"5px"}}
                  onTouchTap={(e)=>this.textCancel(e,attributeDict.name)}
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
                name={attributeDict.name}
                fullWidth={true}
                value={value}
                onChange={(e,v)=>this.onTextboxChange(v,attributeDict.name)}
                disabled={isBatch && !this.state["batch_"+attributeDict.name]}
              />
              {textboxButtons}
            </form>
          </div>)
        }
      } else {
        if (!input && this.props.selectedGroups.length>1) {
          input = <div style={{color:"gray", fontStyle: "italic", fontSize: "0.9em", padding:"10px 0px"}}>Different values</div>;
        } else {
          input = <div style={{padding:"10px 0px"}}>{input}</div>;
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
                    onTouchTap={this.batchSubmit} 
                    label="Submit changes" 
                    style={{marginBottom:10}}
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
                              <MenuItem  primaryText="Add New Group" onTouchTap={() => this.toggleAddGroupDialog(true)} />
                              <MenuItem primaryText="Add Leaf(s) Inside"  onTouchTap={() => this.toggleAddLeafDialog(true)}/>
                               </Menu>
                          </Popover>

      addBtn = <RaisedButton 
          primary 
          label={this.props.selectedGroups ? "Add" : "Add New Group"} 
          style={this.props.selectedGroups ? {width:"49%", float:"left", marginRight:"2%"} : {width:"100%", float:"left", marginRight:"2%"}}
          onTouchTap={this.handleAddButtonTouchTap}
        />
    }
    let deleteBtn = 
                <DeleteConfirmationDialog
                  fullWidth={isBatch}
                  action={{singleDelete: this.props.action.deleteGroup, batchDelete: this.props.action.deleteGroups}}
                  selectedObjects={this.props.selectedGroups}
                  memberType="Group"
                  Groups={this.props.Groups}

                />
    let attributeTacket = 
      <div>
        <div style={this.props.viewMode!=="VISUAL"?{display: 'none'} : {float:'right', marginTop:-10}}>
          <IconButton tooltip="Add tacket"> 
            <IconAdd onClick={this.toggleTacketing} />
          </IconButton>
        </div>
        <h3 style={this.props.viewMode!=="VISUAL"&&this.props.Groups[this.props.selectedGroups[0]].tacketed===""?{display:"none"}:{}}>Tacket</h3>
      </div>
    if (!this.state.isBatch && this.props.Groups[this.props.selectedGroups[0]].tacketed!=="") {
      attributeTacket =
      <div>
        <div>
        <h3>Tacket</h3>
        <Chip 
          style={{marginRight:4, marginBottom:4}}
          onRequestDelete={this.props.viewMode==="VISUAL"?()=>{this.singleSubmit("tacketed", "")}:null}
        >
          <div>
            <div style={{display:"inline-block"}}>
            {"Tacketed to Leaf " + this.props.Leafs[this.props.Groups[this.props.selectedGroups[0]].tacketed].order }
            </div>
            <div style={this.props.viewMode==="VISUAL"?{display:"inline-block",margin:0,paddingLeft:8}:{display:"none"}}>
              <div style={{position:'relative',top:5}}>
                <Avatar size={20} style={{margin:0,padding:0}} color={"#E0E0E0"} className="editIcon" icon={<IconPencil style={{width:20,height:20}} onClick={this.toggleTacketing}/> }/>
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
            /> : ""}
            <h3 key="notesHeading" style={this.props.isReadOnly&&notes.length===0?{display:'none'}:{}}>{this.props.selectedGroups.length>1?"Notes in common" : "Notes"}</h3>
            <div className="notesInfobox" style={notes.length===0?{display:'none'}:{}}>
              {notes}
            </div>
          </div>
          {attributeTacket}
          {submitBtn} 
          {addButtonPopover}
          <div style={{clear:"both"}}></div>
          <div style={this.props.isReadOnly?{display:"none"}:{}}>
            <h3>Actions</h3>
            {addBtn}
            {deleteBtn}
          </div>
          <AddGroupDialog
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            selectedGroups={this.props.selectedGroups}
            action={{addGroups: this.props.action.addGroups}}           
            open={this.state.addGroupDialogOpen}
            closeDialog={this.toggleAddGroupDialog}
          />
          <AddGroupDialog
            projectID={this.props.projectID}
            Groups={this.props.Groups}
            selectedGroups={this.props.selectedGroups}
            addLeafs={true}
            action={{addLeafs: this.props.action.addLeafs}}
            open={this.state.addLeafDialogOpen}
            closeDialog={this.toggleAddLeafDialog}
          />     
          <NoteDialog
            open={this.state.activeNote!==null}
            commonNotes={this.props.commonNotes}
            activeNote={this.state.activeNote ? this.state.activeNote : {id: null}}
            closeNoteDialog={this.closeNoteDialog}
            action={{
              updateNote: this.props.action.updateNote, 
              deleteNote: this.props.action.deleteNote, 
              linkNote: this.props.action.linkDialogNote, 
              unlinkNote: this.props.action.unlinkDialogNote,
              linkAndUnlinkNotes: this.props.action.linkAndUnlinkNotes,
            }} 
            projectID={this.props.projectID} 
            notification={this.props.notification}
            noteTypes={this.props.noteTypes}
            Notes={this.props.Notes}
            Groups={this.props.Groups}
            Leafs={this.props.Leafs}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            isReadOnly={this.props.isReadOnly}
          />
      </div>
    );
  }
}
