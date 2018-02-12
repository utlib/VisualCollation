import React from 'react';
import AddLeafDialog from '../infoBox/dialog/AddLeafDialog';
import DeleteConfirmationDialog from '../infoBox/dialog/DeleteConfirmationDialog';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import {getLeafsOfGroup} from '../../helpers/getLeafsOfGroup';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import AddNote from './dialog/AddNote';
import ImageViewer from "../global/ImageViewer";
import SelectField from '../global/SelectField';
import { getMemberOrder } from '../../helpers/getMemberOrder';
import { checkboxStyle } from '../../styles/checkbox';
import { btnBase } from '../../styles/button';
import FolioNumberDialog from '../infoBox/dialog/FolioNumberDialog';

export default class LeafInfoBox extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      imageModalOpen: false,
      folioModalOpen: false,
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
      state[this.props.defaultAttributes[i]["name"]]="";
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
  dropDownChange = (value, attributeName) => {
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

  onConjoinChange = (leaf, newID) => {
    if (newID==="None") newID = null;
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
  toggleCheckbox = (target) => {
    let newToggleState = {};
    newToggleState["batch_"+target]= !this.state["batch_"+target];
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
          onClick={()=>this.props.openNoteDialog(note)}
          tabIndex={this.props.tabIndex}
          labelStyle={{fontSize:this.props.windowWidth<=1024?12:null}}
        >
          {note.title}
        </Chip>);
    }
    return chips;
  }

  closeNoteDialog = () => {
    this.setState({activeNote:null});
    this.props.togglePopUp(false);
  }

  toggleImageModal = (imageModalOpen) => {  
    this.setState({imageModalOpen})
    this.props.togglePopUp(imageModalOpen);
  }
  toggleFolioModal = (folioModalOpen) => {  
    this.setState({folioModalOpen})
    this.props.togglePopUp(folioModalOpen);
  }
  clickVisibility = (attributeName, value) => {
    this.props.action.updatePreferences({leaf:{...this.props.preferences.leaf, [attributeName]:value}});
  }
  render() {
    let leafAttributes = this.getAttributeValues();
    let attributeDivs = [];
    const activeLeaf = this.props.Leafs[this.props.selectedLeaves[0]];
    const activeLeafOrder = this.props.leafIDs.indexOf(activeLeaf.id)+1;
    const parentGroup = this.props.Groups[activeLeaf.parentID];
    const leafMembersOfCurrentGroup = getLeafsOfGroup(parentGroup, this.props.Leafs);
    const isFirstLeaf = getMemberOrder(activeLeaf, this.props.Groups, this.props.groupIDs)===1;
    const isLastLeaf = activeLeaf.id===leafMembersOfCurrentGroup[leafMembersOfCurrentGroup.length-1].id;
    const hasOnlyActiveLeaf = leafMembersOfCurrentGroup.length===2; // 2 because there's none leaf
    // Generate drop down for each leaf attribute
    this.props.defaultAttributes.forEach((attributeDict)=> {
      if (attributeDict.name.includes("attached")) {
        if (hasOnlyActiveLeaf || (isFirstLeaf && attributeDict.name.includes("above")) || (isLastLeaf && attributeDict.name.includes("below"))) {
          return;
        }
      }
      let fontSize = null;
      if (this.props.windowWidth<=768) {
        fontSize = "12px";
      } else if (this.props.windowWidth<=1024 && this.state.isBatch) {
        fontSize = "13px";
      } else if (this.props.windowWidth<=1024) {
        fontSize = "14px";
      }
      let label = <div style={{padding:"10px 0px", color:"rgb(78, 78, 78)", fontSize}}>{attributeDict.displayName}</div>;
      // Generate eye toggle checkbox
      let eyeCheckbox = "";
      let eyeIsChecked = this.props.preferences.leaf && this.props.preferences.leaf[attributeDict.name]?this.props.preferences.leaf[attributeDict.name]:false;

      if (this.props.viewMode==="TABULAR" && this.state.isBatch) {
        eyeCheckbox = 
        <div className="tooltip eyeToggle">
          <Checkbox
            aria-label={eyeIsChecked?"Hide '" + attributeDict.displayName + "' attribute in collation":"Show '" + attributeDict.displayName + "' attribute in collation"}
            checkedIcon={<Visibility  />}
            uncheckedIcon={<VisibilityOff />}
            onClick={()=>this.clickVisibility(attributeDict.name, !eyeIsChecked)}
            style={this.props.windowWidth<=1024?{display:"none"}:{display:"inline-block",width:"25px"}}
            iconStyle={{...checkboxStyle().iconStyle}}
            checked={eyeIsChecked}
            onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
            onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
            tabIndex={this.props.tabIndex}
          />
          <div className={this.state["visibility_hover_"+attributeDict.name]===true?"text active":"text"}>
            {this.props.preferences[attributeDict.name]?
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
            aria-label={eyeIsChecked?"Hide '" + attributeDict.displayName + "' attribute in collation":"Show '" + attributeDict.displayName + "' attribute in collation"}
            key={"single_"+attributeDict.displayName}
            label={attributeDict.displayName} 
            checkedIcon={<Visibility />}
            uncheckedIcon={<VisibilityOff />}
            onClick={()=>this.clickVisibility(attributeDict.name, !eyeIsChecked)}
            style={{display:"inline-block",width:"25px"}}
            checked={eyeIsChecked}
            iconStyle={{...checkboxStyle().iconStyle,color:"gray"}}
            labelStyle={{...checkboxStyle().labelStyle}}
            onMouseEnter={()=>{this.setState({["visibility_hover_"+attributeDict.name]:true})}}
            onMouseOut={()=>{this.setState({["visibility_hover_"+attributeDict.name]:false})}}
            tabIndex={this.props.tabIndex}
          />
          <div className={this.state["visibility_hover_"+attributeDict.name]===true?"text active":"text"}>
            {eyeIsChecked?
              "Hide attribute in the collation"
              : "Show attribute in the collation"
            }
          </div>
        </div>
      }
      if (this.state.isBatch && !this.props.isReadOnly) {
        // In batch edit for either edit modes
        label = <Checkbox
                  aria-label={"Select '" + attributeDict.displayName + "' to batch edit"}
                  key={"batch_"+attributeDict.displayName}
                  label={attributeDict.displayName} 
                  onClick={()=>this.toggleCheckbox(attributeDict.name)}
                  labelStyle={!this.state["batch_"+attributeDict.name]?{color:"gray"}:{}}
                  checked={this.state["batch_"+attributeDict.name]}
                  style={{display:"inline-block",width:"25px"}}
                  disabled={(attributeDict.name==="conjoined_to"||attributeDict.name.includes("attached"))}
                  tabIndex={this.props.tabIndex}
                  {...checkboxStyle()}
                />;
      }
      let input = leafAttributes[attributeDict.name];
      if (!this.props.isReadOnly) {
        if (attributeDict.name ==="conjoined_to") {
          let menuItems = [];
          let value=this.state.isBatch?"":"None";
          leafMembersOfCurrentGroup.forEach((member)=> {
            if (activeLeafOrder!==this.props.leafIDs.indexOf(member.id)+1) {
              menuItems.push({
                value: member.id,
                text: this.props.leafIDs.indexOf(member.id) > -1 ? (this.props.leafIDs.indexOf(member.id)+1).toString() : "None",
              });
            }
            if (member.id === leafAttributes["conjoined_to"]) {
              value = member.id;
            }
          });
          input = 
            <SelectField
              id={"LIB_"+attributeDict.name}
              label={attributeDict.displayName + " attribute dropdown" }
              onChange={(v)=>this.onConjoinChange(activeLeaf,v)}
              disabled={this.state.isBatch}
              tabIndex={this.props.tabIndex}
              data={menuItems}
              value={value}
            >
            </SelectField>
        } else {
          // Populate drop down items
          let menuItems = [];
          attributeDict.options.forEach((option, index)=> {
            menuItems.push({value:option, text:option});
          });
          if (leafAttributes[attributeDict.name]===null) {
            menuItems.push({value:"keep", text:"Keep same"});
          }
          let value = "keep";
          if (this.state[attributeDict.name]!=="" && this.state.isBatch) {
            value = this.state[attributeDict.name];
          } else if (leafAttributes[attributeDict.name]!==null) {
            value = leafAttributes[attributeDict.name];
          }
          input = 
            <SelectField
              id={"LIB_"+attributeDict.name}
              label={attributeDict.displayName + " attribute dropdown" }
              value={value}
              onChange={(v)=>this.dropDownChange(v,attributeDict.name)}
              disabled={this.state.isBatch && !this.state["batch_"+attributeDict.name]}
              tabIndex={this.props.tabIndex}
              data={menuItems}
            >
            </SelectField>
        }
      } else if (!input && this.props.selectedLeaves.length>1) {
        // We're in readOnly mode with no common attribute value
        input = <div style={{color:"gray", fontStyle: "italic", fontSize: this.props.windowWidth<=768?"0.7em":"0.9em"}}>Different values</div>;
      } else if (attributeDict.name==="conjoined_to") {
        if (leafAttributes[attributeDict.name]) {
          input = this.props.leafIDs.indexOf(this.props.Leafs[leafAttributes[attributeDict.name]].id) + 1;
        } else {
          input = "None";
        }
      }
      attributeDivs.push(
        <div className="row" key={attributeDict.name}>
          <div className="label">
            {eyeCheckbox}
            {label}
          </div>
          <div className="input" style={{fontSize:this.props.windowWidth<=768?"0.7em":null}}>
            {input}
          </div>
        </div>
      );
    });
    let submitBtn = "";
    if (this.state.isBatch && this.hasActiveAttributes()) {
      submitBtn = <RaisedButton 
                    primary fullWidth 
                    onClick={this.batchSubmit} 
                    label="Submit changes" 
                    style={{marginBottom:10}}
                    tabIndex={this.props.tabIndex}
                  />
    }
    let addBtn = "";
    if (!this.state.isBatch) {
      addBtn = <AddLeafDialog
                action={{addLeafs: this.props.action.addLeafs}}
                Leafs={this.props.Leafs}
                leafIDs={this.props.leafIDs}
                Groups={this.props.Groups}
                groupIDs={this.props.groupIDs}
                selectedLeaves={this.props.selectedLeaves}
                projectID={this.props.projectID}
                togglePopUp={this.props.togglePopUp}
                tabIndex={this.props.tabIndex}
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
        groupIDs={this.props.groupIDs}
        leafIDs={this.props.leafIDs}
        togglePopUp={this.props.togglePopUp}
        tabIndex={this.props.tabIndex}
      />
    ); 

    let conjoinButton = (
      <RaisedButton 
        primary 
        onClick={this.props.autoConjoinLeafs} 
        label="Conjoin Leaves"
        {...btnBase()}
        style={{...btnBase().style,marginBottom:10,width:"100%"}}
        tabIndex={this.props.tabIndex} 
      />
    ); 
    let generateFolioButton = this.state.isBatch? (
      <RaisedButton 
        primary 
        onClick={()=>this.toggleFolioModal(true)} 
        label="Generate folio numbers"
        {...btnBase()}
        style={{...btnBase().style,marginBottom:10,width:"100%"}}
        tabIndex={this.props.tabIndex} 
      />) : "";

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
        const isRectoDIY = recto.image.manifestID? recto.image.manifestID.includes("DIY") : false;
        const isVersoDIY = verso.image.manifestID? verso.image.manifestID.includes("DIY") : false;
        imageModalContent = (<ImageViewer 
          isRectoDIY={isRectoDIY} 
          isVersoDIY={isVersoDIY} 
          rectoURL={rectoURL} 
          versoURL={versoURL} 
        />);
        if (rectoURL) {
          imageThumbnails.push(
            <button 
              className="image"
              aria-label="Recto image" 
              key="rectoThumbnail" 
              style={{display: "inline-block"}} 
              onClick={()=>this.toggleImageModal(true)}
              tabIndex={this.props.tabIndex}
            >
              <img 
                alt={recto.folio_number}
                src={isRectoDIY? rectoURL : rectoURL+"/full/80,/0/default.jpg"} 
                style={{cursor: "pointer"}}
                width={80}
              />
              <br />
              {recto.folio_number}
            </button>
          )
        }
        if (versoURL) {
          imageThumbnails.push(
            <button 
              className="image"
              aria-label="Verso image" 
              key="versoThumbnail" 
              style={{paddingLeft: 5, display: "inline-block"}}
              onClick={()=>this.toggleImageModal(true)}
              tabIndex={this.props.tabIndex}
            >
              <img 
                alt={verso.folio_number}
                src={isVersoDIY? versoURL : versoURL+"/full/80,/0/default.jpg"} 
                style={{cursor: "pointer"}}
                width={80}
              />
              <br />
              {verso.folio_number}
            </button>
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
              togglePopUp={this.props.togglePopUp}
              tabIndex={this.props.tabIndex}
              groupIDs={this.props.groupIDs}
              leafIDs={this.props.leafIDs}
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
              {generateFolioButton}
              {addBtn}
              {deleteBtn}
            </div>
          }

          <Dialog
            modal={false}
            open={this.state.imageModalOpen}
            onRequestClose={()=>this.toggleImageModal(false)}
            contentStyle={{background: "none", boxShadow: "inherit"}}
            bodyStyle={{padding:0}}
          >
            {imageModalContent}
          </Dialog>
          <FolioNumberDialog
            defaultFolioNumber={this.props.leafIDs.indexOf(this.props.selectedLeaves[0])+1}
            folioModalOpen={this.state.folioModalOpen}
            toggleFolioModal={this.toggleFolioModal}
            action={{generateFolioNumbers: this.props.action.generateFolioNumbers}}
          />
      </div>
    );
  }
}
