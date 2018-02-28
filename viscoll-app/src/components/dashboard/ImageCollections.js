import React, {Component} from 'react';
import { Grid } from 'react-virtualized';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ChipInput from 'material-ui-chip-input'
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import IconFilter from 'material-ui/svg-icons/content/filter-list';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import RemoveImageConfirmation from '../imageManager/RemoveImageConfirmation';
import UploadImages from '../imageManager/UploadImages';
import { btnBase } from '../../styles/button';

/** Image collection page in dashboard section */
class ImageCollection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnCount: 3,
      selectedImages: props.images? props.images.map((image)=>false):[],
      filterOpen: false,
      filter: {value:"all", text:"Show all images"},
      removeConfirmationOpen: "",
      windowWidth: window.innerWidth,
      gridWidth: window.innerWidth*0.50,
      gridHeight: window.innerHeight-150,
      columnWidth: window.innerWidth*0.50*0.33,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.selectedImages.length===0||nextProps.images.length!==this.props.images.length) {
      this.setState({selectedImages:nextProps.images.map((image)=>false)});
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.windowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.windowResize);
  }

  toggleConfirmation = (value) => {
    this.setState({removeConfirmationOpen:value});
    if (value.length>0) {
      this.props.togglePopUp(true);
    } else {
      this.props.togglePopUp(false);
    }
  }

  windowResize = () => {
    this.setState({
      windowWidth: window.innerWidth,
      gridWidth: window.innerWidth*0.50,
      gridHeight: window.innerHeight-150,
      columnWidth: window.innerWidth*0.50*0.33,
    });
  }

  handleFilterClick = (e) => {
    e.preventDefault(); // Prevent ghost click
    this.setState({
      filterOpen: true,
      anchorEl: e.currentTarget,
    });
  }
  handleFilterClose = () => {
    this.setState({
      filterOpen: false,
    });
  }
  handleFilterChoice = (value, text) => {
    this.setState({
      filter: {value, text},
      filterOpen: false,
      selectedImages: this.props.images.map((image)=>false),
    })
  }

  toggleCheckbox = (index) => {
    let newArray = Object.assign([], this.state.selectedImages);
    newArray[index] = !newArray[index];
    this.setState({selectedImages: newArray}, ()=>this.forceUpdate());
  }

  cellRenderer = ({ columnIndex, key, rowIndex, style }, imagesToRender) => {
    const index = this.state.columnCount*rowIndex+columnIndex;
    if (index<imagesToRender.length) {
      let img = imagesToRender[this.state.columnCount*rowIndex+columnIndex];
      let globalIndex = this.props.images.findIndex((image)=>image.id===img.id);
      return (
        <div
          key={key}
          style={{...style, overflow:"hidden"}}
        >
          <div style={{height:150,overflow:"hidden"}}>
            <img 
              alt={img.label}
              src={img.url}
              width={this.state.windowWidth*0.50*0.25}
            />
          </div>
            <Checkbox
              aria-label={img.label}
              label={img.label}
              checked={this.state.selectedImages[globalIndex]}
              onClick={()=>{this.toggleCheckbox(globalIndex)}}
              labelStyle={{overflow:"hidden",  textOverflow: "ellipsis", wordWrap:"break-word", width:this.state.windowWidth*0.50*0.25-50}}
            />
        </div>
      )
    }
  }

  getActiveImages = () => {
    let ids=[];
    for (let i=0; i<this.state.selectedImages.length; i++) {
      if (this.state.selectedImages[i]) {
        ids.push(this.props.images[i]);
      }
    }
    return ids;
  }
  getProject = (projectID) => {
    return this.props.projects.find((project)=>project.id===projectID);
  }

  /**
   * Returns items in common
   */
  intersect = (list1, list2) => {
    if (list1.length >= list2.length)
      return list1.filter((id1)=>{return list2.includes(id1)});
    else
      return list2.filter((id1)=>{return list1.includes(id1)});
  }

  handleAddChip = (chip) => {
    // Link project to selected images
    this.props.action.linkImages([chip.id],this.getActiveImages().map((img)=>img.id));
  }

  handleDeleteChip = (chip, index) => {
    // Unlink project from selected images
    this.props.action.unlinkImages([chip],this.getActiveImages().map((img)=>img.id));    
  }

  selectAll = () => {
    let selectedImages = [];
    if (this.state.filter.value === "all") {
      selectedImages = this.props.images.map(()=>true);
    } else if (this.state.filter.value === "orphans") {
      selectedImages = this.props.images.map((img)=>img.projectIDs.length===0);
    } else {
      // Filter is a project ID
      selectedImages = this.props.images.map((image)=>{if (image.projectIDs.includes(this.state.filter.value)) { return true } else { return false }});
    }
    this.setState({selectedImages});
  }

  render() {
    if (this.props.images) {
      let imagesToRender = this.props.images;
      if (this.state.filter.value.includes("orphans")) {
        imagesToRender = imagesToRender.filter((img)=>img.projectIDs.length===0);
      } else if (this.state.filter.value!=="all") {
        imagesToRender = imagesToRender.filter((img)=>img.projectIDs.includes(this.state.filter.value));
      }

      // Generate info panel
      let infoPanel = <div><h1>Select one or more images to edit</h1></div>
      const numSelected = this.state.selectedImages.filter((x)=>x).length;
      const activeImages = this.getActiveImages();
      if (numSelected>0) {
        let projectInfo = "";
        // More than one image selected
        // Find all the projects in common 
        let projectDataSource = this.props.projects.map((project)=>{return {id:project.id,title:project.title}});
        let commonProjectIDs = activeImages[0].projectIDs;
        let commonProjectDataSource = [];
        for (let img of activeImages) {
          commonProjectIDs = this.intersect(commonProjectIDs, img.projectIDs);
        }
        commonProjectIDs.forEach((id)=>commonProjectDataSource.push({id:id, title:this.getProject(id).title}));
        projectInfo = <div>
          <h2>{numSelected>1?"Projects in common":"Projects"}</h2>
          <ChipInput
            value={commonProjectDataSource}
            onRequestAdd={(chip) => this.handleAddChip(chip)}
            onRequestDelete={(chip, index) => this.handleDeleteChip(chip, index)}
            dataSource={projectDataSource}
            dataSourceConfig={{text:'title', value:'id'}}
            openOnFocus={true}
            fullWidth
            hintText={"Choose project.."}
          />
        </div>
        infoPanel = <div>
          <h1>{numSelected} image{numSelected>1?"s":""} selected</h1>
            {projectInfo}
            <RaisedButton
              label="Delete"
              onClick={()=>{this.toggleConfirmation("delete")}}
              backgroundColor="#b53c3c"
              labelColor="#ffffff" 
              fullWidth
            />
        </div>
      }
      // Generate file upload panel
      const uploadPanel = <div>
        <h1>Upload images</h1>
        <UploadImages 
          images={this.props.images}
          action={{
            uploadImages: this.props.action.uploadImages,
          }}
        />
      </div>
      // Generate filter panel
      const filterPanel = <div className="imageFilter">
        <div>
          <RaisedButton 
            label={this.state.filter.text}
            onClick={this.handleFilterClick}
            icon={<IconFilter style={{height:15}}/>}
            {...btnBase()}
          />
          <Popover
            open={this.state.filterOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={this.handleFilterClose}
          >
            <Menu>
              <MenuItem onClick={()=>this.handleFilterChoice("all", "Show all images")} primaryText="Show all images" />
              <MenuItem onClick={()=>this.handleFilterChoice("orphans", "Show orphaned images")} primaryText="Show orphaned images" />
              <MenuItem 
                primaryText="Show images in project.."
                rightIcon={<ArrowDropRight />}
                menuItems={this.props.projects.map((project)=><MenuItem primaryText={project.title} onClick={()=>this.handleFilterChoice(project.id, project.title)} />)}
              />
            </Menu>
          </Popover>
        </div>
        <div>
          <FlatButton 
            label="Select all"
            onClick={this.selectAll}
            labelStyle={this.state.windowWidth<=768?{fontSize:"0.6em"}:{}}
            disabled={this.state.selectedImages.findIndex((x)=>!x)===-1}
          />
          <FlatButton 
            label="Clear selection"
            onClick={()=>this.setState({selectedImages:this.props.images.map((image)=>false)})}
            labelStyle={this.state.windowWidth<=768?{fontSize:"0.6em"}:{}}
            disabled={this.state.selectedImages.findIndex((x)=>x)===-1}
          />
        </div>
      </div>

      return <div>
        <div style={{display:"flex", marginTop:"1em"}}>
          <div style={{paddingLeft:"1em"}}>
            {filterPanel}
            <Grid
              {...imagesToRender}
              {...this.state.selectedImages}
              {...this.state.gridWidth}
              cellRenderer={(data)=>this.cellRenderer(data, imagesToRender)}
              columnCount={this.state.columnCount}
              columnWidth={this.state.columnWidth}
              height={this.state.gridHeight}
              rowCount={imagesToRender.length%3===0? imagesToRender.length/3 : Math.floor(imagesToRender.length/3)+1}
              rowHeight={200}
              width={this.state.gridWidth}
              id="grid"
            />
          </div>
          <div style={{marginLeft:"1em", padding:"1em",background:"white", width: this.state.windowWidth*0.22}}>
            {numSelected>0?infoPanel:uploadPanel}
          </div>
        </div>
        <RemoveImageConfirmation
          open={this.state.removeConfirmationOpen.length>0}
          toggleConfirmation={this.toggleConfirmation}
          deleteImages={this.props.action.deleteImages}
          unlinkImages={this.props.action.unlinkImages}
          imgs={activeImages.map((img)=>{return {id:img.id, label:img.label}})}
          actionType={"delete"}
          numToRemove={numSelected}
          collectionsMode={true}
        />
      </div>
    } else {
      return <div></div>
    }
  }
}
export default ImageCollection;