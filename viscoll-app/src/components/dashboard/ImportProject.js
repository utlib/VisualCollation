import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Dropzone from 'react-dropzone'


export default class ImportProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      importData: "",
      importFormat: "xml",
    }
  }


  isDisabled = () => {
    if (this.state.importData)
      return (this.state.importData.length===0);
    else 
      return true
  }

  submit = (event) => {
    event.preventDefault();
    if (!this.isDisabled()) {
      this.props.importProject({importData: this.state.importData, importFormat: this.state.importFormat});
    } 
  }

  onChange = (value, type) => {
    this.setState({ [type]: value });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.importStatus==="SUCCESS"){
      nextProps.reset();
      nextProps.close();
    }
  }


  checkIfFileTypeIsInvalid = (file) => {
    const allowedFileTypes = ["json", "xml", "txt"];
    return !allowedFileTypes.includes(file.type)
  }


  handleFileSelected = (files) => {
    let file = files[0];
    let importFormat = file.type.split("/")[1];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = ()=>this.setState({importData: reader.result, importFormat})
  }

  render() {
    const dropFileText = <p>
      Drop a file here, or click to select a file to upload.<br/>
      Only <strong>*.json, .xml and *.txt</strong> files will be accepted.
    </p>;
    return (
      <div>
        <div style={{textAlign:"center"}}>
          <h1>Import</h1>
        </div>
        <p>In the textbox below, please paste the content of your exported collation data.</p>
        <form onSubmit={this.submit}>
          <TextField
            name="importData"
            value={this.state.importData}
            fullWidth
            multiLine
            rows={7}
            rowsMax={7}
            onChange={(e,v)=>this.onChange(v, "importData")}
            underlineShow={false}
            style={{border: "1px solid #cccccc", width: "99%"}}
            textareaStyle={{padding:"0px 15px"}}
          />
          <br/>
          <Dropzone 
            style={{width: "50%", height: null, border: "#2a8282", borderStyle: "dotted", margin: "0 auto", textAlign: "center"}}
            onDrop={(accepted, rejected) => {this.handleFileSelected(accepted)}} 
            accept=".json, .xml, .txt"
            multiple={false}
          >
            {dropFileText}
          </Dropzone>
          <p>Import format:</p>
          <RadioButtonGroup 
            name="exportType" 
            defaultSelected="xml"
            style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start'}}
            valueSelected={this.state.importFormat}
            onChange={(e,v)=>this.onChange(v, "importFormat")}
          >
            <RadioButton
              value="xml"
              label="XML"
              style={{display: 'inline-block', width: '125px'}}
            />
            <RadioButton
              value="json"
              label="JSON"
              style={{display: 'inline-block', width: '125px'}}
            />
            <RadioButton
              value="formula"
              label="Formula"
              style={{display: 'inline-block', width: '125px'}}
            />
          </RadioButtonGroup>
          <br/>
          <strong style={{color: "red"}}>{this.props.importStatus}</strong>
          <div style={{textAlign:"center",paddingTop:30}}>
            <FlatButton label="Back" onTouchTap={this.props.previousStep} />
            <RaisedButton 
              label="Next"
              primary
              disabled={this.isDisabled()}
              type="submit"
            />
          </div>
        </form>
      </div>
    );
  };
}



          // <RaisedButton
          //    containerElement='label'
          //    label='Upload an existing file'>
          //    <input 
          //     type="file" 
          //     onChange={this.handleFileSelected}
          //     accept=".json,.xml,.txt"
          //   />
          // </RaisedButton>
