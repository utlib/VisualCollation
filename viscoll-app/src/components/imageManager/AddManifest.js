import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class AddManifest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      urlError: ""
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
    this.props.createManifest({manifest});
  }

  onCancel = (e) => {
    this.setState({url: "", urlError: ""})
    this.props.cancelCreateManifest();
  }

  runValidation = () => {
    for (const manifestID in this.props.manifests){
      const manifest = this.props.manifests[manifestID];
      if (manifest.url===this.state.url){
        this.setState({urlError: `Manifest with url: ${manifest.url} already exists.`});
        return;
      }
    }
    // No validation errors
    this.setState({urlError: ""});
  }

  isValid = () => {
    return (this.state.urlError==="" && this.state.url!=="")
  }

  render() {
    return (
      <form className="form" onSubmit={(e)=>this.onSubmit(e)}>
        <h2>Add a new Manifest</h2>
        <div className="row">
          <div className="label">URL</div>
          <div className="input">
            <TextField 
              id="url"
              aria-label="Manifest URL"
              errorText={this.state.urlError}
              fullWidth 
              value={this.state.url}
              onChange={(e,v)=>this.onChange("url", v)}
              tabIndex={this.props.tabIndex}
            />
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <RaisedButton
            disabled={this.state.url===""}
            label="Cancel"
            onClick={(e)=>this.onCancel(e)}
            style={{marginRight: 5}}
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
          />
        </div>
      </form>
    );
  }
}
