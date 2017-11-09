import React, {Component} from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SideBin from './mapImages/SideBin';
import ImageBin from './mapImages/ImageBin';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import update from 'immutability-helper';
import IconButton from 'material-ui/IconButton';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-downward';
import ArrowUp from 'material-ui/svg-icons/navigation/arrow-upward';
import ImageViewer from "../global/ImageViewer";
import Dialog from 'material-ui/Dialog';

class MapImages extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageMapBoard: [],
      imageMapBoardByID: {},
      sideMapBoardByID: {},
      sideMapBoard: [],
      sideBacklogByID: {},
      sideBacklog: [],
      activeManifest: Object.keys(props.manifests).length>0? Object.keys(props.manifests)[0]:"",
      initiallyLinkedSides: [],
      imageModalOpen: false,
      activeImage: null
    }
  }

  componentWillUnmount = () => {
		cancelAnimationFrame(this.requestedFrame)
  }

  scheduleUpdate = (updateFn) => {
		this.pendingUpdateFn = updateFn
		if (!this.requestedFrame) {
			this.requestedFrame = requestAnimationFrame(this.drawFrame)
		}
	}

  toggleImageModal = (imageModalOpen, activeImage) => {  
    this.setState({imageModalOpen, activeImage})
  }

	drawFrame = () => {
		const nextState = update(this.state, this.pendingUpdateFn)
		this.setState(nextState)
		this.pendingUpdateFn = null
		this.requestedFrame = null
	}

  componentWillMount() {
    let imageBacklogs = {};
    let sideBacklogByID = {};
    let sideBacklog = [];
    let sideMapBoardByID = {};
    let sideMapBoard = [];
    let imageMapBoard = [];
    let imageMapBoardByID = {};
    let linkedImages = {};
    let initiallyLinkedSides = [];

    // Set up linkedImages dictionary
    for (const manifestID in this.props.manifests) {
      linkedImages[manifestID]=[];
    }

    const rectoIDs = Object.keys(this.props.Rectos);
    const versoIDs = Object.keys(this.props.Versos);
    for (const i in rectoIDs) {
      const recto = this.props.Rectos[rectoIDs[i]];
      const verso = this.props.Versos[versoIDs[i]];
      const rectoDraggableItem = {id: recto.id, sideType: "Recto", leafOrder: recto.parentOrder, folioNumber: recto.folio_number};
      const versoDraggableItem = {id: verso.id, sideType: "Verso", leafOrder: verso.parentOrder, folioNumber: verso.folio_number};
      // Add sides to board or backlog depending if they're linked to images
      if (recto.image.manifestID!==undefined && recto.image.manifestID.length>0) {
        sideMapBoardByID[recto.id]=(rectoDraggableItem);
        sideMapBoard.push(rectoDraggableItem);
        const imgObj = {id: recto.image.label, manifestID: recto.image.manifestID, url: recto.image.url, binOrigin:"imageBacklog_"+this.props.manifests[recto.image.manifestID].name};
        imageMapBoard.push(imgObj);
        imageMapBoardByID[recto.image.label] = imgObj;
        linkedImages[recto.image.manifestID].push(recto.image.url);
        initiallyLinkedSides.push({id: recto.id, url: recto.image.url});
      } else {
        sideBacklog.push(rectoDraggableItem);
        sideBacklogByID[recto.id]=rectoDraggableItem;
      }
      if (verso.image.manifestID!==undefined && verso.image.manifestID.length>0) {
        sideMapBoard.push(versoDraggableItem);
        sideMapBoardByID[verso.id]=(versoDraggableItem);
        const imgObj = {id: verso.image.label, manifestID: verso.image.manifestID, url: verso.image.url, binOrigin:"imageBacklog_"+this.props.manifests[verso.image.manifestID].name};
        imageMapBoard.push(imgObj)
        imageMapBoardByID[verso.image.label] = imgObj;
        linkedImages[verso.image.manifestID].push(verso.image.url);
        initiallyLinkedSides.push({id: verso.id, url: verso.image.url});
      } else {
        sideBacklog.push(versoDraggableItem);
        sideBacklogByID[verso.id]=versoDraggableItem;
      }
    }
    for (const manifestID in this.props.manifests) {
      const manifest = this.props.manifests[manifestID];
      // Add the initial parent bin to each image object
      // const images = manifest.images.filter((image)=>{return !linkedImages[manifestID].includes(image.url)}).map((image)=>{return {id: image.label, manifestID: manifestID, url: image.url, binOrigin:"imageBacklog_"+manifest.name}});
      const images = manifest.images.filter((image)=>{return !linkedImages[manifestID].includes(image.url)});
      let imageBacklog = [];
      let imageBacklogByID = {};
      for (const image of images) {
        const imgObj = {id: image.label, manifestID: manifestID, url: image.url, binOrigin:"imageBacklog_"+manifest.name};
        imageBacklog.push(imgObj)
        imageBacklogByID[image.label] = imgObj;
      }
      imageBacklogs["imageBacklog_"+manifest.name.substring(0,25).replace(/ /g, '')+"ByID"] = {...imageBacklogByID};
      imageBacklogs["imageBacklog_"+manifest.name.substring(0,25).replace(/ /g, '')] = imageBacklog;
    }
    // console.log(imageBacklogs);
    this.setState({...imageBacklogs, imageMapBoard, imageMapBoardByID, sideMapBoard, sideMapBoardByID, sideBacklog, sideBacklogByID, initiallyLinkedSides});
  }

  moveItem = (id, afterId, binName) => {
    // console.log("moveItem", id, afterId, binName);
    if (binName.includes("Backlog")) binName = binName.substring(0,38).replace(/ /g, '');

    const binByID = this.state[binName+"ByID"];
    const binByIndex = this.state[binName];

    const item = binByID[id]
    const afterItem = binByID[afterId]

    const itemIndex = binByIndex.indexOf(item);
    const afterIndex = binByIndex.indexOf(afterItem);

    this.scheduleUpdate({
      [binName]: {
        $splice: [[itemIndex, 1], [afterIndex, 0, item]],
      },
    })
  }
  

  changeBins = (fromBinID, toBinID, item, addToFrontOfList) => {
    // console.log("changeBins", fromBinID, toBinID, item, addToFrontOfList);
    if (fromBinID.includes("Backlog")) {
      fromBinID = fromBinID.substring(0,38).replace(/ /g, '');
    } else if (toBinID.includes("Backlog")) {
      toBinID = toBinID.substring(0,38).replace(/ /g, '');
    }
    let fromBin = this.state[fromBinID];
    fromBin.splice(fromBin.indexOf(item),1);
    let fromBinByID = this.state[fromBinID+"ByID"];
    delete fromBinByID[item.id];
    let toBin = this.state[toBinID];
    addToFrontOfList ? toBin.unshift(item) : toBin.push(item);
    let toBinByID = this.state[toBinID+"ByID"];
    toBinByID[item.id]=item;
    // updating the state inside a requestAnimationFrame callback,
    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(()=>{
        this.setState({[fromBinID]:fromBin, [toBinID]:toBin, [fromBinID+"ByID"]:fromBinByID, [toBinID+"ByID"]:toBinByID})
        this.pendingUpdateFn = null
        this.requestedFrame = null
      })
    }
  }

  getIndex = (obj, parentBoardID) => {
    if (parentBoardID.includes("Backlog")) parentBoardID = parentBoardID.substring(0,38).replace(/ /g, '');
    return this.state[parentBoardID].indexOf(obj);
  }
  
  handleChange = (event, index, activeManifest) => this.setState({activeManifest});

  addAll = (fromBoard, toBoard) => {
    const newToList = this.state[toBoard].concat(this.state[fromBoard]);
    this.setState({[fromBoard]:[], [toBoard]:newToList});
  }

  resetImageBacklog = () => {
    let imageBacklogs = {};
    for (const manifestID in this.props.manifests) {
      const manifest = this.props.manifests[manifestID];
      // Add the initial parent bin to each image object
      const images = manifest.images.map((image)=>{return {id: image.label, url: image.url, binOrigin:"imageBacklog_"+manifest.name}});
      imageBacklogs["imageBacklog_"+manifest.name.substring(0,25).replace(/ /g, '')] = images;
    }
    this.setState({imageMapBoard:[], ...imageBacklogs});
  }
  submitIsDisabled = () => {
    const unevenMatches = this.state.sideMapBoard.length!==this.state.imageMapBoard.length;
    const noNewItems = this.state.sideMapBoard.length===this.state.initiallyLinkedSides.length && (this.state.sideMapBoard.filter((side, index)=>this.state.initiallyLinkedSides.find((initSide)=>{return initSide.id===side.id && this.state.imageMapBoard[index]!==undefined && initSide.url===this.state.imageMapBoard[index].url})!==undefined)).length===this.state.sideMapBoard.length;
    const wantToUnlinkEverything = this.state.initiallyLinkedSides.length>0 && this.state.sideMapBoard.length===0 && this.state.imageMapBoard.length===0;
    return !wantToUnlinkEverything && (unevenMatches || noNewItems);
  }

  submitMapping = () => {
    if (!this.submitIsDisabled()) {
      let unlinkedSideIDs =  this.state.initiallyLinkedSides.filter((initialSide)=>{
        const stillInBoard = this.state.sideMapBoard.filter((side)=>{return side.id===initialSide.id});
        return stillInBoard.length===0;
      }).map((item)=>item.id);
      this.setState({initiallyLinkedSides: this.state.sideMapBoard.map((obj, index)=>{return {id: obj.id, url: this.state.imageMapBoard[index].url}})}, ()=>{this.props.mapSidesToImages(this.state.sideMapBoard, this.state.imageMapBoard, unlinkedSideIDs)});
    } 
  }

  automatch = () => {
    let sidesToMap = [];
    let imagesToMap = {};
    for (const side of this.state.sideBacklog) {
      let imageMatch;
      // Look through manifests to find an image with an id equal to the side's folio number
      for (const manifestID in this.props.manifests) {
        const manifestName = this.props.manifests[manifestID].name;
        imageMatch = this.state["imageBacklog_"+manifestName.substring(0,25).replace(/ /g, '')].find((image)=>image.id===side.folioNumber);
        if (imageMatch!==undefined) {
          // Found a match! Record the side and image
          sidesToMap.push(side);
          if (!imagesToMap.hasOwnProperty("imageBacklog_"+manifestName.substring(0,25).replace(/ /g, ''))) imagesToMap["imageBacklog_"+manifestName.substring(0,25).replace(/ /g, '')]=[];
          imagesToMap["imageBacklog_"+manifestName.substring(0,25).replace(/ /g, '')].push(imageMatch);
          break;
        }
      }
    }
    // Add items to the board
    this.moveMultipleItems("sideBacklog", "sideMapBoard", sidesToMap, false);
    for (const imgBinName in imagesToMap) {
      this.moveMultipleItems(imgBinName, "imageMapBoard", imagesToMap[imgBinName], false);
    }
  }

  moveMultipleItems = (fromBinID, toBinID, items, addToFrontOfList) => {
    let fromBin = this.state[fromBinID];
    let fromBinByID = this.state[fromBinID+"ByID"];
    let toBin = this.state[toBinID];
    let toBinByID = this.state[toBinID+"ByID"];
    for (const item of items) {
      fromBin.splice(fromBin.indexOf(item),1);
      delete fromBinByID[item.id];
      addToFrontOfList ? toBin.unshift(item) : toBin.push(item);
      toBinByID[item.id]=item;
    }

    // updating the state inside a requestAnimationFrame callback,
    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(()=>{
        this.setState({[fromBinID]:fromBin, [toBinID]:toBin, [fromBinID.substring(0,25).replace(/ /g, '')+"ByID"]:fromBinByID, [toBinID.substring(0,25).replace(/ /g, '')+"ByID"]:toBinByID})
        this.pendingUpdateFn = null
        this.requestedFrame = null
      })
    }
  }

  automatchDisabled = () => {
    for (const side of this.state.sideBacklog) {
      // Look through manifests to find an image with an id equal to the side's folio number
      for (const manifestID in this.props.manifests) {
        const manifestName = this.props.manifests[manifestID].name;
        // console.log(("imageBacklog_"+manifestName), this.state["imageBacklog_"+manifestName]);
        const imageMatch = this.state["imageBacklog_"+manifestName.substring(0,25).replace(/ /g, '')].find((image)=>image.id===side.folioNumber);
        if (imageMatch!==undefined) {
          // Found a match! 
          return false;
        }
      }
    }
    return true;
  }
  
  render() {
    if (Object.keys(this.props.manifests).length>0) {
      return (
        <div className="imageMapper">
          <div className="topPanel">
            <div className="panelBarGroup">
              <div className="panelBar">
                <div className="title"></div>
                <div className="action">
                  <IconButton 
                    style={this.state.sideMapBoard.length===0?{display:"none"}:{}} 
                    tooltip="Move all to backlog" 
                    onTouchTap={()=>this.addAll("sideMapBoard", "sideBacklog")}
                  >
                    <ArrowDown />
                  </IconButton>
                </div>
              </div>
              <div className="panelBar">
                <div className="title"></div>
                <div className="action">
                  <IconButton 
                    style={this.state.imageMapBoard.length===0?{display:"none"}:{}} 
                    tooltip="Move all to backlog" 
                    onTouchTap={this.resetImageBacklog}
                  >
                    <ArrowDown />
                  </IconButton>
                </div>
              </div>
            </div>
            <div className="boards">
              <div>
                <SideBin
                  id={"sideMapBoard"}
                  sides={this.state.sideMapBoard}
                  reorderItem={this.reorderItem} 
                  changeBins={this.changeBins} 
                  moveItem={this.moveItem}
                  getIndex={this.getIndex} 
                />
              </div>
              <div>
                <ImageBin 
                  id={"imageMapBoard"} 
                  images={this.state.imageMapBoard} 
                  reorderItem={this.reorderItem} 
                  changeBins={this.changeBins} 
                  moveItem={this.moveItem}
                  getIndex={this.getIndex} 
                  isVisible={true}
                  toggleImageModal={this.toggleImageModal}
                />
              </div>
            </div>
          </div>
            
          <div className="bottomPanel">
            <div className="sideBacklog">
              <div className="panelBar">
                <div className="title">Sides backlog</div>
                <div className="action">
                  <IconButton 
                    style={this.state.sideBacklog.length===0?{display:"none"}:{}}
                    tooltip="Move all to board" 
                    onTouchTap={()=>this.addAll("sideBacklog", "sideMapBoard")}
                  >
                    <ArrowUp />
                  </IconButton>
                </div>
              </div>
              <div className="scrollable">
                <SideBin
                  id={"sideBacklog"}
                  sides={this.state.sideBacklog}
                  reorderItem={this.reorderItem} 
                  changeBins={this.changeBins} 
                  getIndex={this.getIndex} 
                  moveItem={this.moveItem}
                />
              </div>
            </div>
            <div className="imageBacklog">
              <div className="panelBar">
                <div className="title">Images backlog</div>
                <div className="action">
                  <IconButton 
                    style={this.state["imageBacklog_"+this.props.manifests[this.state.activeManifest].name.substring(0,25).replace(/ /g, '')].length===0?{display:"none"}:{}}
                    tooltip="Move all to board" 
                    onTouchTap={()=>this.addAll("imageBacklog_"+this.props.manifests[this.state.activeManifest].name.substring(0,25).replace(/ /g, ''), "imageMapBoard")}
                  >
                    <ArrowUp />
                  </IconButton>
                </div>
              </div>
              <div className="manifestSelection">
                <div className="title"><b>Manifest:</b> </div>
                <div className="form">
                  <SelectField
                    value={this.state.activeManifest}
                    onChange={this.handleChange}
                    underlineStyle={{border:0}}
                    labelStyle={{height: 40, lineHeight: "35px", top:0}}
                    iconStyle={{height: 40, padding:0}}
                    fullWidth
                  >
                    {Object.keys(this.props.manifests).map((manifestID)=>
                      <MenuItem key={"selectField"+manifestID} value={manifestID} primaryText={this.props.manifests[manifestID].name.length>40? this.props.manifests[manifestID].name.slice(0,40) + "..." : this.props.manifests[manifestID].name} />
                    )}
                  </SelectField>
                </div>
              </div>
              <div className="scrollable">
                {Object.keys(this.props.manifests).map((manifestID)=> {
                  const manifest = this.props.manifests[manifestID];
                  return <ImageBin 
                    key={"imageBacklog_"+manifest.name} 
                    id={"imageBacklog_"+manifest.name} 
                    images={this.state["imageBacklog_"+manifest.name.substring(0,25).replace(/ /g, '')]} 
                    isVisible={this.state.activeManifest===manifestID}
                    reorderItem={this.reorderItem} 
                    moveItem={this.moveItem}
                    changeBins={this.changeBins} 
                    getIndex={this.getIndex} 
                    toggleImageModal={this.toggleImageModal}
                  />
                })}
              </div>
            </div>
          </div>
          <div className="mainToolbar">
            <div className="message">Mapping {this.state.sideMapBoard.length} sides to {this.state.imageMapBoard.length} images</div>
            <div className="actions">
              <RaisedButton 
                label="Automatch" 
                onTouchTap={this.automatch}
                style={{marginRight:5}}
                disabled={this.automatchDisabled()}
                />
              <RaisedButton 
                primary 
                disabled={this.submitIsDisabled()} 
                label="Submit mapping" 
                onTouchTap={this.submitMapping}
                />
              </div>
          </div>
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
    } else {
      return (<div style={{paddingLeft: "2em"}}><h2>Getting started</h2><p>To start mapping images to the collation, please upload a manifest in the "Manage Sources" tab.</p></div>);
    }
  }
}

export default DragDropContext(HTML5Backend)(MapImages);
