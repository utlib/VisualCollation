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

  render() {
    return (
      <div>
        <div style={{textAlign:"center"}}>
          <h1>Import</h1>
        </div>
        <p>Please paste the content of your exported collation data in the textbox below, or upload a file to import.</p>
        <form onSubmit={this.submit}>
          <textarea
            aria-label="Paste import data here"
            aria-errormessage="errorMsg"
            aria-invalid={this.props.importStatus!==undefined}
            name="importData"
            value={this.state.importData}
            rows={7}
            onChange={(e)=>this.onChange(e.target.value, "importData")}
          />
          <br/>
          <h2>Import from file:</h2>
          <div className="section">
            <input 
              type="file" 
              accept=".json, .xml"
              name="importUpload" 
              aria-label="Upload file to import" 
              onChange={(event)=>this.handleFileSelected(event.target.files)}
              onClick={(event)=>event.target.value=null}
            />
          </div>
          <h2>Import format:</h2>
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
