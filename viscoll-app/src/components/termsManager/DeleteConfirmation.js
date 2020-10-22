import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import IconDelete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';

/** Delete confirmation dialog for deleting terms and term taxonomies */
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
    if (this.props.item==="term") {
      this.props.action.deleteTerm(this.props.termID);
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
              aria-label={"Delete term"}
              label="Delete term"
              onClick={this.handleOpen} 
              backgroundColor="#b53c3c"
              labelColor="#ffffff"
              tabIndex={this.props.tabIndex}
            />
          </div>
    let message = "This term will be removed from all groups/sides/leaves that have this term.";
    if (this.props.item==="taxonomy") {
      deleteIcon = <IconButton
                      aria-label={"Delete " + this.props.itemName + " taxonomy"}
                      onClick={this.handleOpen}
                      tooltip={"Delete " + this.props.itemName}
                      tabIndex={this.props.tabIndex}
                    >
                      <IconDelete 
                        color="#969696"
                        hoverColor="#4a4a4a"
                      />
                    </IconButton >
      message = "Any existing terms associated with this term taxonomy will be assigned to the taxonomy 'Unknown'.";
    }
    if (this.props.item!=="") {
      return (
        <div style={this.props.item==="taxonomy"?{float:"right"}:{}}>
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