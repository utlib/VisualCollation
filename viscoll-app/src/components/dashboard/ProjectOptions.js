import React from 'react';
import {floatFieldLight} from '../../styles/textfield';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';

const ProjectOptions = (props) => {
  return (
    <div style={{width:"60%", margin: "auto"}}>
      <h1 style={{textAlign:"center"}}>Project Options</h1>
      <div style={{display: "flex", justifyContent:"center"}}>
        <Checkbox 
          label="Generate folio numbers"
          aria-label="Generate folio numbers"
          onClick={() => props.set("generateFolioNumber", !props.generateFolioNumber)}
          checked={props.generateFolioNumber}
          labelStyle={props.generateFolioNumber?{fontWeight:600}:{}}
          style={{width:230}}
        /> 
      </div>

      {props.generateFolioNumber?
        <div style={{width: "100%", margin: "auto", display: "flex", justifyContent:"center", alignItems: "center",}}>
          <label id="folioNumber" style={{color:"#4e4e4e", paddingRight: 20}}>
            Starting folio number
          </label>
          <div>
            <TextField
              aria-labelledby="folioNumber"
              name="startFolioNumber"
              value={props.startFolioNumber}
              onChange={(event, newValue) => {props.set("startFolioNumber", parseInt(newValue, 10))}}
              style={{width:50}}
              type="number"
            />
          </div>
        </div>
      :""}

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