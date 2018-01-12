import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {floatFieldLight} from '../../styles/textfield';
import UploadImages from './UploadImages';
import { btnBase } from '../../styles/button';

export default class AddManifest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      urlError: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.createManifestError!==""){
      if (this.state.urlError==="")
        this.setState({urlError: nextProps.createManifestError});
    } else {
      this.setState({url: "", urlError: ""});
    }
  }

  onChange = (type, value) => {
    this.setState({[type]: value}, ()=>{this.runValidation()})
  }

  onSubmit = (e) => {
    e.preventDefault();
    const manifest = {url: this.state.url}
    this.props.action.createManifest({manifest});
  }

  onCancel = (e) => {
    this.setState({url: "", urlError: ""})
    this.props.action.cancelCreateManifest();
  }

  runValidation = () => {
    // Check if manifest url already exists
    for (const manifestID in this.props.manifests){
      const manifest = this.props.manifests[manifestID];
      if (manifest.url===this.state.url){
        this.setState({urlError: `Manifest with url: ${manifest.url} already exists.`});
        return;
      }
    }
    // Check if url is a valid JSON
    fetch(this.state.url)
    .then(response => {
      const contentType = response.headers.get("content-type");
      if(contentType && contentType.indexOf("json") !== -1) {
        // No validation errors
        if (response.url!==this.state.url) {
          // Original URL was a redirect to a valid JSON url, so update our state 
          this.setState({url: response.url, urlError: ""});
        }
          this.setState({urlError: ""});
      } else {
        this.setState({urlError: "Invalid URL:  the URL does not resolve to a JSON file."})
      }
    })
    .catch(()=> {
      this.setState({urlError: "Invalid URL:  the URL does not resolve to a JSON file."})
    })
  }

  isValid = () => {
    return (this.state.urlError==="" && this.state.url!=="")
  }

  render() {
    return (
      <div>
      <h1>Add new images</h1>
      <div className="addImages">
        <div>
          <h2>Upload images</h2>
          <UploadImages
            images={this.props.images}
            action={{
              uploadImages: this.props.action.uploadImages,
            }}
          />
        </div>
        <div>
          <h2>Import images from a IIIF manifest</h2>
            <form className="form" onSubmit={(e)=>this.onSubmit(e)}>
              <div className="row">
                <div className="input">
                  <TextField 
                    id="url"
                    floatingLabelText="Manifest URL"
                    aria-label="Manifest URL"
                    errorText={this.state.urlError}
                    fullWidth 
                    value={this.state.url}
                    onChange={(e,v)=>this.onChange("url", v)}
                    tabIndex={this.props.tabIndex}
                    {...floatFieldLight}
                  />
                </div>
              </div>
              <div style={{textAlign:"right", paddingTop:15}}>
                <RaisedButton
                  disabled={this.state.url===""}
                  label="Cancel"
                  onClick={(e)=>this.onCancel(e)}
                  {...btnBase()}
                  style={{...btnBase().style, marginRight: 5}}
                  tabIndex={this.props.tabIndex}
                />
                <RaisedButton
                  disabled={!this.isValid()}
                  primary 
                  label="Add"
                  type="submit"
                  name="submit"
                  onClick={(e)=>this.onSubmit(e)}
                  tabIndex={this.props.tabIndex}
                  {...btnBase()}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
