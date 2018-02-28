import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import SelectField from '../global/SelectField';
import IconButton from 'material-ui/IconButton';
import IconHelp from 'material-ui/svg-icons/action/help';

/** New Project dialog - panel with additional options for project creation  */
const ProjectOptions = (props) => {
  return (
    <div style={{width:"60%", margin: "auto"}}>
      <h1 style={{textAlign:"center"}}>Project Options</h1>
      <h2>Generate page/folio numbers</h2>
      <div style={{display: "flex", justifyContent:"center"}}>
        <RadioButtonGroup 
          name="folioOrPage" 
          defaultSelected={props.generateFolioPageNumber} 
          onChange={(e,v)=>props.set("generateFolioPageNumber", v)}
          style={{width:240}}
        >
          <RadioButton
            aria-label="Generate folio numbers"
            value="folio_number"
            label="Generate folio numbers"
          /> 
          <RadioButton
            aria-label="Generate page numbers"
            value="page_number"
            label="Generate page numbers"
          /> 
        </RadioButtonGroup>
      </div>

      {props.generateFolioPageNumber?
        <div style={{width: "100%", margin: "auto", display: "flex", justifyContent:"center", alignItems: "center",}}>
          <label id="folioPageNumber" style={{color:"#4e4e4e", paddingRight: 20}}>
            Starting number
          </label>
          <div>
            <TextField
              aria-labelledby="folioPageNumber"
              name="startFolioPageNumber"
              value={props.startFolioPageNumber}
              onChange={(event, newValue) => {props.set("startFolioPageNumber", parseInt(newValue, 10))}}
              style={{width:50}}
              type="number"
            />
          </div>
        </div>
      :""}

      <h2>Select starting texture 
        <IconButton 
          iconStyle={{fontSize:10, width:15, height:15}} 
          tooltip="Texture of the first leaf's recto side">
            <IconHelp />
          </IconButton>
      </h2>
      <div style={{width: "100%", margin: "auto", display: "flex", justifyContent:"center", alignItems: "center",}}>
        <SelectField 
          id="selectStartingTexture"
          label="Select starting texture" 
          data={[{text:"Hair", value:"Hair"}, {text:"Flesh", value:"Flesh"}]}
          value={props.startingTexture}
          onChange={()=>{
            if (props.startingTexture==="Hair"){
              props.set("startingTexture", "Flesh")
            }else{
              props.set("startingTexture", "Hair")
            }}}
          width={250}
        />
      </div>

      <div style={{textAlign:"center",paddingTop:30}}>
        <FlatButton 
            label="Back"
            aria-label="Back"
            onClick={() => props.previousStep()}
        />
        <RaisedButton 
          label="Finish"
          aria-label="Finish"
          primary
          onClick={() => props.finish()}
        />
      </div>
    </div>
  )
}
export default ProjectOptions;