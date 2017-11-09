import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions} from 'material-ui/Card';
import AddManifest from './AddManifest';
import EditManifest from './EditManifest';
import DeleteManifest from './DeleteManifest';
import ImageViewer from "../global/ImageViewer";
import Dialog from 'material-ui/Dialog';

class ManageManifests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editOpen: false,
      deleteOpen: false,
      openManifest: {id: "", name: "", url: ""},
      imageModalOpen: false,
      activeImage: null
    };
  }
  handleOpen = (name, openManifest) => {
    this.setState({[name]: true, openManifest});
  };

  handleClose = (name) => {
    this.setState({[name]: false});
  };

  toggleImageModal = (imageModalOpen, activeImage) => {  
    this.setState({imageModalOpen, activeImage})
  }

  renderManifest = (manifestID) => {
    const manifest = this.props.manifests[manifestID]
    return (
      <div key={manifestID}>
        <Card>
          <div className="manifestCard">
            <div className="text">
              {manifest.name}
              <br />
              <span>{manifest.url}</span>

            </div>
            <div className="thumbnails">
                {manifest.images.slice(0,4).map((img) => (
                  <div key={img.url} style={{display:"inline-block", marginLeft: 10}}>
                    <img 
                      src={img.url+"/full/40,/0/default.jpg"} 
                      alt={"Thumbnail of "+img.label} 
                      onClick={()=>this.toggleImageModal(true, img.url)}
                      style={{cursor: "pointer"}}
                      width="40px"
                    />
                  </div>
                ))}
            </div>
          </div>
            <CardActions style={{clear:"both", textAlign:"left"}}>
              <FlatButton label="Edit" onClick={()=>this.handleOpen("editOpen", manifest)} />
              <FlatButton label="Delete" onClick={()=>this.handleOpen("deleteOpen", manifest)} />
            </CardActions>
        </Card>
      <br/>
      </div>
    )
  }


  render() {
    return (
      <div className="manageManifests">
        <AddManifest 
          manifests={this.props.manifests}
          createManifest={this.props.createManifest}
          createManifestError={this.props.createManifestError}
          cancelCreateManifest={this.props.cancelCreateManifest}
        />
        <EditManifest 
          open={this.state.editOpen} 
          handleClose={()=>this.handleClose("editOpen")} 
          manifest={this.state.openManifest} 
          updateManifest={this.props.updateManifest}
          manifests={this.props.manifests}
        />
        <DeleteManifest 
          open={this.state.deleteOpen} 
          handleClose={()=>this.handleClose("deleteOpen")}
          deleteManifest={()=>this.props.deleteManifest({manifest: {id: this.state.openManifest.id}})} 
        />
        <h2>Current Manifests</h2>
        {Object.keys(this.props.manifests).map(this.renderManifest)}
        <Dialog
          modal={false}
          open={this.state.imageModalOpen}
          onRequestClose={()=>this.toggleImageModal(false)}
          contentStyle={{background: "none", boxShadow: "inherit"}}
          bodyStyle={{padding:0}}
        >
          <ImageViewer rectoURL={this.state.activeImage} />
        </Dialog>
      </div>
    );
  }
}
export default ManageManifests;