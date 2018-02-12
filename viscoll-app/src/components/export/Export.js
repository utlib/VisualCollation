import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import fileDownload from 'js-file-download';
import copy from 'copy-to-clipboard';
import IconCopy from 'material-ui/svg-icons/content/content-copy';
import IconDownload from 'material-ui/svg-icons/file/file-download';
import IconButton from 'material-ui/IconButton';
import ImageViewer from "../global/ImageViewer";


/** Dialog to export collation to JSON, XML or PNG */
const Export = (props) => {

  const filename = props.projectTitle.replace(/\s/g, "_");

  const actions = [
    <FlatButton
      label={"Download image"}
      icon={<IconDownload />}
      style={props.exportedType==="png"?{marginRight:10}:{display:"none"}}
      onClick={()=>props.downloadImage()}
    />,
    <FlatButton
      label={"Download " + props.exportedType + " + images"}
      icon={<IconDownload />}
      style={props.exportedImages&&props.exportedType!=="png"?{marginRight:10}:{display:"none"}}
      onClick={()=>{window.location=props.exportedImages;fileDownload(props.exportedData, `${filename}.${props.exportedType}`)}}
    />,
    <FlatButton
      label={"Download " + props.exportedType}
      icon={<IconDownload />}
      style={props.exportedImages||props.exportedType==="png"?{display:"none"}:{marginRight:10}}
      onClick={()=>fileDownload(props.exportedData, `${filename}.${props.exportedType}`)}
    />,
    <FlatButton
      label="Close"
      primary={true}
      onClick={()=>props.handleExportToggle(false)}
      keyboardFocused
    />,
  ];

  const exportedData = props.exportedType!=="png"? 
    <div style={{maxHeight: 500, overflow: "scroll", background:"#f5f5f5"}}>
      <IconButton 
        style={{position:"fixed", right:"40px"}} 
        tooltip="Copy to clipboard"
        onClick={()=>{
          copy(props.exportedData);
          props.showCopyToClipboardNotification();
        }}
      >
        <IconCopy />
      </IconButton>
      <pre>
        {props.exportedData}
      </pre>
    </div>
    :
    <div>
      <ImageViewer
        isRectoDIY={true}
        rectoURL={document.getElementById("myCanvas").toDataURL()}
        backgroundColor="#F2F2F2"
      />
    </div>
    ;

  return (
    <Dialog
      title={props.label}
      actions={actions}
      modal={false}
      open={props.exportOpen}
      onRequestClose={()=>props.handleExportToggle(false)}
      contentStyle={{maxWidth: 1000}}
    >
      {props.label==="XML"?
      <p>
        <strong>Note:</strong> custom folio numbers and page numbers will be lost when exporting to XML format.  
        If you wish to preserve all collation data, please choose JSON export.
      </p>
      :""}
      {exportedData}
    </Dialog>
  );
}


export default Export;

