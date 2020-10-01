import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';

/** Delete confirmation dialog for deleting notes and note types */
export default class DeleteConfirmation extends React.Component {
  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({open: true});
    this.props.togglePopUp(true);
  };

  handleClose = () => {
    this.setState({open: false});
    this.props.togglePopUp(false);
  };

  submit = () => {
    if (this.props.item==="note") {
      this.props.action.deleteNote(this.props.noteID);
    } else {
      this.props.onDelete(this.props.index)
    }
    this.handleClose();
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary
        onClick={this.handleClose}
        keyboardFocused
      />,
      <RaisedButton
        label="Yes, delete"
        onClick={this.submit}
        backgroundColor="#b53c3c"
        labelColor="#ffffff"          
      />,
    ];
    let deleteIcon = <div style={{paddingTop: 50}} >
            <RaisedButton 
              aria-label={"Delete note"}
              label="Delete note" 
              onClick={this.handleOpen} 
              backgroundColor="#b53c3c"
              labelColor="#ffffff"
              tabIndex={this.props.tabIndex}
            />
          </div>
    let message = "This note will be removed from all groups/sides/leaves that have this note.";
    if (this.props.item==="note type") {
      deleteIcon = <IconButton
                      aria-label={"Delete " + this.props.itemName + " note type"}
                      onClick={this.handleOpen}
                      tooltip={"Delete " + this.props.itemName}
                      tabIndex={this.props.tabIndex}
                    >
                      <IconDelete 
                        color="#969696"
                        hoverColor="#4a4a4a"
                      />
                    </IconButton >
      message = "Any existing notes associated with this note type will be assigned to the note type 'Unknown'.";
    }
    if (this.props.item!=="") {
      return (
        <div style={this.props.item==="note type"?{float:"right"}:{}}>
          {deleteIcon}
          <Dialog
            title={"Are you sure you want to delete this " + this.props.item + "?"}
            actions={actions}
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleClose}
          >
          {message}
          </Dialog>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}