import React, {Component} from 'react';
import { connect } from "react-redux";
import TopBar from "./TopBar";
import ManageNotes from "../components/notesManager/ManageNotes";
import NoteType from "../components/notesManager/NoteType";
import {Tabs, Tab} from 'material-ui/Tabs';
import Panel from '../components/global/Panel';
import topbarStyle from "../styles/topbar";
import { 
  changeManagerMode,
  changeNotesTab, 
} from "../actions/backend/interactionActions";
import {  
  addNote, 
  updateNote, 
  deleteNote, 
  createNoteType, 
  updateNoteType, 
  deleteNoteType, 
  linkNote, 
  unlinkNote 
} from "../actions/backend/noteActions";
import { sendFeedback } from "../actions/backend/userActions";





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
      },
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({Notes: nextProps.Notes}, ()=>this.applyFilter())
  }

  resizeHandler = () => {
    this.setState({windowWidth:window.innerWidth});
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

  handleAddNote = (note) => {
    const userID = this.props.user.id;
    const date = Date.now().toString();
    const IDHash = userID + date;
    note["id"] = IDHash.substr(IDHash.length - 24);
    this.props.addNote(note)
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
                    addNote: this.handleAddNote, 
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
                  groupIDs={this.props.groupIDs}
                  leafIDs={this.props.leafIDs}
                  rectoIDs={this.props.rectoIDs}
                  versoIDs={this.props.versoIDs}
                  togglePopUp={this.props.togglePopUp} 
                  tabIndex={this.props.popUpActive?-1:0}
                  windowWidth={this.state.windowWidth}
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

    let sidebarClasses = "sidebar";
    if (this.props.popUpActive) sidebarClasses += " lowerZIndex";

    const sidebar = (
      <div className={sidebarClasses} role="region" aria-label="sidebar">
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
          <button
            className={ this.props.managerMode==="imageManager" ? "manager active" : "manager" }        
            onClick={() => this.props.changeManagerMode("imageManager")} 
            tabIndex={this.props.popUpActive?-1:0}
            aria-label="Image Manager"
          >
            Images
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
          popUpActive={this.props.popUpActive}
          windowWidth={this.state.windowWidth}
        >
          <Tabs 
            tabItemContainerStyle={{backgroundColor: '#ffffff'}}
            value={this.props.activeTab} 
            onChange={(v)=>this.props.changeNotesTab(v)}
          >
            <Tab label="Manage notes" value="MANAGE" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0} />
            <Tab label="Edit note types" value="TYPES" buttonStyle={topbarStyle().tab} tabIndex={this.props.popUpActive?-1:0} />
          </Tabs>
        </TopBar>
        {sidebar}
        <div className="notesWorkspace">
          {content}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    projectID: state.active.project.id,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
    rectoIDs: state.active.project.rectoIDs,
    versoIDs: state.active.project.versoIDs,
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
      if (linkObjects.length > 0) {
        dispatch(linkNote(noteID, linkObjects))
      }
      if (unlinkObjects.length > 0) {
        dispatch(unlinkNote(noteID, unlinkObjects))
      }
    },
    sendFeedback: (title, message, userID) => {
      dispatch(sendFeedback(title, message, userID))
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(NotesManager);
