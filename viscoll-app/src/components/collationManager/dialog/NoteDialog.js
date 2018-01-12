import React from 'react';
import EditNoteForm from '../../notesManager/EditNoteForm';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class NoteDialog extends React.Component {


  getLinkedGroups = () => {
    const groupsWithCurrentNote = Object.keys(this.props.Groups).filter((groupID) => {
      return (this.props.Groups[groupID].notes.includes(this.props.activeNote.id))
    });
    return groupsWithCurrentNote.map((value) => {
      const label = `Group ${this.props.groupIDs.indexOf(value)+1}`;
      return {label, value};
    });
  }

  getLinkedLeaves = () => {
    const leafsWithCurrentNote = Object.keys(this.props.Leafs).filter((leafID) => {
      return (this.props.Leafs[leafID].notes.includes(this.props.activeNote.id))
    });
    return leafsWithCurrentNote.map((value)=>{
      const label = `Leaf ${this.props.leafIDs.indexOf(value)+1}`;
      return {label, value};
    });
  }

  getLinkedSides = () => {
    const rectosWithCurrentNote = Object.keys(this.props.Rectos).filter((rectoID) => {
      return (this.props.Rectos[rectoID].notes.includes(this.props.activeNote.id))
    });
    const versosWithCurrentNote = Object.keys(this.props.Versos).filter((versoID) => {
      return (this.props.Versos[versoID].notes.includes(this.props.activeNote.id))
    });
    const sidesWithCurrentNote = [];
    for (let value of rectosWithCurrentNote){
      const leafOrder = this.props.leafIDs.indexOf(this.props.Rectos[value].parentID) + 1;
      const label = `L${leafOrder} Recto (${this.props.Rectos[value].folio_number})`;
      sidesWithCurrentNote.push({label, value})
    }
    for (let value of versosWithCurrentNote){
      const leafOrder = this.props.leafIDs.indexOf(this.props.Versos[value].parentID) + 1;
      const label = `L${leafOrder} Verso (${this.props.Versos[value].folio_number})`;
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
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.props.closeNoteDialog}
      />,
    ];
    return (
      <Dialog 
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.closeNoteDialog}
        autoScrollBodyContent
        contentStyle={{width:500}}
      >
        <EditNoteForm 
          action={{ 
            addNote: this.props.action.addNote, 
            updateNote: this.props.action.updateNote, 
            deleteNote: this.props.action.deleteNote, 
            linkNote: this.props.action.linkNote, 
            unlinkNote: this.props.action.unlinkNote,
            linkAndUnlinkNotes: this.props.action.linkAndUnlinkNotes,
          }} 
          projectID={this.props.projectID}
          Notes={this.props.Notes}
          note = {this.props.activeNote}
          createErrors={this.props.createErrors} 
          updateErrors={this.props.updateErrors} 
          noteTypes={this.props.noteTypes}
          Groups={this.props.Groups}
          Leafs={this.props.Leafs}
          Rectos={this.props.Rectos}
          Versos={this.props.Versos}
          Sides={this.getRectosAndVersos()}
          linkedGroups={this.getLinkedGroups()}
          linkedLeaves={this.getLinkedLeaves()}
          linkedSides={this.getLinkedSides()}
          isReadOnly={this.props.isReadOnly}
          groupIDs={this.props.groupIDs}
          leafIDs={this.props.leafIDs}
          rectoIDs={this.props.rectoIDs}
          versoIDs={this.props.versoIDs}
        />
      </Dialog>
    );
  }

}




