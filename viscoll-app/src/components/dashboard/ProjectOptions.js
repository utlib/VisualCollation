import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import SelectField from '../global/SelectField';
import IconButton from 'material-ui/IconButton';
import IconHelp from 'material-ui/svg-icons/action/help';

/** New Project dialog - panel with additional options for project creation  */
const ProjectOptions = props => {
  console.log(props.generateFolioNumber);
  let handleChange = (e, v) => {
    console.log(`Event: ${e}, Value: ${v}`);
    if (v === 'folio_number') {
      props.set('generateFolioNumber', v);
    } else if (v === 'page_number') {
      props.set('generatePageNumber', v);
    } else {
      console.log(e, v);
    }
  };

  return (
    <div style={{ width: '60%', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Project Options</h1>
      <h2>Generate page/folio numbers</h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <RadioButtonGroup
          name="folioOrPage"
          defaultSelected="folio_number"
          onChange={(e, v) => handleChange(e, v)}
          style={{ width: 240 }}
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

      {props.generateFolioNumber || props.generatePageNumber ? (
        <div
          style={{
            width: '100%',
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <label
            id="folioPageNumber"
            style={{ color: '#4e4e4e', paddingRight: 20 }}
          >
            Starting number
          </label>
          <div>
            <TextField
              aria-labelledby="folioPageNumber"
              name="startFolioPageNumber"
              value={props.startFolioPageNumber}
              onChange={(event, newValue) => {
                props.set('startFolioPageNumber', parseInt(newValue, 10));
              }}
              style={{ width: 50 }}
              type="number"
            />
          </div>
        </div>
      ) : (
        ''
      )}

      <h2>
        Select starting texture
        <IconButton
          iconStyle={{ fontSize: 10, width: 15, height: 15 }}
          tooltip="Texture of the first leaf's recto side"
        >
          <IconHelp />
        </IconButton>
      </h2>
      <div
        style={{
          width: '100%',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SelectField
          id="selectStartingTexture"
          label="Select starting texture"
          data={[
            { text: 'Hair', value: 'Hair' },
            { text: 'Flesh', value: 'Flesh' },
          ]}
          value={props.startingTexture}
          onChange={() => {
            if (props.startingTexture === 'Hair') {
              props.set('startingTexture', 'Flesh');
            } else {
              props.set('startingTexture', 'Hair');
            }
          }}
          width={250}
        />
      </div>
      <h2>
        Select side notation style
        <IconButton
          iconStyle={{ fontSize: 10, width: 15, height: 15 }}
          tooltip="Style of notation"
        >
          <IconHelp />
        </IconButton>
      </h2>
      <div
        style={{
          width: '100%',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SelectField
          id="selectSideStyle"
          label="Select side notation style"
          data={[
            { text: 'r-v', value: 'r-v' },
            { text: 'recto-verso', value: 'recto-verso' },
            { text: 'a-b', value: 'a-b' },
          ]}
          value={'r-v'}
          onChange={e => {
            props.set('notationStyle', e);
            console.log(e);
          }}
          width={250}
        />
      </div>

      <div style={{ textAlign: 'center', paddingTop: 30 }}>
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
  );
};
export default ProjectOptions;
