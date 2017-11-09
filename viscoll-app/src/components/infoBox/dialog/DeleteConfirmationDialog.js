import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

/** Delete confirmation dialog for deleting group(s) and leaf(s) */
export default class DeleteConfirmationDialog extends React.Component {
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

  containsTacketedLeaf = () => {
    if (this.props.memberType==="Leaf") {
      for (const leafID of this.props.selectedObjects) {
        if (this.props.Groups[this.props.Leafs[leafID].parentID].tacketed===leafID)
        return true;
      }
    }
    return false;
  }

  /**
   * Generate text depending of the type and number of selected object(s) 
   * @public
   */
  getTitle = () => {
    const memberType = this.props.memberType;
    const item = this.props[memberType+"s"][this.props.selectedObjects[0]];
    if (item){
      if (this.containsTacketedLeaf()) {
        if (this.props.selectedObjects.length>1) {
          return "One of the selected leaves is tacketed. You cannot delete tacketed leaves.";
        } else {
          return "You cannot delete a leaf that is tacketed.";
        }
      } else if (this.props.selectedObjects.length===1) {
        return "Are you sure you want to delete " + item.memberType.toLowerCase() + " " + item.order + "?";
      } else {
        return "Are you sure you want to delete " + 
        this.props.selectedObjects.length + " " + item.memberType.toLowerCase() + "s?";
      }
    }

  }

  /**
   * Submit delete request and close dialog 
   * @public
   */
  submit = () => {
    if (this.props.selectedObjects.length===1) {
      // handle single delete
      let id = this.props.selectedObjects[0]
      this.props.action.singleDelete(id);
    } else {
      // handle batch delete
      const memberType = this.props.memberType.toLowerCase();
      let data = {};
      data[memberType+"s"]= [];
      for (var id of this.props.selectedObjects) {
        data[memberType+"s"].push(id);
      }
      this.props.action.batchDelete(data);
    }
    this.handleClose();
  }

  render() {
    const actions = [
      <FlatButton
        label={this.containsTacketedLeaf()?"Okay":"Cancel"}
        primary
        onTouchTap={this.handleClose}
      />,
      <RaisedButton
        label="Yes, delete"
        keyboardFocused
        onTouchTap={this.submit}
        backgroundColor="#D87979"
        labelColor="#ffffff" 
        style={this.containsTacketedLeaf()?{display:"none"}:{}}
      />,
    ];

    return (
      <div>
        <RaisedButton 
          label="Delete" 
          fullWidth={this.props.fullWidth} 
          onTouchTap={this.handleOpen} 
          style={this.props.fullWidth? {} : {width:"49%"}}
          backgroundColor="#D87979"
          labelColor="#ffffff"          
        />
        <Dialog
          title={this.getTitle()}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
        </Dialog>
      </div>
    );
  }
  static propTypes = {
    /** `true` to have the Delete button span the whole width of its parent container */
    fullWidth: PropTypes.bool,
    /** Dictionary of actions */
    action: PropTypes.object,
    /** Dictionary of selected objects to delete */
    selectedObjects: PropTypes.arrayOf(PropTypes.string),
  }
}
