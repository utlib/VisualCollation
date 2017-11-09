import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import fileDownload from 'js-file-download';
import copy from 'copy-to-clipboard';



const Export = (props) => {

  const filename = props.projectTitle.replace(/\s/g, "_");

  let actions = [
    <FlatButton
      label="Download"
      secondary={true}
      onClick={()=>fileDownload(props.exportedData, `${filename}.${props.exportedType}`)}
    />,
    <FlatButton
      label="Copy To Clipboard"
      secondary={true}
      onClick={()=>{
        copy(props.exportedData);
        props.showCopyToClipboardNotification();
      }}
    />,
    <FlatButton
      label="Close"
      primary={true}
      onClick={()=>props.handleExportToggle(false)}
    />,
  ];

  let verticalOverflow;
  if (props.exportedType==="formula"){
    actions.shift();
    verticalOverflow = "hidden";
  }
  let message = "This JSON export contains the complete collation with all of its data";
  if (props.exportedType==="xml") {
    message = "This XML export does not fully export all the collation data";
  }

  return (
    <Dialog
      title={props.label}
      actions={actions}
      modal={false}
      open={props.exportOpen}
      onRequestClose={()=>props.handleExportToggle(false)}
      contentStyle={{maxWidth: 1000}}
    >
      <strong>{message}</strong>
      <div style={{marginTop: 20, maxHeight: 500, overflow: "scroll", overflowY: verticalOverflow, background:"#f5f5f5"}}>
        <pre>
          {props.exportedData}
        </pre>
      </div>
    </Dialog>
  );
}


export default Export;

