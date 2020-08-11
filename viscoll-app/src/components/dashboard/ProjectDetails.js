import React from 'react';
import { floatFieldLight } from '../../styles/textfield';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

/** New Project dialog - panel with a form to fill out project details  */
const ProjectDetails = props => {
  let submit = event => {
    if (event) event.preventDefault();
    if (!props.doErrorsExist()) props.nextStep();
  };
  return (
    <div style={{ width: '100%', margin: 'auto', textAlign: 'center' }}>
      <h1>Object Details</h1>
      <form onSubmit={submit}>
        <div style={{ width: '60%', margin: 'auto' }}>
          <TextField
            id="objectTitle"
            floatingLabelText="Object Title"
            {...floatFieldLight}
            value={props.title}
            errorText={props.errors.title}
            aria-invalid={props.errors.title.length > 0}
            onChange={(event, newValue) => props.set('title', newValue)}
            fullWidth
          />
          <TextField
            id="manuscriptShelfmark"
            floatingLabelText="Manuscript Shelfmark"
            {...floatFieldLight}
            value={props.shelfmark}
            errorText={props.errors.shelfmark}
            aria-invalid={props.errors.shelfmark.length > 0}
            onChange={(event, newValue) => props.set('shelfmark', newValue)}
            fullWidth
          />
          <TextField
            id="manuscriptDate"
            floatingLabelText="Manuscript Date"
            {...floatFieldLight}
            value={props.date}
            errorText={props.errors.date}
            aria-invalid={props.errors.date.length > 0}
            onChange={(event, newValue) => props.set('date', newValue)}
            fullWidth
          />
        </div>
        <div style={{ textAlign: 'center', paddingTop: 30 }}>
          <FlatButton
            label="Back"
            onClick={() => props.previousStep()}
            aria-label="Back"
          />
          <RaisedButton
            label={props.step === 1 ? 'Next' : 'Finish'}
            primary
            disabled={props.doErrorsExist()}
            type="submit"
            aria-label="Submit"
          />
        </div>
      </form>
    </div>
  );
};
export default ProjectDetails;
