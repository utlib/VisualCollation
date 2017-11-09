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
import Chip from 'material-ui/Chip';
import AddNote from './dialog/AddNote';
import NoteDialog from './dialog/NoteDialog';
import Dialog from 'material-ui/Dialog';
import ImageViewer from "../global/ImageViewer";


export default class SideInfoBox extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
      activeNote: null,
      imageModalOpen: false,
      isBatch: this.props.selectedSides.length>1,
      ...this.emptyAttributeState(),
      ...this.otherAttributeStates(),
      ...this.visibilityHoverState(),      
    }
  }

  visibilityHoverState = () => {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state["visibility_hover_" + this.props.defaultAttributes[i]["name"]]=false;
    }
    return state;
  }

  // Creates a dictionary of attributes and if its toggled on or off during batch edit
  // This is used for the checkbox states
  otherAttributeStates = () => {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state["batch_" + this.props.defaultAttributes[i]["name"]]=false;
      state["editing_" + this.props.defaultAttributes[i]["name"]]=false;
    }
    return state;
  }

  // Creates a dictionary of attributes with no values
  emptyAttributeState = () => {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state[this.props.defaultAttributes[i]["name"]]="";
    }
    return state;
  }

  hasActiveAttributes = () => {
    for (var i in this.props.defaultAttributes) {
      if (this.state["batch_" + this.props.defaultAttributes[i]["name"]] && 
          this.state[this.props.defaultAttributes[i]["name"]]!=="keep" &&
          this.state[this.props.defaultAttributes[i]["name"]]!=="") {
        return true;
      }
    }
    return false;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isBatch: nextProps.selectedSides.length>1,
    });
    if (!this.state.isBatch) {
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


  dropDownChange = (event, index, value, attributeName) => {
    if (!this.state.isBatch) {
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

  textSubmit = (e, attributeName) => {
    e.preventDefault();
    let newEditingState = {};
    newEditingState["editing_"+attributeName] = false;
    this.setState({...newEditingState});
    if (!this.state.isBatch) {
      this.singleSubmit(attributeName, this.state[attributeName]);
    }
  }

  singleSubmit = (attributeName, value) => {
    let attributes = {};
    attributes[attributeName] = value;
    let sideID = this.props.selectedSides[0];
    let side =
        {
          ...attributes
        }
      ;
    this.props.action.updateSide(sideID, side);
  }

  textCancel = (e, attributeName) => {
    let newAttributeState = {};
    newAttributeState[attributeName] = 
    this.props.Sides[this.props.selectedSides[0]][attributeName];
    let newEditingState = {};
    newEditingState["editing_"+attributeName] = false;
    this.setState({...newAttributeState,...newEditingState});
  }

  // Handle checkbox toggling by updating relevant attribute state
  toggleCheckbox = (target, value) => {
    let newToggleState = {};
    newToggleState["batch_"+target]=value;
    this.setState(newToggleState);
  }

  batchSubmit = () => {
    let attributes = {};
    let sides = [];
    for (var i in this.props.defaultAttributes) {
      // Go through each default attributes
      let attrName = this.props.defaultAttributes[i]["name"];
      if (this.state["batch_"+attrName]) {
        // This side attribute was selected for batch edit
        // Get its new value
        let attrValue = this.state[this.props.defaultAttributes[i]["name"]];
        if (attrValue !== null && attrValue !== "keep" && attrValue !== "Keep same") {
          attributes[attrName] = attrValue;
        }
      }
    }
    for (let id of this.props.selectedSides){
      if (Object.keys(attributes).length>0) {
        sides.push({id, attributes});
      }
    };
    this.setState({...this.otherAttributeStates()})
    this.props.action.updateSides(sides);
  }

  getAttributeValues = (selectedSides=this.props.selectedSides) => {
    let sideAttributes = {};
    for (var i in this.props.defaultAttributes) {
      let attributeName = this.props.defaultAttributes[i]['name'];
      for (let sideID of selectedSides) {
        let side = this.props.Sides[sideID];
        if (sideAttributes[attributeName]===undefined) {
          sideAttributes[attributeName] = side[attributeName];
        } else if (sideAttributes[attributeName]!==side[attributeName]) {
          sideAttributes[attributeName] = null;
          break;
        }
      }
    }
    return sideAttributes;
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
          onClick={()=>{this.setState({activeNote: note})}}
        >
          {note.title}
        </Chip>);
    }
    return chips;
  }

  closeNoteDialog = () => {
    this.setState({activeNote:null});
  }

  toggleImageModal = (imageModalOpen) => {  
    this.setState({imageModalOpen})
  }


  render() {
    let attributeDivs = [];
    let sideAttributes = this.getAttributeValues();
    for (var i in this.props.defaultAttributes) {
      let attributeDict = this.props.defaultAttributes[i];
      if (attributeDict.name === "uri") continue;
      // Generate checkbox if we're in batch edit mode
      let label = attributeDict.displayName;
      // Generate eye toggle checkbox
      let eyeCheckbox = "";

      let eyeStyle = {};
      let eyeIsChecked = this.props.visibleAttributes[attributeDict.name];
      if (this.props.viewMode!=="TABULAR") {
        if (attributeDict.name==="uri"||attributeDict.name==="script_direction") {
          eyeStyle = {fill: "#C2C2C2", cursor:"not-allowed"};
          eyeIsChecked = false;
        }
      }
      if (this.state.isBatch && !this.props.isReadOnly) {
        eyeCheckbox = 
          <div className="tooltip eyeToggle">
            <Checkbox
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onCheck={(event,value)=>this.props.action.toggleVisibility("side", attributeDict.name, !this.props.visibleAttributes[attributeDict.name])}
              style={{display:"inline-block",width:"25px",...eyeStyle}}
              iconStyle={{marginRight:"10px",...eyeStyle}}
              checked={eyeIsChecked}
              onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
              onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
            />
            <div className={this.state["visibility_hover_"+attributeDict.name]?"text active":"text"} style={Object.keys(eyeStyle).length>0?{display:"none"}:{}}>
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
          disabled={this.state.isBatch && (attributeDict.name==="folio_number"||attributeDict.name==="uri")}
        />;
      } else {
        // In single edit, display eye icon with label (no checkbox)
        label = 
          <div className="tooltip eyeToggle">
            <Checkbox
              label={attributeDict.displayName} 
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onCheck={(event,value)=>this.props.action.toggleVisibility("side", attributeDict.name, !this.props.visibleAttributes[attributeDict.name])}
              style={{display:"inline-block",width:"25px",...eyeStyle}}
              iconStyle={{marginRight:"10px", color:"gray",...eyeStyle}}
              checked={eyeIsChecked}
              onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
              onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
            />
            <div className={this.state["visibility_hover_"+attributeDict.name]?"text active":"text"} style={Object.keys(eyeStyle).length>0?{display:"none"}:{}}>
              {eyeIsChecked?
                "Hide attribute in the collation"
                : "Show attribute in the collation"
              }
            </div>
          </div>
      }
      // Generate dropdown or text box depending on the current attribute 
      let input = sideAttributes[attributeDict.name];
      if (!this.props.isReadOnly) {
        if (attributeDict.options!==undefined) {
          // Drop down menu
          let menuItems = [];
          for (var j in attributeDict.options) {
            let option = attributeDict.options[j];
            menuItems.push(<MenuItem key={attributeDict.name+option+this.props.sideIndex} value={option} primaryText={option} />);
          }
          if (sideAttributes[attributeDict.name]===null) {
            menuItems.push(<MenuItem key={attributeDict.name+this.props.sideIndex+"keep"} value={"keep"} primaryText={"Keep same"} />);
          }
          let value = "keep";
          if (this.state[attributeDict.name]!=="" && this.state.isBatch) {
            value = this.state[attributeDict.name];
          } else if (sideAttributes[attributeDict.name]!==null) {
            value = sideAttributes[attributeDict.name];
          }
          input = (<SelectField
                  value={value}
                  onChange={(e, i, v)=>this.dropDownChange(e,i,v,attributeDict.name)}
                  fullWidth={true}
                  disabled={this.state.isBatch && !this.state["batch_"+attributeDict.name]}
                  >
                  {menuItems}
                </SelectField>
                );
        } else {
          // Text box
          let textboxButtons = ""; 
          if (!this.state.isBatch && this.state["editing_"+attributeDict.name]) {
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
          } else if (sideAttributes[attributeDict.name]) {
            value = sideAttributes[attributeDict.name];
          }
          input = (<div>
            <form onSubmit={(e)=>this.textSubmit(e,attributeDict.name)}>
              <TextField
                name={attributeDict.name}
                fullWidth={true}
                value={value}
                onChange={(e,v)=>this.onTextboxChange(v,attributeDict.name)}
                disabled={this.state.isBatch && !this.state["batch_"+attributeDict.name]}
              />
              {textboxButtons}
            </form>
          </div>)
        }
      } else {
        // We're in readOnly mode with no common attribute value
        if (!input && this.props.selectedSides.length>1) {
          input = <div style={{color:"gray", fontStyle: "italic", fontSize: "0.9em", padding:"15px 0px"}}>Different values</div>;
        } else {
          input = <div style={{padding:"15px 0px"}}>{input}</div>
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
    }
    const notes = this.renderNotes();
    let notesDiv = [];
    if (!(this.props.isReadOnly && notes.length===0)) {
      notesDiv.push(
        <div key={"notesHeadingSide"+this.props.sideIndex} style={{paddingTop:5}}>
          {this.props.isReadOnly?"":
          <AddNote 
            commonNotes={this.props.commonNotes}
            Notes={this.props.Notes}
            action={{
              linkNote: (noteID)=>this.props.action.linkNote(noteID, this.props.sideIndex), 
              createAndAttachNote: this.props.action.createAndAttachNote
            }}
            noteTypes={this.props.noteTypes}
          />}
          <h3>{Object.keys(this.props.selectedSides).length>1?"Notes in common" : "Notes"}</h3>
          <div className="notesInfobox">
            {notes}
          </div>
        </div>
      );
    }

    let submitBtn = "";
    if (this.state.isBatch && this.hasActiveAttributes()) {
      submitBtn = <RaisedButton 
                    primary fullWidth 
                    onTouchTap={this.batchSubmit} 
                    label="Submit" 
                  />
    }

    let imageModalContent;
    let imageThumbnail = [];
    if (this.props.viewMode!=="VIEWING") {
      // Show the side image if available
      if (this.props.selectedSides.length===1){
        const side = this.props.Sides[this.props.selectedSides[0]];
        // replace imageModalContent view OSD component
        const rectoURL = side.memberType==="Recto" ? side.image.url : null;
        const versoURL = side.memberType==="Verso" ? side.image.url : null;
        imageModalContent = (<ImageViewer rectoURL={rectoURL} versoURL={versoURL} />);
        if (side.image.url){
          imageThumbnail.push(
            <div key="sideImage" style={{paddingTop: 5, textAlign: "center"}}>
              <img 
                alt={side.folio_number}
                src={side.image.url+"/full/80,/0/default.jpg"} 
                onClick={()=>this.toggleImageModal(true)}
                style={{cursor: "pointer"}}
              /> 
            </div>
          )
        }
      }
    }

    return (
      <div className="inner">
          {attributeDivs}
          <div style={{paddingTop:10}}>
            {imageThumbnail}
          </div>
          {notesDiv}
          {submitBtn}
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
        <Dialog
          modal={false}
          open={this.state.imageModalOpen}
          onRequestClose={()=>this.toggleImageModal(false)}
          contentStyle={{background: "none", boxShadow: "inherit"}}
          bodyStyle={{padding:0}}
        >
          {imageModalContent}
        </Dialog>
      </div>
    );
  }
}
