import React, {Component} from 'react';
import DeleteConfirmation from './DeleteConfirmation';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';

/** Note type page to add, edit and delete note types */
export default class NoteType extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newType: "",
      types: [...props.noteTypes],
      editing: new Array(props.noteTypes.length).fill(false),
      errorNewType: "",
      errorTypes: new Array(props.noteTypes.length).fill(""),
      lastSubmitted: -2,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.types.length !== nextProps.noteTypes.length) {
      this.setState({types: [...nextProps.noteTypes]});
      this.resetEditing();
    }
  }

  resetEditing = () => {
    this.setState({editing: new Array(this.props.noteTypes.length).fill(false), newType: ""})
  }

  onNewTypeChange = (newType) => {
    // newType = newType.trim();
    this.setState({newType}, ()=>{
      if (!this.isValid(newType.trim())){
        let errorMessage = `Note type with name ${newType} already exists in this project`;
        if (newType.length===0)
          errorMessage = "";
        this.setState({errorNewType: errorMessage});
      } else {
        this.setState({errorNewType: ""});
      }
    });
  }

  onChange = (newType, index) => {
    this.setType(index, newType);
    this.setEditing(index, true);
    if (!this.isValid(newType)){
      let errorMessage = `Note type with name ${newType} already exists in this project`;
      if (newType===this.props.noteTypes[index])
        errorMessage = "";
      if (newType.length===0)
        errorMessage = `Note type cannot be blank`;
      this.setError(index, errorMessage);
    } else {
        this.setError(index, "");
    }
  }

  onUpdate = (event, index) => {
    event.preventDefault();
    const newNoteType = this.state.types[index];
    if (newNoteType!==this.props.noteTypes[index]) {
      this.setState({lastSubmitted: index});
      let noteType = {
        project_id: this.props.projectID,
        type: newNoteType,
        old_type: this.props.noteTypes[index],
      }
      this.props.action.updateNoteType(noteType);
    }
    this.setEditing(index, false);
  }

  isValid = (newType) => {
    return !this.props.noteTypes.includes(newType) && newType.length!==0;
  }

  onDelete = (index) => {
    let noteType = {
      project_id: this.props.projectID,
      type: this.state.types[index],
    }
    let updatedEditing = [...this.state.editing];
    updatedEditing.splice(index, 1);
    this.setState({editing: updatedEditing}, ()=>{
      this.props.action.deleteNoteType(noteType);
    });
  }

  onCreate = (event) => {
    event.preventDefault();
    let noteType = {
      project_id: this.props.projectID,
      type: this.state.newType.trim(),
    }
    this.props.action.createNoteType(noteType);
    this.resetEditing();
    this.setState({lastSubmitted: -1});
  }

  onCancelUpdate = (index) => {
    this.setType(index, this.props.noteTypes[index]);
    this.setError(index, "");
    this.setEditing(index, false);
  }

  setType = (index, value) => {
    let newTypes = [...this.state.types];
    newTypes[index]=value;
    this.setState({types: newTypes});
  }

  setEditing = (index, value) => {
    let newEditing = [...this.state.editing];
    newEditing[index]=value;
    this.setState({editing: newEditing});
  }

  setError = (index, value) => {
    let newErrors = [...this.state.errorTypes];
    newErrors[index] = value;
    this.setState({errorTypes: newErrors});
  }

  /**
   * Return a generated HTML of submit and cancel buttons for a specific input name
   * @param {number} index index of note type
   * @public
   */
  renderSubmitButtons = (index) => {
    if (this.state.editing[index]) {
      return (
        <div style={{float:'right', marginRight:'25%'}}>
          <RaisedButton
            aria-label="Submit"
            primary
            icon={<IconSubmit />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            name="submit"
            type="submit"
            disabled={!this.isValid(this.state.types[index])}
          />
          <RaisedButton
            aria-label="Submit"
            secondary
            icon={<IconClear />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            onClick={(e)=>this.onCancelUpdate(index)}
          />
        </div>
      )
    } else {
      return "";
    }
  }

  renderNoteType = (noteType, index) => {
    return (
      <div key={"type_"+index} className="item">
        <form onSubmit={(e)=>this.onUpdate(e, index)}>
          <TextField 
            aria-label={noteType + " note type"}
            name={"type_"+index}
            value={this.state.types[index]}
            onChange={(e,v)=>this.onChange(v,index)}
            errorText={this.state.errorTypes[index]}
            aria-invalid={this.state.errorTypes[index].length>0}
            style={{width:"75%"}}
            tabIndex={this.props.tabIndex}
          />
          { noteType==="Unknown"? "" : 
            <DeleteConfirmation 
              item="note type"
              onDelete={this.onDelete}
              index={index}
              itemName={noteType}
              togglePopUp={this.props.togglePopUp}
              tabIndex={this.props.tabIndex}
            />
          }
          {this.renderSubmitButtons(index)}
        </form>
      </div>
    );
  }

  filterNoteType = (object, index) => {
    return object.key!=="type_0";
  }

  render() {
    return <div className="noteType" role="region" aria-label="main">
      <h2 style={{paddingTop:0}}>Add a new note type</h2>
        <form onSubmit={(e)=>this.onCreate(e)}>
          <div className="create">
          <div className="input">
            <TextField
              aria-label="New note type"
              name="newType"
              value={this.state.newType}
              onChange={(e,v)=>this.onNewTypeChange(v)}
              errorText={this.state.errorNewType}
              aria-invalid={this.state.errorNewType.length>0}
              style={{width: 300}}
              tabIndex={this.props.tabIndex}
            />
          </div>
          <div className="submit">
            <RaisedButton
              label="Create"
              primary
              type="submit"
              disabled={!this.isValid(this.state.newType)}
              tabIndex={this.props.tabIndex}
            />
          </div>
      </div>
        </form>
      <h2>Your note types</h2>
      <div className="items">
        {this.props.noteTypes.map(this.renderNoteType).filter(this.filterNoteType)}
      </div>
    </div>;
  }
}
