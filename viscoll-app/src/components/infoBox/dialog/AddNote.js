import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import AutoComplete from 'material-ui/AutoComplete';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';


/** Dialog to add a note to an object (leaf, side, or group).  This component is used in the visual and tabular edit modes.  */
export default class AddNote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      type: '',
      description:'',
      show: false,
      searchText: '',
      noteID: null,
    };
  }

  /** Open this modal component */
  handleOpen = () => {
    this.setState({
      open: true,
      type: '',
      description:'',
      show: false,
      searchText: '',
      noteID: null,
    });
    this.props.togglePopUp(true);
  };

  /** Close this modal component */
  handleClose = () => {
    this.setState({open: false});
    this.props.togglePopUp(false);
  };

  handleUpdateInput = (searchText) => {
    this.setState({
      searchText: searchText,
      noteID: null
    });
  };

  handleNewRequest = (request) => {
    // User pressed enter instead of selecting a note in drop down
    // Look for key associated with user input
    let noteID = null;
    for (let id in this.props.Notes){
      const note = this.props.Notes[id];
      if (note.title===request) { noteID = note.id;}
    }
    this.setState({noteID}, ()=>{
      if (noteID) this.submit()
    });
  };

  submit = () => {
    if (this.state.noteID!==null) {
      // Attach existing note to selected objects
      this.props.action.linkNote(this.state.noteID);
    } else {
      // Check if note exists (in case user types and did not press enter)
      let noteID = null;
      for (let id in this.props.Notes){
        const note = this.props.Notes[id];
        if (note.title===this.state.searchText) noteID = note.id;
      }
      if (noteID) {
        this.props.action.linkNote(noteID);
      } else {
        // Did not find note, so create and attach new note to object
        this.props.action.createAndAttachNote(this.state.searchText, this.state.type, this.state.description, this.state.show);
      }
    }
    this.handleClose();
  }
  
  noteExists = () => {
    for (let noteID in this.props.Notes) {
      const note = this.props.Notes[noteID];
      if (note.title===this.state.searchText) {
        return true;
      }
    }
    return false;
  }

  /**
   * Mapping function to render one note type menu item 
   * @param {string} name note type name
   * @public
   */
  renderNoteTypes = (name) => {
    return <MenuItem key={name} value={name} primaryText={name} />;
  }

  /**
   * Update state on input change
   * @param {string} name input name
   * @param {string} value new value
   * @public
   */
  onChange = (name, value) => {
    this.setState({[name]:value});
  }

  getFilteredNoteTitlesDropDown = () => {
    return Object.keys(this.props.Notes).filter((noteID) => {return !this.props.commonNotes.includes(noteID)})
  }

  render() {
    const dataSourceConfig = {
      text: 'textKey',
      value: 'valueKey',
    };

    const actions = [
      <FlatButton
        label="Cancel"
        onClick={this.handleClose}
        style={{width:"49%", marginRight:"1%",border:"1px solid #ddd"}}
        keyboardFocused
      />,
      <RaisedButton
        label={(this.noteExists()||this.state.searchText.length===0)? "Attach note" : "Create & attach note"}
        primary
        onClick={this.submit}
        style={{width:"49%"}}
        disabled={!this.noteExists()&&this.state.type===''}
      />,
    ];

    let newNoteForm = <div></div>;
    if (!this.noteExists() && this.state.searchText.length>1) {
      newNoteForm = (
        <div>
          <SelectField
            value={this.state.type}
            onChange={(e,i,v)=>this.onChange("type",v)}
            floatingLabelText="Note type"
            fullWidth
            style={{marginTop:-20}}
          >
            {this.props.noteTypes.map(this.renderNoteTypes)}
          </SelectField>
          <TextField
            floatingLabelText="Description"
            name="description"
            value={this.state.description}
            onChange={(e,v)=>this.onChange("description",v)}
            multiLine
            fullWidth
            style={{marginTop:-20}}
          />
          <div className="label" style={{paddingTop:20}}>
            Show in diagram
          </div>
          <div className="input">
            <Checkbox
              name="show"
              value={this.state.show}
              checked={this.state.show}
              style={{paddingTop:20}}
              onClick={()=>this.onChange("show",!this.state.show)}
            />
          </div>
        </div>
      );
    }

    let dialog = (<Dialog
        title={"Attach Note"}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
        autoScrollBodyContent
        contentStyle={{width:"450px", height:"500px"}}
        titleStyle={{textAlign:"center"}}
        paperClassName="addDialog"
      >
      <AutoComplete
        floatingLabelText={"Search for note title" }
        searchText={this.state.searchText}
        onUpdateInput={this.handleUpdateInput}
        onNewRequest={this.handleNewRequest}
        dataSource={
          this.getFilteredNoteTitlesDropDown().map((noteID)=>{return {textKey: this.props.Notes[noteID].title, valueKey: noteID}})}
        filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
        openOnFocus={true}
        dataSourceConfig={dataSourceConfig}
        fullWidth
        listStyle={{ maxHeight: 300, overflow: 'auto' }}
        errorText={(!this.noteExists()&&this.state.searchText.length>0)?"This note doesn't exist. To create and attach it, fill out its note type and description.":""}
        errorStyle={{color:"#727272"}}
        floatingLabelFocusStyle={{color:"#3A4B55"}}
      />
      {newNoteForm}
    </Dialog>)

    return (
      <div style={{float:'right'}}>
        <IconButton 
          tooltip="Attach a note"
          tabIndex={this.props.tabIndex}
          onClick={this.handleOpen}
        > 
          <IconAdd />
        </IconButton>
        {dialog}
      </div>
    );
  }
}
