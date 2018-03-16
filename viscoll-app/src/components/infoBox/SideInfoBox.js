import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import AddNote from './dialog/AddNote';
import Dialog from 'material-ui/Dialog';
import ImageViewer from "../global/ImageViewer";
import SelectField from '../global/SelectField';
import { checkboxStyle } from '../../styles/checkbox';
import { renderNoteChip } from '../../helpers/renderHelper';

/** Side infobox */
export default class SideInfoBox extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
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

  /**
   *  Creates a dictionary of attributes and if its toggled on or off during batch edit
   *  This is used for the checkbox states
   */
  otherAttributeStates = () => {
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
  emptyAttributeState = () => {
    let state = {};
    for (var i in this.props.defaultAttributes) {
      state[this.props.defaultAttributes[i]["name"]]=null;
    }
    return state;
  }

  hasActiveAttributes = () => {
    for (var i in this.props.defaultAttributes) {
      if ((this.props.defaultAttributes[i]["name"]==="folio_number"||this.props.defaultAttributes[i]["name"]==="page_number") &&
          this.state["batch_" + this.props.defaultAttributes[i]["name"]] &&
          this.state[this.props.defaultAttributes[i]["name"]]!=="Keep same") {
          return true;
      }
      else if (this.state["batch_" + this.props.defaultAttributes[i]["name"]] && 
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
  }

  dropDownChange = (value, attributeName) => {
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

  /**
   * Handle checkbox toggling by updating relevant attribute state
   */
  toggleCheckbox = (target) => {
    let newToggleState = {};
    newToggleState["batch_"+target]=!this.state["batch_"+target];
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
    if (Object.keys(attributes).length>0) {
      for (let id of this.props.selectedSides){
        if (Object.keys(attributes).length>0) {
          sides.push({id, attributes});
        }
      }
      this.props.action.updateSides(sides);
    }
    this.setState({...this.otherAttributeStates()})
    
  }

  getAttributeValues = (selectedSides=this.props.selectedSides) => {
    let sideAttributes = {};
    for (var i in this.props.defaultAttributes) {
      let attributeName = this.props.defaultAttributes[i]['name'];
      for (let sideID of selectedSides) {
        const side = this.props.Sides[sideID];
        if (sideAttributes[attributeName]===undefined) {
          sideAttributes[attributeName] = side[attributeName];
        } else if (sideAttributes[attributeName]!==side[attributeName]) {
          sideAttributes[attributeName] = null;
          break;
        }
      }
    }
    for (let sideID of selectedSides) {
      const side = this.props.Sides[sideID];
      if (sideAttributes["generated_folio_number"]===undefined) {
        sideAttributes["generated_folio_number"]=side.generated_folio_number;
      } else {
        sideAttributes["generated_folio_number"]=null;
      }
    }
    return sideAttributes;
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
    this.setState({activeNote:null});
  }

  toggleImageModal = (imageModalOpen) => {  
    this.setState({imageModalOpen})
  }

  clickVisibility = (attributeName, value) => {
    if (attributeName!=="script_direction") {
      this.props.action.updatePreferences({side:{...this.props.preferences.side, [attributeName]:value}});
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
      let eyeIsChecked = this.props.preferences.side && this.props.preferences.side[attributeDict.name]?this.props.preferences.side[attributeDict.name]:false;
      if (this.props.viewMode!=="TABULAR") {
        if (attributeDict.name==="script_direction") {
          eyeStyle = {fill: "#C2C2C2", cursor:"not-allowed"};
          eyeIsChecked = false;
        }
      }
      if (this.state.isBatch && !this.props.isReadOnly) {
        eyeCheckbox = 
          <div className="tooltip eyeToggle">
            <Checkbox
              aria-label={eyeIsChecked?"Hide '" + attributeDict.displayName + "' attribute in collation":"Show '" + attributeDict.displayName + "' attribute in collation"}
              checkedIcon={<Visibility />}
              uncheckedIcon={<VisibilityOff />}
              onClick={()=>this.clickVisibility(attributeDict.name, !eyeIsChecked)}
              style={this.props.windowWidth<=1024?{display:"none"}:{display:"inline-block",width:"25px",...eyeStyle}}
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
          labelStyle={!this.state["batch_"+attributeDict.name]?{color:"gray",...checkboxStyle().labelStyle}:{...checkboxStyle().labelStyle}}
          iconStyle={{...checkboxStyle().iconStyle}}
          checked={this.state["batch_"+attributeDict.name]}
          style={{display:"inline-block",width:"25px"}}
          disabled={this.state.isBatch && attributeDict.name==="uri"}
          tabIndex={this.props.tabIndex}
        />;
      } else {
        // In single edit, display eye icon with label (no checkbox)
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
      let input = sideAttributes[attributeDict.name];
      if (!this.props.isReadOnly) {
        if (attributeDict.options!==undefined) {
          // Drop down menu
          let menuItems = [];
          for (var j in attributeDict.options) {
            let option = attributeDict.options[j];
            menuItems.push({value:option, text:option});
          }
          if (sideAttributes[attributeDict.name]===null) {
            menuItems.push({value:"keep", text:"Keep same"});
          }
          let value = this.state.isBatch?"keep":"";
          if (this.state[attributeDict.name]!==null && this.state.isBatch) {
            value = this.state[attributeDict.name];
          } else if (sideAttributes[attributeDict.name]!==null) {
            value = sideAttributes[attributeDict.name];
          }
          input = (<SelectField
                  id={"SIB_" + attributeDict.name}
                  label={attributeDict.displayName + " attribute dropdown" }
                  value={value}
                  onChange={(v)=>this.dropDownChange(v,attributeDict.name)}
                  disabled={this.state.isBatch && !this.state["batch_"+attributeDict.name]}
                  tabIndex={this.props.tabIndex}
                  data={menuItems}
                  >
                </SelectField>
                );
        } else {
          // Text box
          let textboxButtons = ""; 
          if (!this.state.isBatch && this.state["editing_"+attributeDict.name]) {
            textboxButtons = (
              <div>
                <RaisedButton
                  aria-label="Submit"
                  primary
                  icon={<IconSubmit />}
                  style={{minWidth:this.props.windowWidth<=1024?"35px":"60px",marginLeft:"5px"}}
                  onClick={(e)=>this.textSubmit(e,attributeDict.name)}
                  tabIndex={this.props.tabIndex}
                />
                <RaisedButton
                  aria-label="Cancel"
                  secondary
                  icon={<IconClear />}
                  style={{minWidth:this.props.windowWidth<=1024?"35px":"60px",marginLeft:"5px"}}
                  onClick={(e)=>this.textCancel(e,attributeDict.name)}
                  tabIndex={this.props.tabIndex}
                />
              </div>
            );
          }
          let value = this.state.isBatch? "Keep same" : "";
          if (this.state["editing_"+attributeDict.name]) {
            value = this.state[attributeDict.name];
          } else if (sideAttributes[attributeDict.name]!==null) {
            value = sideAttributes[attributeDict.name];
          } else if (attributeDict.name==="folio_number" && sideAttributes["generated_folio_number"]!==null) {
            value = sideAttributes["generated_folio_number"];
          }
          input = (<div>
            <form onSubmit={(e)=>this.textSubmit(e,attributeDict.name)}>
              <TextField
                aria-label={attributeDict.displayName + " attribute textfield"}
                name={attributeDict.name}
                fullWidth={true}
                value={value}
                onChange={(e,v)=>this.onTextboxChange(v,attributeDict.name)}
                disabled={this.state.isBatch && !this.state["batch_"+attributeDict.name]}
                tabIndex={this.props.tabIndex}
                inputStyle={{fontSize:this.props.windowWidth<=768?"12px":"16px"}}
              />
              {textboxButtons}
            </form>
          </div>)
        }
      } else {
        // We're in readOnly mode with no common attribute value
        if (!input && this.props.selectedSides.length>1) {
          input = <div style={{color:"gray", fontStyle: "italic", fontSize: this.props.windowWidth<=768?"0.7em":"0.9em", padding:"15px 0px"}}>Different values</div>;
        } else {
          input = <div style={{padding:"15px 0px", fontSize:this.props.windowWidth<=768?"0.7em":null}}>{input}</div>
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
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
            groupIDs={this.props.groupIDs}
            leafIDs={this.props.leafIDs}
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
                    onClick={this.batchSubmit} 
                    label="Submit" 
                    tabIndex={this.props.tabIndex}
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
        const isRectoDIY = side.image.manifestID && side.image.manifestID.includes("DIY");
        const isVersoDIY = side.image.manifestID && side.image.manifestID.includes("DIY");
        imageModalContent = (<ImageViewer isRectoDIY={isRectoDIY} isVersoDIY={isVersoDIY} rectoURL={rectoURL} versoURL={versoURL} />);
        if (side.image.url){
          imageThumbnail.push(
            <button
              className="image"
              aria-label={side.memberType + " image"} 
              key="sideImage" 
              style={{paddingTop: 5, textAlign: "center"}}
              onClick={()=>this.toggleImageModal(true)}
              tabIndex={this.props.tabIndex}
            >
              <img 
                alt={side.folio_number}
                src={side.image.manifestID.includes("DIY")? side.image.url : side.image.url+"/full/80,/0/default.jpg"} 
                style={{cursor: "pointer"}}
                width={80}
              /> 
            </button>
          )
        }
      }
    }

    return (
      <div className="inner">
          {attributeDivs}
          <div style={{paddingTop:10, textAlign:"center"}}>
            {imageThumbnail}
          </div>
          {notesDiv}
          {submitBtn}
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
