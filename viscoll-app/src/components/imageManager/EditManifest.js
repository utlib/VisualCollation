import React, {Component} from 'react';
import RemoveImageConfirmation from './RemoveImageConfirmation';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import IconDelete from 'material-ui/svg-icons/action/delete-forever';
import IconHide from 'material-ui/svg-icons/action/visibility-off';
import IconAdd from 'material-ui/svg-icons/content/add';
import VirtualList from 'react-tiny-virtual-list';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import IconFilter from 'material-ui/svg-icons/content/filter-list';

/** Dialog to edit manifest name */
export default class EditManifest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.manifest? props.manifest.name:"",
      nameError: "",
      confirmationOpen: "",
      activeImg: "",
      filter:{value:"this", text:"Viewing images in this project"},
      filterOpen: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.manifest) {
      this.setState({name: nextProps.manifest.name})
    }
  }

  toggleConfirmation = (value) => {
    this.setState({confirmationOpen:value});
  }

  onChange = (type, value) => {
    this.setState({[type]: value}, ()=>{this.runValidation()})
  }

  onSubmit = (e) => {
    e.preventDefault();
    const manifest = {id: this.props.manifest.id, name: this.state.name.trim()}
    this.setState({name: ""}, ()=>{
      this.props.action.updateManifest({manifest});
      this.props.handleClose();
    })
  }

  onCancel = (e) => {
    this.setState({name: ""})
  }

  runValidation = () => {
    for (const manifestID in this.props.manifests){
      const manifest = this.props.manifests[manifestID];
      if (manifestID!==this.props.manifest.id && manifest.name===this.state.name.trim()){
        this.setState({nameError: `Manifest with name: ${manifest.name} already exists.`});
        return;
      } else if (this.state.name.length>51) {
        this.setState({nameError: `Manifest name must be under 50 characters.`});
        return;
      }
    }
    // No validation errors
    this.setState({nameError: ""});
  }

  isValid = () => {
    return (this.state.nameError==="" && this.state.name!=="" && this.props.manifest.name!==this.state.name.trim())
  }

  handleFilterClick = (e) => {
    e.preventDefault(); // Prevent ghost click
    this.setState({
      filterOpen: true,
      anchorEl: e.currentTarget,
    });
  }

  handleFilterChoice = (value, text) => {
    this.setState({
      filter: {value, text},
      filterOpen: false,
    })
  }

  renderImageTile = (index, style, images) => {
    const img = images[index];
    let projectCountText = "";
    if (img.projectIDs) {
      const inCurrentProject = img.projectIDs.includes(this.props.projectID);
      if (img.projectIDs.length===1 && inCurrentProject) {
        projectCountText = "In current project";
      } else if (img.projectIDs.length===1) {
        projectCountText = "In 1 project";
      } else {
        if (inCurrentProject) {
          const plural = (img.projectIDs.length-1)>1?"s":"";
          projectCountText = "In current project and " + (img.projectIDs.length-1) + " other project" + plural;
        } else {
          projectCountText = "In " + img.projectIDs.length + " projects";
        }
      }
    }
    if (img) {
      return <div key={"imgTile"+img.label} style={{borderBottom:"1px solid #f2f2f2", ...style}}>
        <div style={{height:"100%", display:"flex", alignItems:"center", overflow:"hidden"}}>
          <div>
            <img 
              src={img.url} 
              alt={"Thumbnail of "+img.label}
              width="100px"
            />
          </div>
          <div style={{paddingLeft:"1em"}}>
            <h2 style={{color:"#4e4e4e", margin:0,padding:0, maxWidth:"400px", overflowX:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis"}}>{img.label}</h2>
            {projectCountText}
          </div>
          <div style={{paddingLeft:"1em"}}>
            <IconButton
              aria-label={"Link " + img.label + " to project"}
              tooltip={img.projectIDs && img.projectIDs.findIndex((projectID)=>projectID===this.props.projectID)>=0?"":"Link image to project"}
              iconStyle={{color:"8b8b8b"}}
              style={(img.manifestID===this.props.manifest.id)||(img.projectIDs && img.projectIDs.findIndex((projectID)=>projectID===this.props.projectID)>=0)?{display:"none"}:{width:"40px",padding:0}}
              onClick={()=>this.props.action.linkImages([img.id])}
            >
              <IconAdd />
            </IconButton>
            <IconButton
              aria-label={"Unlink " + img.label + " from this project"}
              tooltip={"Unlink image from this project"}
              iconStyle={{color:"8b8b8b"}}
              style={img.manifestID===this.props.manifest.id?{width:"40px",padding:0}:{display:"none"}}
              onClick={()=>{this.setState({confirmationOpen:"hide", activeImg:img})}}
            >
              <IconHide />
            </IconButton>
            <IconButton
              aria-label={"Delete " + img.label}
              tooltip={"Delete image"}
              iconStyle={{color:"8b8b8b"}}
              onClick={()=>{
                this.setState({confirmationOpen:"delete", activeImg:img})
              }}
              style={{width:"40px",padding:0}}
            >
              <IconDelete />
            </IconButton>
            </div>
        </div>
      </div>
    } else {
      return <div></div>
    }
  }

  render() {
    const editName = <form className="form" onSubmit={(e)=>this.onSubmit(e)}>
      <div className="row">
        <div className="label" id="manifestNameLabel">Manifest name</div>
        <div className="input">
          <TextField 
            id="name"
            aria-labelledby="manifestNameLabel" 
            value={this.state.name}
            errorText={this.state.nameError}
            onChange={(e,v)=>this.onChange("name", v)}
            fullWidth
            autoFocus
          />
        </div>
      </div>
    </form>

    if (this.props.open) {
      const actions = [
        <FlatButton
          label={this.props.manifest.id.includes("DIY")?"Close":"Cancel"}
          primary={true}
          onClick={this.props.handleClose}
        />,
        <RaisedButton
          label="Submit"
          primary={true}
          disabled={!this.isValid()}
          type="submit"
          onClick={this.onSubmit}
          style={this.props.manifest.id.includes("DIY")?{display:"none"}:{}}
        />,
      ];
      let images = this.props.manifest.images;
      if (this.state.filter.value==="all") {
        images = this.props.images;
      }

      return (
        <div>
          <Dialog
            actions={actions}
            modal={false}
            open={this.props.open}
            onRequestClose={this.props.handleClose}
            bodyStyle={{overflowX:"hidden"}}
            autoScrollBodyContent={false}
            autoDetectWindowHeight
          >
          <h1>{this.props.manifest.id.includes("DIY")? "Edit images":"Edit manifest"}</h1>
          <div className="imageManager">
            {this.props.manifest.id.includes("DIY")?
              <div>
                <div style={{textAlign:"right",borderBottom:"1px solid #dddddd",}}>
                  <RaisedButton 
                    label={this.state.filter.text}
                    onClick={this.handleFilterClick}
                    style={{boxShadow:"none"}}
                    icon={<IconFilter style={{height:15}}/>}
                  />
                    <Popover
                      open={this.state.filterOpen}
                      anchorEl={this.state.anchorEl}
                      anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                      targetOrigin={{horizontal: 'left', vertical: 'top'}}
                      onRequestClose={()=>this.setState({filterOpen: false})}
                    >
                      <Menu>
                        <MenuItem onClick={()=>this.handleFilterChoice("this", "Viewing images in this project")} primaryText="View images in this project" />
                        <MenuItem onClick={()=>this.handleFilterChoice("all", "Viewing all images")} primaryText="View all images" />
                      </Menu>
                    </Popover>
                </div>
                <VirtualList
                  width='100%'
                  height='60vh'
                  itemSize={100}
                  itemCount={images.length}
                  renderItem={({index, style}) => this.renderImageTile(index, style, images)}
                  overscanCount={10}
                  estimatedItemSize={400}
                />
              </div>
              :
              editName
            }
            </div>
          </Dialog>
          <RemoveImageConfirmation
            open={this.state.confirmationOpen.length>0} 
            toggleConfirmation={this.toggleConfirmation}
            deleteImages={this.props.action.deleteImages}
            unlinkImages={this.props.action.unlinkImages}
            imgs={this.state.activeImg?[{label:this.state.activeImg.label, id:this.state.activeImg.url.split("/").pop().split("_")[0]}]:[{id:"",label:""}]}
            actionType={this.state.confirmationOpen}
            numToRemove={1}
          />
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}