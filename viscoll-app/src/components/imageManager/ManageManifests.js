import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions} from 'material-ui/Card';
import AddManifest from './AddManifest';
import EditManifest from './EditManifest';
import DeleteManifest from './DeleteManifest';
import ImageViewer from "../global/ImageViewer";
import Dialog from 'material-ui/Dialog';

/** Manage Images page */
export default class ManageManifests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editOpen: false,
      deleteOpen: false,
      activeManifestID: "",
      imageModalOpen: false,
      activeImage: {manifestID:"",}
    };
  }
  handleOpen = (name, manifestID) => {
    this.setState({[name]: true, activeManifestID:manifestID});
    this.props.togglePopUp(true);
  };

  handleClose = (name) => {
    this.setState({[name]: false});
    this.props.togglePopUp(false);
  };

  toggleImageModal = (imageModalOpen, activeImage) => {  
    this.setState({imageModalOpen, activeImage});
    this.props.togglePopUp(imageModalOpen);
  }

  renderManifestCard = (manifestID) => {
    const manifest = this.props.manifests[manifestID]
    return (
      <div key={manifestID}>
        <Card>
          <div className="manifestCard">
            <div className="text">
              <h2>{manifest.name}</h2>
              <span>{manifest.url}</span>
            </div>
            <div className="thumbnails">
                {manifest.images.slice(0,4).map((img) => (
                  <button 
                    key={img.url} 
                    style={{display:"inline-block", marginLeft: 10, border:0,background:"none",padding:0}} 
                    onClick={()=>this.toggleImageModal(true, img)}
                    tabIndex={this.props.tabIndex}
                  >
                    <img 
                      src={img.manifestID.includes("DIY")? img.url : img.url+"/full/40,/0/default.jpg"}
                      alt={"Thumbnail of "+img.label} 
                      style={{cursor: "pointer"}}
                      width="40px"
                    />
                  </button>
                ))}
            </div>
          </div>
            <CardActions style={{clear:"both", textAlign:"left"}}>
              <FlatButton 
                label="Edit" 
                onClick={()=>this.handleOpen("editOpen", manifestID)} 
                tabIndex={this.props.tabIndex}
              />
              <FlatButton 
                label="Delete" 
                onClick={()=>this.handleOpen("deleteOpen", manifestID)} 
                tabIndex={this.props.tabIndex}
                disabled={manifest.id.includes("DIY")}
              />
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
          action = {{
            uploadImages: this.props.action.uploadImages,
            createManifest:this.props.action.createManifest,
            cancelCreateManifest:this.props.action.cancelCreateManifest,
          }}
          createManifestError={this.props.createManifestError}
          images={this.props.images}
          tabIndex={this.props.tabIndex}
        />
        <EditManifest 
          open={this.state.editOpen} 
          handleClose={()=>this.handleClose("editOpen")} 
          manifest={this.props.manifests[this.state.activeManifestID]}
          manifests={this.props.manifests}
          images={this.props.images}
          projectID={this.props.projectID}
          action={{
            updateManifest: this.props.action.updateManifest,
            linkImages: this.props.action.linkImages,
            unlinkImages: this.props.action.unlinkImages,
            deleteImages: this.props.action.deleteImages,
          }}
        />
        <DeleteManifest 
          open={this.state.deleteOpen} 
          handleClose={()=>this.handleClose("deleteOpen")}
          deleteManifest={()=>this.props.action.deleteManifest({manifest: {id: this.state.activeManifestID}})} 
        />
        <br />
        <h1>Image collections</h1>
        {this.props.manifests? Object.keys(this.props.manifests).map(this.renderManifestCard) : "" }
        <Dialog
          modal={false}
          open={this.state.imageModalOpen}
          onRequestClose={()=>this.toggleImageModal(false)}
          contentStyle={{background: "none", boxShadow: "inherit"}}
          bodyStyle={{padding:0}}
        >
          {this.state.activeImage?
          <ImageViewer
            isRectoDIY={this.state.activeImage.manifestID.includes("DIY")}
            rectoURL={this.state.activeImage.url}
          />:""}
        </Dialog>
      </div>
    );
  }
}
