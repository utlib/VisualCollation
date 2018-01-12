import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import SelectField from '../global/SelectField';


/** Create New Note tab in the Note Manager */
export default class NewNoteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      type: "",
      description: "",
      show: false,
      errors: {
        title: "",
      }
    };
  }

  /**
   * Validates title
   * @param {string} title
   * @public
   */
  validateTitle = (title) => {
    for (let noteID in this.props.Notes) {
      const note = this.props.Notes[noteID];
      if (note.title===title && note.id!==this.state.id) {
        this.setState({errors:{title:"This note title already exists."}});
        return;
      };
    }
    if (title.length>100) {
      this.setState({errors:{title:"Title must be less than 100 characters."}});
    } else if  (title.length===0) {
      this.setState({errors:{title:"Title must not be empty."}});
    } else {
      this.setState({errors:{title:""}});
    }
  }

  /**
   * Update state on input change
   * @param {string} name input name
   * @param {string} value new value
   * @public
   */
  onChange = (name, value) => {
    this.setState({[name]:value, editing: {...this.state.editing, [name]: true}});
    if (name==="title") this.validateTitle(value.trim());
    if (name==="type") {
      let editing = {
        title: this.state.title,
        type: value,
        description: this.state.description,
        show: this.state.show
      }
      if (this.props.note)
        this.props.action.updateNote(this.props.note.id, editing);
    }
  }

  /**
   * Create new note 
   * @public
   */
  create = () => {
    let note = {
      "project_id": this.props.projectID,
      "title": this.state.title,
      "type":  this.state.type,
      "description": this.state.description,
      "show": this.state.show
    }
    this.props.action.addNote(note);
    // Reset form
    this.setState({
      title: "",
      type: "",
      description: "",
      show: false,
      errors: {
        title: "",
      }
    });
  }

  /**
   * Clear values in the input fields if we are creating a new note
   * Reset to original values if we are editing an existing note
   * @param {object} props
   * @public
   */
  reset = (props) => {
    this.setState({
      title: "",
      type: "",
      description: "",
      errors: {
        title:"",
        type:"",
        description:"",
        show: false
      }
    });
  }


  /**
   * Mapping function to render one note type menu item 
   * @param {string} name note type name
   * @public
   */
  renderNoteTypes = (name) => {
    return {value:name, text:name};
  }


  renderMenuItem = (item, type, index) => {
    let label = "";
    if (type==="Side") {
      let sideName = item.charAt(0)==="R" ? "Recto" : "Verso";
      label = `Leaf ${Math.ceil((index-3)/2)}: ${type} ${sideName}`
    } else{
      const itemOrder = this.props[`${type.toLowerCase()}IDs`].indexOf(item.id)+1;
      label = `${type} ${itemOrder}`
    }
    return (
      <div key={item.id} value={item.id} label={label}>
        {label}
      </div>
    );      
  }

  render() {
    let title = "Create a new note";
    let createButtons = <div className="buttons">
      <RaisedButton
        label={"Reset"}
        onClick={()=>this.reset()}
        style={{width:120}}
      />    &nbsp;
      <RaisedButton
        label={"Create"}
        primary
        style={{width:120}}
        onClick={()=>this.create()}
        disabled={this.state.errors.title!=="" || this.state.type==="" || this.state.title===""}
      />
     
               
    </div>

    return (
      <div className="container">
        <h1>{title}</h1> 
        <div className="noteForm">
          <div className="label" id="newNoteTitle">
            Title
          </div>
          <div className="input">
            <TextField
            aria-labelledby="newNoteTitle"
            name="title"
            value={this.state.title}
            errorText={this.state.errors.title}
            onChange={(e,v)=>this.onChange("title",v)}
            fullWidth
            aria-invalid={this.state.errors.title.length>0}
            />
          </div>
          <div className="label" id="newNoteType">
            Type
          </div>
          <div className="input">
            <SelectField
              label="newNoteType"
              id="newNoteType"
              value={this.state.type}
              onChange={(v,i)=>this.onChange("type",v)}
              data={this.props.noteTypes.map(this.renderNoteTypes)}
            >
            </SelectField>
          </div>
          <div className="label" id="newNoteDescription">
            Description
          </div>
          <div className="input">
            <TextField
              aria-labelledby="newNoteDescription"
              name="description"
              value={this.state.description}
              onChange={(e,v)=>this.onChange("description",v)}
              multiLine
              fullWidth
            />
          </div>
          <div className="label" style={{paddingTop:20}} id="newNoteShow">
            Show in diagram
          </div>
          <div className="input">
            <Checkbox
              aria-labelledby="newNoteShow"
              name="show"
              value={this.state.show}
              checked={this.state.show}
              style={{paddingTop:20}}
              onClick={()=>this.onChange("show",!this.state.show)}
            />
          </div>
          {createButtons}
        </div>
      </div>
    );
  }
}
