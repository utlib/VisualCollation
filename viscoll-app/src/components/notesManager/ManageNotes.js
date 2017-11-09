import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Drawer from 'material-ui/Drawer';
import EditNoteForm from "./EditNoteForm";
import NewNoteForm from "./NewNoteForm";
import Add from "material-ui/svg-icons/content/add"

/** Create New Note tab in the Note Manager */
export default class ManageNotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeNote: null,
      title: "",
      type: "",
      description: "",
    };
  }

  /**
   * Update state when user clicks on new note item
   * @param {number} index note index in the list of notes 
   * @public
   */
  onItemChange = (activeNote) => {
    this.setState({activeNote});
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.activeNote)
      this.setState({activeNote: nextProps.Notes[this.state.activeNote.id]});
  }

  /**
   * Mapping function to render a note thumbnail 
   * @public
   */
  renderList = (noteID) => {
    const note = this.props.Notes[noteID];
    return (
      <div 
        className={(this.state.activeNote===note) ? "item active" : "item"} 
        key={noteID} 
        onClick={()=>this.onItemChange(note)}
      >
        {note.title}
      </div>
    );
  }

  /**
   * Clear values in the input fields 
   * @public
   */
  reset = () => {
    this.setState({
      title: "",
      type: "",
      description: "",
    });
  }

  deleteNote = (noteID) => {
    this.props.action.deleteNote(noteID);
    this.setState({activeNote: null});
  }

  updateNote = (noteID, note) => {
    this.props.action.updateNote(noteID, note);
  }

  linkNote = (noteID, object) => {
    this.props.action.linkNote(noteID, object);
  }

  unlinkNote = (noteID, object) => {
    this.props.action.unlinkNote(noteID, object);
  }

  linkAndUnlinkNotes = (noteID, linkObjects, unlinkObjects) => {
    this.props.action.linkAndUnlinkNotes(noteID, linkObjects, unlinkObjects);
  }

  getLinkedGroups = () => {
    const groupsWithCurrentNote = Object.keys(this.props.Groups).filter((groupID) => {
      return (this.props.Groups[groupID].notes.includes(this.state.activeNote.id))
    });
    return groupsWithCurrentNote.map((value) => {
      const label = `Group ${this.props.Groups[value].order}`;
      return {label, value};
    });
  }

  getLinkedLeaves = () => {
    const leafsWithCurrentNote = Object.keys(this.props.Leafs).filter((leafID) => {
      return (this.props.Leafs[leafID].notes.includes(this.state.activeNote.id))
    });
    return leafsWithCurrentNote.map((value)=>{
      const label = `Leaf ${this.props.Leafs[value].order}`;
      return {label, value};
    });
  }

  getLinkedSides = () => {
    const rectosWithCurrentNote = Object.keys(this.props.Rectos).filter((rectoID) => {
      return (this.props.Rectos[rectoID].notes.includes(this.state.activeNote.id))
    });
    const versosWithCurrentNote = Object.keys(this.props.Versos).filter((versoID) => {
      return (this.props.Versos[versoID].notes.includes(this.state.activeNote.id))
    });
    const sidesWithCurrentNote = [];
    for (let value of rectosWithCurrentNote){
      const leafOrder = this.props.Leafs[this.props.Rectos[value].parentID].order;
      const label = `Leaf ${leafOrder}: Side Recto}`;
      sidesWithCurrentNote.push({label, value})
    }
    for (let value of versosWithCurrentNote){
      const leafOrder = this.props.Leafs[this.props.Versos[value].parentID].order;
      const label = `Leaf ${leafOrder}: Side Verso}`;
      sidesWithCurrentNote.push({label, value})
    }
    return sidesWithCurrentNote;
  }

  getRectosAndVersos = () => {
    const size = Object.keys(this.props.Rectos).length;
    let result = {};
    for (let i=0; i<size; i++){
      const rectoID = Object.keys(this.props.Rectos)[i];
      const versoID = Object.keys(this.props.Versos)[i];
      result[rectoID] = this.props.Rectos[rectoID]
      result[versoID] = this.props.Versos[versoID]
    }
    return result;
  }


  render() {

    let noteForm;
    if (!this.state.activeNote) {
      noteForm = (
        <NewNoteForm
          Notes={this.props.Notes}
          projectID={this.props.projectID} 
          action={{ addNote: this.props.action.addNote }} 
          noteTypes={this.props.noteTypes}
        />
      );
    } else{
      noteForm = (
        <EditNoteForm 
          action={{ 
            addNote: this.props.action.addNote, 
            updateNote: this.updateNote, 
            deleteNote: this.deleteNote, 
            linkNote: this.linkNote, 
            unlinkNote: this.unlinkNote, 
            linkAndUnlinkNotes: this.linkAndUnlinkNotes 
          }} 
          projectID={this.props.projectID}
          Notes={this.props.Notes}
          note = {this.state.activeNote}
          noteTypes={this.props.noteTypes}
          Groups={this.props.Groups}
          Leafs={this.props.Leafs}
          Rectos={this.props.Rectos}
          Versos={this.props.Versos}
          Sides={this.getRectosAndVersos()}
          linkedGroups={this.getLinkedGroups()}
          linkedLeaves={this.getLinkedLeaves()}
          linkedSides={this.getLinkedSides()}
        />
      );
    }



    return (
      <div className="browse">
        <Drawer 
          open
          containerStyle={{top:"56px",left:"18%", height: "93%",background:"#e5e5e5",boxShadow:"none"}}
          className="notesList"
        >
          <div 
            className={!this.state.activeNote ? "item add active" : "item add"} 
            onClick={()=>this.onItemChange(null)}
          >
            Create new note
            <Add 
              color={!this.state.activeNote ? "#FFFFFF" : "#34A251"} 
              style={{float:"right"}} 
            />
          </div>
          {Object.keys(this.props.Notes).map(this.renderList)}
        </Drawer>
        <div className="details">
          {noteForm}
        </div>
      </div>
    );
  }
  static propTypes = {
    /** Active project ID */
    projectID: PropTypes.string
  }
}
