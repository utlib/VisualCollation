import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {btnMd} from '../../styles/button';

const NewProjectChoice = (props) => {
  return <div style={{width:"100%", padding:"2em 0em", margin: "auto", textAlign: "center"}}>
    <RaisedButton
      label="Start with an empty project"
      onClick={props.finish}
      {...btnMd}
      labelStyle={{textTransform:"none", ...btnMd.labelStyle}}
      style={{marginRight:"1.5em"}}
    />

    OR

    <RaisedButton
      label="Pre-populate with quires"
      {...btnMd}
      labelStyle={{textTransform:"none", ...btnMd.labelStyle}}
      onClick={props.nextStep}
      style={{marginLeft:"1.5em"}}
    />
  </div>
}
export default NewProjectChoice;