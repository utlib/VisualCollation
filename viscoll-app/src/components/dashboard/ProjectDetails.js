import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';



const ProjectDetails = (props) => {
  let submit = (event) => {
    event.preventDefault();
    if(!props.doErrorsExist()) props.nextStep()
  }
  return (
    <div style={{width:"100%", margin: "auto", textAlign: "center"}}>
      <h1>Object Details</h1>
      <form onSubmit={submit}>
        <div style={{width: "60%", margin: "auto"}}>
          <TextField
            floatingLabelText="Object Title"
            value={props.title}
            errorText={props.errors.title}
            onChange={(event, newValue) => props.set("title", newValue)}
            fullWidth
          />
          <TextField
            floatingLabelText="Manuscript Shelfmark"
            value={props.shelfmark}
            errorText={props.errors.shelfmark}
            onChange={(event, newValue) => props.set("shelfmark", newValue)}
            fullWidth
          />
          <TextField
            floatingLabelText="Manuscript Date"
            value={props.date}
            errorText={props.errors.date}
            onChange={(event, newValue) => props.set("date", newValue)}
            fullWidth
          />
        </div>
        <div style={{textAlign:"center",paddingTop:30}}>
          <FlatButton 
              label="Back"
              onTouchTap={props.previousStep}  
          />
          <RaisedButton 
            label={props.step===1?"Next":"Finish"}
            primary
            disabled={props.doErrorsExist()}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
export default ProjectDetails;
