import React from 'react';
import AddLeafDialog from '../infoBox/dialog/AddLeafDialog';
import DeleteConfirmationDialog from '../infoBox/dialog/DeleteConfirmationDialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import {getLeafsOfGroup} from '../../helpers/getLeafsOfGroup';
import Chip from 'material-ui/Chip';
import AddNote from './dialog/AddNote';
import NoteDialog from './dialog/NoteDialog';
import ImageViewer from "../global/ImageViewer";
import Dialog from 'material-ui/Dialog';

export default class LeafInfoBox extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      imageModalOpen: false,
      activeNote: null,
      isBatch: this.props.selectedLeaves.length>1,
      ...this.emptyAttributeState(),
      ...this.batchAttributeToggleState(),
      ...this.visibilityHoverState(),
    }
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
  batchAttributeToggleState = () => {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state["batch_" + this.props.defaultAttributes[i]["name"]]=false;
    }
    return state;
  }

  // Creates a dictionary of attributes with no values
  emptyAttributeState = () => {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      if (this.props.defaultAttributes[i]["name"]==="attached_to") {
        state[this.props.defaultAttributes[i]["name"]]=[];
      } else {
        state[this.props.defaultAttributes[i]["name"]]="";
      }
    }
    return state;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isBatch: nextProps.selectedLeaves.length>1,
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

  dropDownChange = (event, index, value, attributeName) => {
    if (this.props.selectedLeaves.length===1) {
      // In single edit - we submit change immediately
      let attributes = {};
      attributes[attributeName] = value;
      let leaf = {
          ...attributes,
      };
      this.props.action.updateLeaf(this.props.selectedLeaves[0], leaf);
    } else {
      // In batch edit - save change of attribute to the state
      let updatedAttribute = {};
      updatedAttribute[attributeName] = value;
      this.setState(updatedAttribute); 
    }
  }

  onConjoinChange = (event, index, leaf, newID) => {
    let request = {conjoined_to: newID };
    this.props.action.updateLeaf(leaf.id, request);
  }

  onAttachedToChange = (event, activeLeaf, location, id, method) => {
    let request = {attached_to: activeLeaf.attached_to};
    if (method==="None") {
      request.attached_to[location+"ID"]="";
      request.attached_to[location+"Method"]="";
    } else {
      request.attached_to[location+"ID"]=id;
      request.attached_to[location+"Method"]=method;
    }
    this.props.action.updateLeaf(activeLeaf.id, request);
  }

  batchSubmit = () => {
    let attributes = {};
    for (var i in this.props.defaultAttributes) {
      let attrName = this.props.defaultAttributes[i]["name"];
      let attrValue = this.state[this.props.defaultAttributes[i]["name"]];
      if (attrValue !== "" && attrValue !== "keep") {
        attributes[attrName] = attrValue;
      }
    }
    let leafs = [];
    for (var key of this.props.selectedLeaves) {
      const leaf = this.props.Leafs[key];
      leafs.push({id: leaf.id, attributes});
    }
    this.props.action.updateLeafs(leafs);
    // Reset states
    this.setState({...this.batchAttributeToggleState()});
  }

  // Returns dictionary of attribute names and values
  // If multiple selected leaves have conflicting values,
  // the value of that attribute will be set to null
  getAttributeValues() {
    let leafAttributes = {};
    for (var i in this.props.defaultAttributes) {
      let attributeName = this.props.defaultAttributes[i]['name'];
      for (var key of this.props.selectedLeaves) {
        const leaf = this.props.Leafs[key];
        if (leafAttributes[attributeName]===undefined) {
          leafAttributes[attributeName] = leaf[attributeName];
        } else if (leafAttributes[attributeName]!==leaf[attributeName]) {
          leafAttributes[attributeName] = null;
          break;
        }
      }
    }
    return leafAttributes;
  }

  // Handle checkbox toggling by updating relevant attribute state
  toggleCheckbox = (target, value) => {
    let newToggleState = {};
    newToggleState["batch_"+target]=value;
    this.setState(newToggleState);
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
    this.setState({activeNote:null});
  }

  toggleImageModal = (imageModalOpen) => {  
    this.setState({imageModalOpen})
  }

  render() {
    let leafAttributes = this.getAttributeValues();
    let attributeDivs = [];
    const activeLeaf = this.props.Leafs[this.props.selectedLeaves[0]];
    const parentGroup = this.props.Groups[activeLeaf.parentID];
    const leafMembersOfCurrentGroup = getLeafsOfGroup(parentGroup, this.props.Leafs);
    const isFirstLeaf = activeLeaf.memberOrder===1;
    const isLastLeaf = activeLeaf.id===leafMembersOfCurrentGroup[leafMembersOfCurrentGroup.length-1].id;
    const hasOnlyActiveLeaf = leafMembersOfCurrentGroup.length===2; // 2 because there's none leaf

    // Generate drop down for each leaf attribute
    this.props.defaultAttributes.forEach((attributeDict)=> {
      if (attributeDict.name.includes("attached_to")) {
        if (hasOnlyActiveLeaf || (isFirstLeaf && attributeDict.name.includes("above")) || (isLastLeaf && attributeDict.name.includes("below"))) {
              return;
            }
      }
      let label = <div style={{padding:"10px 0px", color:"rgb(78, 78, 78)"}}>{attributeDict.displayName}</div>;
      // Generate eye toggle checkbox
      let eyeCheckbox = "";
      if (this.props.viewMode==="TABULAR" && this.state.isBatch) {

        eyeCheckbox = 
        <div className="tooltip eyeToggle">
          <Checkbox
            checkedIcon={<Visibility  />}
            uncheckedIcon={<VisibilityOff />}
            onCheck={(event,value)=>this.props.action.toggleVisibility("leaf", attributeDict.name, !this.props.visibleAttributes[attributeDict.name])}
            style={{display:"inline-block",width:"25px"}}
            iconStyle={{marginRight:"10px"}}
            checked={this.props.visibleAttributes[attributeDict.name]}
            onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
            onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
          />
          <div className={this.state["visibility_hover_"+attributeDict.name]===true?"text active":"text"}>
            {this.props.visibleAttributes[attributeDict.name]?
              "Hide attribute in the collation"
              : "Show attribute in the collation"
            }
          </div>
        </div>
      } else if (this.props.viewMode==="TABULAR") {
        // In single edit tabular mode - display eye icon with label
        label = 
        <div className="tooltip eyeToggle">
          <Checkbox
            key={"single_"+attributeDict.displayName}
            label={attributeDict.displayName} 
            checkedIcon={<Visibility />}
            uncheckedIcon={<VisibilityOff />}
            onCheck={(event,value)=>this.props.action.toggleVisibility("leaf", attributeDict.name, !this.props.visibleAttributes[attributeDict.name])}
            style={{display:"inline-block",width:"25px"}}
            checked={this.props.visibleAttributes[attributeDict.name]}
            iconStyle={{marginRight:"10px", color:"gray"}}
            onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
            onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
          />
          <div className={this.state["visibility_hover_"+attributeDict.name]===true?"text active":"text"}>
            {this.props.visibleAttributes[attributeDict.name]?
              "Hide attribute in the collation"
              : "Show attribute in the collation"
            }
          </div>
        </div>
      }
      if (this.state.isBatch && !this.props.isReadOnly) {
        // In batch edit for either edit modes
        label = <Checkbox
                  key={"batch_"+attributeDict.displayName}
                  label={attributeDict.displayName} 
                  onCheck={(event,value)=>this.toggleCheckbox(attributeDict.name,value)}
                  labelStyle={!this.state["batch_"+attributeDict.name]?{color:"gray"}:{}}
                  checked={this.state["batch_"+attributeDict.name]}
                  style={{display:"inline-block",width:"25px"}}
                  iconStyle={{marginRight:"10px"}}
                   disabled={(attributeDict.name==="conjoined_leaf_order"||attributeDict.name.includes("attached_to"))}
                />;
      }
      let input = leafAttributes[attributeDict.name];
      if (!this.props.isReadOnly) {
        if (attributeDict.name==="conjoined_leaf_order") {
          let menuItems = [];
          leafMembersOfCurrentGroup.forEach((member)=> {
            menuItems.push(
              <MenuItem 
                disabled={activeLeaf.order === member.order}
                key={member.id} 
                value={member.id} 
                primaryText={member.order} 
              />);
          });
          input = 
            <SelectField
              value={activeLeaf.conjoined_to}
              onChange={(e, i, v)=>this.onConjoinChange(e,i,activeLeaf,v)}
              fullWidth={true}
              disabled={this.state.isBatch}
            >
              {menuItems}
            </SelectField>
        } else {
          // Populate drop down items
          let menuItems = [];
          attributeDict.options.forEach((option, index)=> {
            menuItems.push(<MenuItem key={attributeDict.name+option} value={option} primaryText={option} />);
          });
          if (leafAttributes[attributeDict.name]===null) {
            menuItems.push(<MenuItem key={attributeDict.name+"keep"} value={"keep"} primaryText={"Keep same"} />);
          }
          let value = "keep";
          if (this.state[attributeDict.name]!=="" && this.state.isBatch) {
            value = this.state[attributeDict.name];
          } else if (leafAttributes[attributeDict.name]!==null) {
            value = leafAttributes[attributeDict.name];
          }
          input = 
            <SelectField
              value={value}
              onChange={(e, i, v)=>this.dropDownChange(e,i,v,attributeDict.name)}
              fullWidth={true}
              disabled={this.state.isBatch && !this.state["batch_"+attributeDict.name]}
            >
              {menuItems}
            </SelectField>
        }
      } else if (!input && this.props.selectedLeaves.length>1) {
        // We're in readOnly mode with no common attribute value
        input = <div style={{color:"gray", fontStyle: "italic", fontSize: "0.9em"}}>Different values</div>;
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
    if (this.state.isBatch && this.hasActiveAttributes()) {
      submitBtn = <RaisedButton 
                    primary fullWidth 
                    onTouchTap={this.batchSubmit} 
                    label="Submit changes" 
                    style={{marginBottom:10}}
                  />
    }
    let addBtn = "";
    if (!this.state.isBatch) {
      addBtn = <AddLeafDialog
                action={{addLeafs: this.props.action.addLeafs}}
                Leafs={this.props.Leafs}
                selectedLeaves={this.props.selectedLeaves}
                projectID={this.props.projectID}
               />
    }
    let deleteBtn = (
      <DeleteConfirmationDialog
        fullWidth={this.state.isBatch}
        action={{singleDelete: this.props.action.deleteLeaf, batchDelete: this.props.action.deleteLeafs}}
        selectedObjects={this.props.selectedLeaves}
        memberType="Leaf"
        Leafs={this.props.Leafs}
        Groups={this.props.Groups}
      />
    ); 

    let conjoinButton = (
      <RaisedButton 
        primary fullWidth 
        onTouchTap={this.props.conjoinLeafs} 
        label="Conjoin Selected Leaves"
        style={{marginBottom:10}}
      />
    );
    if (this.props.selectedLeaves.length<2){
      conjoinButton = "";
    } else {
      let parentIDs = this.props.selectedLeaves.map((leafID)=>{return this.props.Leafs[leafID].parentID})
      let parentIDsSet = new Set(parentIDs);
      if (parentIDsSet.size!==1)
        conjoinButton = "";
    }

    let imageModalContent;
    let imageThumbnails = [];
    if (this.props.viewMode!=="VIEWING") {
      // Show the side image if available
      if (this.props.selectedLeaves.length===1) {
        const leaf = this.props.Leafs[this.props.selectedLeaves[0]]
        const recto = this.props.Rectos[leaf.rectoID];
        const verso = this.props.Versos[leaf.versoID];
        // replace imageModalContent view OSD component
        const rectoURL = recto.image ? recto.image.url : null;
        const versoURL = verso.image ? verso.image.url : null;
        imageModalContent = (<ImageViewer rectoURL={rectoURL} versoURL={versoURL} />);
        if (rectoURL) {
          imageThumbnails.push(
            <div key="rectoThumbnail" style={{display: "inline-block"}}>
              <img 
                alt={recto.folio_number}
                src={rectoURL+"/full/80,/0/default.jpg"} 
                onClick={()=>this.toggleImageModal(true)}
                style={{cursor: "pointer"}}
              />
              <br />
              {recto.folio_number}
            </div>
          )
        }
        if (versoURL) {
          imageThumbnails.push(
            <div key="versoThumbnail" style={{paddingLeft: 5, display: "inline-block"}}>
              <img 
                alt={verso.folio_number}
                src={versoURL+"/full/80,/0/default.jpg"} 
                onClick={()=>this.toggleImageModal(true)}
                style={{cursor: "pointer"}}
              />
              <br />
              {verso.folio_number}
            </div>
          )
        }
      }
    }

    const notes = this.renderNotes();
    return (
      <div className="inner">
        {attributeDivs}
        <div style={{clear:"both", textAlign:"center", paddingTop: 10}}>
          {imageThumbnails}
        </div>
        {this.props.isReadOnly&&notes.length===0?"":
          <div style={{marginBottom:15}}>
            {this.props.isReadOnly?"":
            <AddNote 
              commonNotes={this.props.commonNotes}
              Notes={this.props.Notes}
              action={{
                linkNote: this.props.action.linkNote, 
                createAndAttachNote: this.props.action.createAndAttachNote
              }}
              noteTypes={this.props.noteTypes}
            />}
              <div>
                <h3 key="notesHeading">
                  {Object.keys(this.props.selectedLeaves).length>1?"Notes in common" : "Notes"}
                </h3>
                <div className="notesInfobox">
                  {notes}
                </div>
              </div>
            </div>
          }
          {submitBtn}
          
          {this.props.isReadOnly?"":
            <div>
              <h3>Actions</h3>
              {conjoinButton}
              {addBtn}
              {deleteBtn}
            </div>
          }
          
          <NoteDialog
            open={this.state.activeNote!==null}
            commonNotes={this.props.commonNotes}
            activeNote={this.state.activeNote ? this.state.activeNote : {id: null}}
            closeNoteDialog={this.closeNoteDialog}
            action={{
              updateNote: this.props.action.updateNote, 
              linkNote: this.props.action.linkDialogNote, 
              unlinkNote: this.props.action.unlinkDialogNote,
              linkAndUnlinkNotes: this.props.action.linkAndUnlinkNotes,
              deleteNote: this.props.action.deleteNote,
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
