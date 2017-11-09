import React from 'react';
import PropTypes from 'prop-types';
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
  /**
   * Open the dialog 
   * @public
   */
  handleOpen = () => {
    this.setState({open: true});
  };
  /**
   * Close the dialog 
   * @public
   */
  handleClose = () => {
    this.setState({open: false});
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
        onTouchTap={this.handleClose}
      />,
      <RaisedButton
        label="Yes, delete"
        keyboardFocused
        onTouchTap={this.submit}
        backgroundColor="#D87979"
        labelColor="#ffffff"          
      />,
    ];
    let deleteIcon = <div style={{paddingTop: 50}} >
            <RaisedButton 
              label="Delete note" 
              onTouchTap={this.handleOpen} 
              backgroundColor="#D87979"
              labelColor="#ffffff"       
            />
          </div>
    let message = "This note will be removed from all groups/sides/leaves that have this note.";
    if (this.props.item==="note type") {
      deleteIcon = <IconButton
                      onTouchTap={this.handleOpen}
                    >
                      <IconDelete 
                        color="#ddd"
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
  static propTypes = {
    /** `true` to have the Delete button span the whole width of its parent container */
    fullWidth: PropTypes.bool,
    /** Dictionary of actions */
    action: PropTypes.object,
    /** Dictionary of selected objects to delete */
    selectedObjects: PropTypes.object,
  }
}