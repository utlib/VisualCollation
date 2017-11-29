import React, {Component} from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import TopBar from "./TopBar";
import ManageNotes from "../components/notesManager/ManageNotes";
import NoteType from "../components/notesManager/NoteType";
import {Tabs, Tab} from 'material-ui/Tabs';
import Panel from '../components/global/Panel';
import topbarStyle from "../styles/topbar";
import { 
  changeManagerMode,
  changeNotesTab, 
} from "../actions/editCollation/interactionActions";
import {  
  addNote, 
  updateNote, 
  deleteNote, 
  createNoteType, 
  updateNoteType, 
  deleteNoteType, 
  linkNote, 
  unlinkNote 
} from "../actions/editCollation/modificationActions";
import { sendFeedback } from "../actions/userActions";

class NotesManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      Notes: props.Notes,
      value: "",
      filterTypes: {
        title: true,
        type: true,
        description: true,
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({Notes: nextProps.Notes}, ()=>this.applyFilter())
  }

  applyFilter = () => {
    this.filterNotes(this.state.value, this.state.filterTypes);
  }

  onValueChange = (e, value) => {
    this.setState({value}, ()=>this.applyFilter())
  }

  onTypeChange = (type, checked) => {
    this.setState({filterTypes: {...this.state.filterTypes, [type]: checked}}, () => this.applyFilter())
  }


  filterNotes = (value, filterTypes) => {
    if (value==="") {
      this.setState({Notes: this.props.Notes});
    } else {
      let filteredNotes = {};
      let isNoneSelected = true;
      for (let type of Object.keys(filterTypes)) {
        if (filterTypes[type]){
          isNoneSelected = false;
          break;
        }
      }
      if (isNoneSelected)
        filterTypes = {title: true, type: true, description: true};
      for (let noteID in this.props.Notes) {
        const note = this.props.Notes[noteID]
        for (let type of Object.keys(filterTypes)) {
          if (filterTypes[type] && note[type].toUpperCase().includes(value.toUpperCase()))
            if (filteredNotes[noteID])
              break;
            else
              filteredNotes[noteID] = note;
        }
      };
      this.setState({Notes: filteredNotes});
    }

  }

  /**
   * Toggle notes filter panel
   * @public
   */
  toggleFilterDrawer = () => {
    this.setState({filterOpen: !this.state.filterOpen});
  }

  updateNote = (noteID, note) => {
    this.props.updateNote(noteID, note, this.props);
  }

  linkNote = (noteID, object) => {
    this.props.linkNote(noteID, object, this.props);
  }

  unlinkNote = (noteID, object) => {
    this.props.unlinkNote(noteID, object, this.props);
  }

  linkAndUnlinkNotes = (noteID, linkObjects, unlinkObjects) => {
    this.props.linkAndUnlinkNotes(noteID, linkObjects, unlinkObjects, this.props);
  }

  render() {
    let content = "";

    if (this.props.activeTab==="MANAGE") {
      content = <ManageNotes 
                  action={{ 
                    updateNote: this.updateNote, 
                    addNote: this.props.addNote, 
                    deleteNote: this.props.deleteNote, 
                    linkNote: this.linkNote, 
                    unlinkNote: this.unlinkNote, 
                    linkAndUnlinkNotes: this.linkAndUnlinkNotes 
                  }} 
                  projectID={this.props.projectID} 
                  notification={this.props.notification}
                  noteTypes={this.props.noteTypes}
                  Notes={this.state.Notes}
                  Groups={this.props.Groups}
                  Leafs={this.props.Leafs}
                  Rectos={this.props.Rectos}
                  Versos={this.props.Versos}
                  togglePopUp={this.props.togglePopUp} 
                  tabIndex={this.props.popUpActive?-1:0}
                />
    } else if (this.props.activeTab==="TYPES") {
      content = <NoteType 
                  Notes={this.state.Notes}
                  projectID={this.props.projectID} 
                  noteTypes={this.props.noteTypes}
                  action={{
                    createNoteType: this.props.createNoteType, 
                    updateNoteType: this.props.updateNoteType, 
                    deleteNoteType: (noteTypes)=>this.props.deleteNoteType(noteTypes, this.props) }}
                  togglePopUp={this.props.togglePopUp} 
                  tabIndex={this.props.popUpActive?-1:0}
                />
    }

    const sidebar = (
      <div className="sidebar" role="region" aria-label="sidebar">
        <hr />  
        <Panel title="Managers" defaultOpen={true} noPadding={true} tabIndex={this.props.popUpActive?-1:0}>
          <button
            className={ this.props.managerMode==="collationManager" ? "manager active" : "manager" }        
            onClick={() => this.props.changeManagerMode("collationManager")} 
            aria-label="Collation Manager"
            tabIndex={this.props.popUpActive?-1:0}
          >
            Collation
          </button>
          <button
            className={ this.props.managerMode==="notesManager" ? "manager active" : "manager" }        
            onClick={() => this.props.changeManagerMode("notesManager")} 
            aria-label="Notes Manager"
            tabIndex={this.props.popUpActive?-1:0}
          >
            Notes
          </button>
        </Panel>
      </div>
    );

    return (
      <div className="notesManager">
        <TopBar 
          notesFilter={this.props.activeTab==="MANAGE"} 
          filterNotes={this.filterNotes}
          onValueChange={this.onValueChange}
          onTypeChange={this.onTypeChange}
          filterTypes={this.state.filterTypes}
          history={this.props.history}
          tabIndex={this.props.popUpActive?-1:0}
        >
          <Tabs 
            tabItemContainerStyle={{backgroundColor: '#ffffff'}}
            value={this.props.activeTab} 
            onChange={(v)=>this.props.changeNotesTab(v)}
          >
            <Tab label="Manage notes" value="MANAGE" buttonStyle={topbarStyle.tab} tabIndex={this.props.popUpActive?-1:0} />
            <Tab label="Edit note types" value="TYPES" buttonStyle={topbarStyle.tab} tabIndex={this.props.popUpActive?-1:0} />
          </Tabs>
        </TopBar>
        {sidebar}
        <div className="notesWorkspace">
          {content}
        </div>
      </div>
    )
  }
  static propTypes = {
    /** Current tab in notes manager */
    activeTab: PropTypes.string,
    /** Active project ID */
    projectID: PropTypes.string,
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    projectID: state.active.project.id,
    Groups: state.active.project.Groups,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    Notes: state.active.project.Notes,
    noteTypes: state.active.project.noteTypes,
    activeTab: state.active.notesManager.activeTab,
    notesManager: state.active.notesManager,
    managerMode: state.active.managerMode,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    changeManagerMode: (managerMode) => {
      dispatch(changeManagerMode(managerMode));
    },
    changeNotesTab: (tabName) => {
      dispatch(changeNotesTab(tabName));
    },
    addNote: (note) => {
      dispatch(addNote(note))
    },
    updateNote: (noteID, note, props) => {
      dispatch(updateNote(noteID, note))
    },
    deleteNote: (noteID) => {
      dispatch(deleteNote(noteID));
    },
    createNoteType: (noteType) => {
      dispatch(createNoteType(noteType));
    },
    updateNoteType: (noteType) => {
      dispatch(updateNoteType(noteType));
    },
    deleteNoteType: (noteType, props) => {
      dispatch(deleteNoteType(noteType))
    },
    linkNote: (noteID, object, props) => {
      dispatch(linkNote(noteID, object))
    },
    unlinkNote: (noteID, object, props) => {
      dispatch(unlinkNote(noteID, object))
    },
    linkAndUnlinkNotes: (noteID, linkObjects, unlinkObjects, props) => {
      if (linkObjects.length > 0 && unlinkObjects.length > 0){
        dispatch(linkNote(noteID, linkObjects))
        .then((action) => {
          dispatch(unlinkNote(noteID, unlinkObjects))
        })
      }
      else if (linkObjects.length > 0) {
        dispatch(linkNote(noteID, linkObjects))
      }
      else if (unlinkObjects.length > 0) {
        dispatch(unlinkNote(noteID, unlinkObjects))
      }
    },
    sendFeedback: (title, message, userID) => {
      dispatch(sendFeedback(title, message, userID))
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(NotesManager);
