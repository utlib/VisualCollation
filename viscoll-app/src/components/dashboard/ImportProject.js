import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';


export default class ImportProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      importData: "",
      importFormat: "json",
      imageData:"",
    }
  }

  isDisabled = () => {
    if (this.state.importData)
      return (this.state.importData.length===0);
    else 
      return true
  }

  submit = (event) => {
    if (event) event.preventDefault();
    if (!this.isDisabled()) {
      this.props.importProject({importData: this.state.importData, importFormat: this.state.importFormat, imageData: this.state.imageData});
    } 
  }

  onChange = (value, type) => {
    this.setState({ [type]: value });
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.importStatus==="SUCCESS") {
      nextProps.reset();
      nextProps.close();
    }
  }

  checkIfFileTypeIsInvalid = (file) => {
    const allowedFileTypes = ["json", "xml"];
    return !allowedFileTypes.includes(file.type)
  }


  handleFileSelected = (files) => {
    let file = files[0];
    let importFormat = file.type.split("/")[1];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = ()=>this.setState({importData: reader.result, importFormat})
  }

  handleImageFile = (files) => {
    let file = files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = ()=> {this.setState({imageData: reader.result})}
  }

  render() {
    let xmlMessage = "";
    if (this.state.importFormat==="xml")
      xmlMessage = <p><strong>Note</strong>: If the XML file was not originally created by this application, 
      some attributes and mappings may not be successfully imported. 
      However, the collation structure will always be importable from any XML file that follows the VisColl schema.</p>
    return (
      <div>
        <div style={{textAlign:"center"}}>
          <h1>Import</h1>
        </div>
        <h2>Import collation</h2>
        <p>Upload your exported collation file or directly paste the content of the file in the textbox below.</p>
        <form onSubmit={this.submit}>
          <div className="section" style={{paddingBottom:"1em"}}>
            <input 
              type="file" 
              accept=".json, .xml"
              name="importUpload" 
              aria-label="Upload file to import" 
              onChange={(event)=>this.handleFileSelected(event.target.files)}
              onClick={(event)=>event.target.value=null}
            />
          </div>
          <div className="section">
            <textarea
              aria-label="Paste import data here"
              aria-invalid={this.props.importStatus!==undefined}
              name="importData"
              value={this.state.importData}
              rows={5}
              onChange={(e)=>this.onChange(e.target.value, "importData")}
            />
          </div>
          <br/>
          <h3>Import format:</h3>
          <div className="section" role="radiogroup">
            <RadioButtonGroup 
              name="exportType" 
              defaultSelected="json"
              style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start'}}
              valueSelected={this.state.importFormat}
              onChange={(e,v)=>this.onChange(v, "importFormat")}
            >
                <RadioButton
                  role="radio"
                  aria-label="JSON"
                  aria-checked={this.state.importFormat==="json"}
                  value="json"
                  label="JSON"
                  style={{display: 'inline-block', width: '125px'}}
                />
                <RadioButton
                  role="radio"
                  aria-label="XML"
                  aria-checked={this.state.importFormat==="xml"}
                  value="xml"
                  label="XML"
                  style={{display: 'inline-block', width: '125px'}}
                />
            </RadioButtonGroup>
            {xmlMessage}
          </div>
          <h2>Import images</h2>
          <p>If you have images in your collation, upload the zipped file.</p>
          <div className="section" style={{paddingBottom:"1em"}}>
            <input 
              type="file" 
              accept=".zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
              name="imageZipUpload" 
              aria-label="Upload zipped images" 
              onChange={(event)=>this.handleImageFile(event.target.files)}
              onClick={(event)=>event.target.value=null}
            />
          </div>
          <br/>
          {this.props.importStatus!==undefined? 
            <p id="errorMsg" style={{fontWeight:"heavy", color: "red"}}>{this.props.importStatus}</p>
            : ""            
          }
          
          <div style={{textAlign:"center",paddingTop:30}}>
            <FlatButton 
              label="Back" 
              aria-label="Back" 
              onClick={() => this.props.previousStep()}
            />
            <RaisedButton 
              label="Next"
              aria-label="Next"
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
