import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

export default class EditManifest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.manifest.name,
      nameError: ""
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({name: nextProps.manifest.name})
  }

  onChange = (type, value) => {
    this.setState({[type]: value}, ()=>{this.runValidation()})
  }

  onSubmit = (e) => {
    e.preventDefault();
    const manifest = {id: this.props.manifest.id, name: this.state.name.trim()}
    this.setState({name: ""}, ()=>{
      this.props.updateManifest({manifest});
      this.props.handleClose();
    })
  }

  onCancel = (e) => {
    this.setState({name: ""})
  }

  runValidation = () => {
    for (const manifestID in this.props.manifests){
      const manifest = this.props.manifests[manifestID];
      if (manifestID!==this.props.manifest.id && manifest.name===this.state.name.trim()){
        this.setState({nameError: `Manifest with name: ${manifest.name} already exists.`});
        return;
      } else if (this.state.name.length>51) {
        this.setState({nameError: `Manifest name must be under 50 characters.`});
        return;
      }
    }
    // No validation errors
    this.setState({nameError: ""});
  }

  isValid = () => {
    return (this.state.nameError==="" && this.state.name!=="" && this.props.manifest.name!==this.state.name.trim())
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.props.handleClose}
      />,
      <RaisedButton
        label="Submit"
        primary={true}
        disabled={!this.isValid()}
        type="submit"
        onClick={this.onSubmit}
      />,
    ];

    if (this.props.open) {
      return (
        <div>
          <Dialog
            title="Edit manifest"
            actions={actions}
            modal={false}
            open={this.props.open}
            onRequestClose={this.props.handleClose}
          >
          <div className="imageManager">
            <form className="form" onSubmit={(e)=>this.onSubmit(e)}>
              <div className="row">
                <div className="label">Manifest name</div>
                <div className="input">
                  <TextField 
                    id="name" 
                    value={this.state.name}
                    errorText={this.state.nameError}
                    onChange={(e,v)=>this.onChange("name", v)}
                    fullWidth
                  />
                </div>
              </div>
            </form>
            </div>
          </Dialog>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}