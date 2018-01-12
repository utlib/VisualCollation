import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

export default class RemveImageConfirmation extends React.Component {

  submit = () => {
    if (this.props.actionType==="delete") {
      this.props.deleteImages(this.props.imgs.map((img)=>img.id));
    } else {
      this.props.unlinkImages(this.props.imgs.map((img)=>img.id));
    }
    this.props.toggleConfirmation("");
  }
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={()=>this.props.toggleConfirmation("")}
      />,
      <RaisedButton
        label={"Yes, " + this.props.actionType}
        keyboardFocused={true}
        onClick={this.submit}
        backgroundColor="#b53c3c"
        labelColor="#ffffff"
      />,
    ];
    let title, message;
    if (this.props.numToRemove===1) {
      title = "Are you sure you want to " + this.props.actionType + " " + this.props.imgs[0].label + "?";
      if (!this.props.collectionsMode && this.props.actionType==="hide") {
        message = "You can add the image back to this project again by switching to 'view all images'.";
      } else if (!this.props.collectionsMode && this.props.actionType==="delete") {
        message = "If this image is used in other projects, deleting this image will remove it from other projects as well.";
      } else if (this.props.actionType==="delete") {
        message = "Deleting this image will remove it from all projects that it is linked to.";
      }
    } else {
      // Multiple images to remove
      title = "Are you sure you want to " + this.props.actionType + " " + this.props.numToRemove + " images?"
      if (!this.props.collectionsMode && this.props.actionType==="hide") {
        message = "You can add the images back to this project again by switching to 'view all images'.";
      } else if (!this.props.collectionsMode && this.props.actionType==="delete") {
        message = "If these images are used in other projects, deleting these images will remove them from other projects as well.";
      } else if (this.props.actionType==="delete") {
        message = "Deleting these images will remove them from all the projects that they are linked to.";
      }
    }
    return (
      <div>
        <Dialog
          title={title}
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={()=>this.props.toggleConfirmation("")}
        >
          { message }
        </Dialog>
      </div>
    );
  }
}