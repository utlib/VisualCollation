import React, {Component} from 'react';
import SideBacklog from './mapImages/SideBacklog';
import ImageBacklog from './mapImages/ImageBacklog';
import MapBoard from './mapImages/MapBoard';
import RaisedButton from 'material-ui/RaisedButton';
import ImageViewer from "../global/ImageViewer";
import Dialog from 'material-ui/Dialog';
import SelectField from '../global/SelectField';
import { btnBase } from '../../styles/button';

export default class MapImages extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageMapBoard: [], // [{manifestID: "", label: "", url: ""}, ...]
      sideMapBoard: [], // [sideID, ...]
      imageBacklog: [], // [{manifestID: "", label: "", url: ""}, ...]
      sideBacklog: [],  // [sideID, ...]
      activeManifest: this.props.manifests[Object.keys(this.props.manifests)[0]], // {id: "", url: "", images: []}
      initialMapping: {imageMapBoard: [], sideMapBoard: [], imageBacklog: {}, sideBacklog: []},
      selectedObjects: {type: "", members: [], lastSelected: null},
      imageModalOpen: false,
      activeImage: null // {url:"", isDIY: true/false}
    }
  }

  componentWillMount() {
    this.updateBoards(this.props);
  }

  componentWillReceiveProps(nextProps) {
    let members = [];
    if (nextProps.selectAll!=="")
      members = [...this.state[nextProps.selectAll]];
    const selectedObjects = {type: nextProps.selectAll, members, lastSelected: members[-1]};
    this.setState({ selectedObjects });
    if (nextProps.Rectos!==this.props.Rectos||nextProps.Versos!==this.props.Versos) this.updateBoards(nextProps);
  }

  updateBoards = (props) => {
    // Update initial map board with already existing mappings
    const { Rectos, rectoIDs, Versos, versoIDs } = props;
    let imageBacklog = [];
    for (let manifest of Object.entries(props.manifests)) {
      imageBacklog = imageBacklog.concat(manifest[1].images);
    }
    let sideBacklog = [...rectoIDs].map((rectoID, index) => [rectoID, versoIDs[index]]).reduce((a,b)=> a.concat(b), []);
    let imageMapBoard = [];
    let sideMapBoard = [];
    // Add sides to board or backlog depending if they're linked to images
    for (const sideID of sideBacklog) {
      const side = sideID.charAt(0)==="R" ? Rectos[sideID] : Versos[sideID];
      if (side.image.label){
        sideMapBoard.push(sideID);
        imageMapBoard.push(side.image);
      }
    }
    // Remove items from backlog which already exists in the intial map board
    imageBacklog = imageBacklog.filter(backlogImage => !imageMapBoard.find(mapImage => mapImage.url===backlogImage.url && mapImage.manifestID===backlogImage.manifestID));
    sideBacklog = sideBacklog.filter(sideID => !sideMapBoard.includes(sideID));
    this.setState({imageBacklog, sideBacklog, sideMapBoard, imageMapBoard, initialMapping:{imageBacklog, sideBacklog, sideMapBoard, imageMapBoard}});
  }

  handleManifestChange = activeManifestID => this.setState({activeManifest: this.props.manifests[activeManifestID]});

  toggleImageModal = (imageModalOpen, url, isDIY) => {this.props.togglePopUp(imageModalOpen); this.setState({imageModalOpen, activeImage: {url, isDIY}})};

  resetChanges = () => {
    const { imageBacklog, sideBacklog, sideMapBoard, imageMapBoard } = this.state.initialMapping;
    const selectedObjects = {type: "", members: [], lastSelected: null};
    const activeManifest = this.props.manifests[Object.keys(this.props.manifests)[0]];
    this.setState({ imageBacklog, sideBacklog, sideMapBoard, imageMapBoard, selectedObjects, activeManifest });
  }

  handleObjectClick = (type, object, event) => {
    let selectedObjects = {...this.state.selectedObjects, members: [...this.state.selectedObjects.members]};
    if (event.ctrlKey || event.metaKey || (event.modifiers!==undefined && event.modifiers.command)) {
      // Toggle this object without clearing active objects unless type is different
      if (selectedObjects.type !== type) {
        selectedObjects.members = [];
        selectedObjects.type = type;
      }
      let index;
      if (type.includes("image"))
        index = selectedObjects.members.findIndex(member => member.url===object.url && member.manifestID===object.manifestID);
      else
        index = selectedObjects.members.indexOf(object);
      (index!==-1) ? selectedObjects.members.splice(index, 1) : selectedObjects.members.push(object);
    }
    if (event.button === 0 || event.modifiers!==undefined) {
      let notCtrl=event.ctrlKey !== undefined && !event.ctrlKey && !event.shiftKey;
      let notCmd=event.metaKey !== undefined && !event.metaKey && !event.shiftKey;
      let notCanvasCmd=event.modifiers !== undefined && !event.modifiers.command && !event.modifiers.shift;
      if ((notCtrl&&notCmd)||notCanvasCmd) {
        // Clear all and toggle only this object
        if (selectedObjects.members.includes(object)) {
          selectedObjects.members = [];
        } 
        else {
          selectedObjects.members = [object];
        }
      }
      if (event.shiftKey || (event.modifiers!==undefined && event.modifiers.shift)) {
        window.getSelection().removeAllRanges();
        // Object type changed, clear all active selected objects
        if (selectedObjects.type !== type) {
          selectedObjects.members = [object];
        } else {
          // Select all similar type objects within this object and last selected object
          let allMembers = [...this.state[type]];
          let indexOfCurrentElement, indexOfLastElement;
          if (type.includes("image")){
            indexOfCurrentElement = allMembers.findIndex(member => member.url===object.url && member.manifestID===object.manifestID);
            indexOfLastElement = allMembers.findIndex(member => member.url===selectedObjects.lastSelected.url && member.manifestID===selectedObjects.lastSelected.manifestID);
          }
          else {
            indexOfCurrentElement = allMembers.indexOf(object);
            indexOfLastElement = allMembers.indexOf(selectedObjects.lastSelected);
          }
          let indexes = [indexOfLastElement, indexOfCurrentElement];
          indexes.sort((a, b) => {return a-b});
          const currentSelected = [...selectedObjects.members];
          selectedObjects.members = allMembers.slice(indexes[0], indexes[1]+1);
          for (let object of currentSelected){
            if (!selectedObjects.members.includes(object))
              selectedObjects.members.push(object);
          }
        }
      }
    }
    if (selectedObjects.members.length === 0) {
      selectedObjects.type = "";
    } else {
      selectedObjects.type = type;
      selectedObjects.lastSelected = object;
    }
    this.setState({ selectedObjects });
  }

  moveItemUpOrDown = (item, mapBoardType, position) => {
    let newMapBoard = [...this.state[mapBoardType]];
    let indexOfItem;
    if (mapBoardType==="imageMapBoard"){
      indexOfItem = newMapBoard.findIndex(image => image.url===item.url && image.manifestID===item.manifestID);
    } else {
      indexOfItem = newMapBoard.indexOf(item);
    }
    const indexOfSwappingItem = position==="down" ? indexOfItem+1 : indexOfItem-1;
    const swappedItem = newMapBoard[indexOfSwappingItem];
    newMapBoard[indexOfItem] = swappedItem;
    newMapBoard[indexOfSwappingItem] = item;
    this.setState({ [mapBoardType]: newMapBoard });
  }

  moveItemsToMap = (items=this.state.selectedObjects.members, mapBoardType, backlogBoardType) => {
    let newMapBoard = [...this.state[mapBoardType], ...items];
    let newBacklogBoard;
    if (mapBoardType==="imageMapBoard"){
      newBacklogBoard = [...this.state[backlogBoardType]].filter(image => !items.find(item => item.url===image.url && item.manifestID===image.manifestID));
    } else {
      newBacklogBoard = [...this.state[backlogBoardType]].filter(item => !items.includes(item));
    }
    let selectedObjects = {...this.state.selectedObjects, members: [...this.state.selectedObjects.members]};
    selectedObjects.type = mapBoardType;
    this.setState({ [mapBoardType]: newMapBoard, [backlogBoardType]: newBacklogBoard, selectedObjects });
  }

  moveItemsToBacklog = (items=this.state.selectedObjects.members, mapBoardType, backlogBoardType) => {
    let newBacklogBoard = [...this.state[backlogBoardType], ...items];
    let newMapBoard;
    if (mapBoardType==="imageMapBoard"){
      newMapBoard = [...this.state[mapBoardType]].filter(image => !items.find(item => item.url===image.url && item.manifestID===image.manifestID));
      newBacklogBoard.sort((a, b)=>this.state.initialMapping[backlogBoardType].findIndex(image => image.url===a.url && image.manifestID===a.manifestID) > this.state.initialMapping[backlogBoardType].findIndex(image => image.url===b.url && image.manifestID===b.manifestID) ? 1 : -1);
      // newBacklogBoard.sort((a, b)=>a.label>b.label ? 1 : -1);
    } else {
      newMapBoard = [...this.state[mapBoardType]].filter(item => !items.includes(item));
      newBacklogBoard.sort((a, b)=>this.state.initialMapping[backlogBoardType].indexOf(a) > this.state.initialMapping[backlogBoardType].indexOf(b) ? 1 : -1);
    }
    let selectedObjects = {...this.state.selectedObjects, members: [...this.state.selectedObjects.members]};
    selectedObjects.type = backlogBoardType;
    this.setState({ [mapBoardType]: newMapBoard, [backlogBoardType]: newBacklogBoard, selectedObjects });
  }

  submitIsDisabled = () => {
    // check for changes in sideMapBoard
    const sideMapBoard = this.state.sideMapBoard;
    const initialSideMapBoard = this.state.initialMapping.sideMapBoard;
    let noChangesInSideMapBoard = sideMapBoard.length===initialSideMapBoard.length && sideMapBoard.every((v,i) => v===initialSideMapBoard[i]);
    // check for changes in imageMapBoard
    const imageMapBoard = this.state.imageMapBoard;
    const initialImageMapBoard = this.state.initialMapping.imageMapBoard;
    let noChangesInImageMapBoard = imageMapBoard.length===initialImageMapBoard.length && imageMapBoard.every((v,i) => v.url===initialImageMapBoard[i].url && v.manifestID===initialImageMapBoard[i].manifestID);
    // compare both changes
    const noChanges = noChangesInSideMapBoard && noChangesInImageMapBoard;
    const unevenMatches = this.state.sideMapBoard.length!==this.state.imageMapBoard.length;
    return unevenMatches || noChanges;
  }

  automatchIsDisabled = () => {
    for (const sideID of this.state.sideBacklog) {
      const side = sideID.charAt(0)==="R" ? this.props.Rectos[sideID] : this.props.Versos[sideID];
      // Return immediately if a match is found
      if (this.state.imageBacklog.find(image => image.label.includes(side.folio_number))) return false;
    }
    return true;
  }

  automatch = () => {
    let sideItemsToMap = [];
    let imageItemsToMap = [];
    for (const sideID of this.state.sideBacklog) {
      const side = sideID.charAt(0)==="R" ? this.props.Rectos[sideID] : this.props.Versos[sideID];
      const image = this.state.imageBacklog.find(image => image.label.endsWith(side.folio_number))
      if (image){
        sideItemsToMap.push(sideID);
        imageItemsToMap.push(image);
      } 
    }
    this.moveItemsToMap(sideItemsToMap, "sideMapBoard", "sideBacklog");
    this.moveItemsToMap(imageItemsToMap, "imageMapBoard", "imageBacklog");
  }
  
  submitMapping = () => {
    let newSideMappings = [];
    let unlinkedSideMappings = [];
    let sideIDsWithImage = this.state.sideMapBoard.map((sideID, i) => [sideID, this.state.imageMapBoard[i]]);
    for (let [sideID, image] of sideIDsWithImage){
      newSideMappings.push({ id: sideID, attributes: {image} });
    }
    for (let sideID of this.state.initialMapping.sideMapBoard) {
      if (this.state.sideMapBoard.indexOf(sideID)===-1)
        unlinkedSideMappings.push({ id: sideID, attributes: {image: {}}})
    }    
    this.props.mapSidesToImages(newSideMappings.concat(unlinkedSideMappings));
    // Update initial mapping list
    this.setState({
      initialMapping: {imageMapBoard: this.state.imageMapBoard, sideMapBoard: this.state.sideMapBoard, imageBacklog: this.state.imageBacklog, sideBacklog: this.state.sideBacklog}
    })
  }


  render() {
    if (Object.keys(this.props.manifests).length<1) {
      return (
        <div style={{paddingLeft: "2em", paddingTop:"1em"}}>
          <h1>Getting started</h1>
          <p>To start mapping images to the collation, please add images in the "Manage Images" tab.</p>
        </div>
      );
    }

    const mapBoard = (
      <MapBoard
        sideIDs={this.state.sideMapBoard}
        Rectos={this.props.Rectos}
        Versos={this.props.Versos}
        images={this.state.imageMapBoard} 
        activeManifest={this.state.activeManifest}
        manifests={this.props.manifests}
        toggleImageModal={this.toggleImageModal}
        handleObjectClick={this.handleObjectClick}
        selectedObjects={this.state.selectedObjects}
        moveItemUpOrDown={this.moveItemUpOrDown}
        moveItemsToBacklog={this.moveItemsToBacklog}
        tabIndex={this.props.tabIndex}
        leafIDs={this.props.leafIDs}
        windowWidth={this.props.windowWidth}
      />
    );

    const middlePanel = (
      <div className="middleBar">
        <div>
          <RaisedButton 
            primary
            label={this.props.windowWidth<=768?"▲":"▲ Move To Mapping"} 
            onClick={()=>this.moveItemsToMap(undefined, "sideMapBoard", "sideBacklog")}
            disabled={this.state.selectedObjects.members.length===0 || this.state.selectedObjects.type!=="sideBacklog"}
            {...btnBase()}
            style={{...btnBase().style, marginRight:"0.2em"}}
            tabIndex={this.props.tabIndex}
            />
          <RaisedButton 
            primary
            label={this.props.windowWidth<=768?"▼":"▼ Move To Backlog"}
            onClick={()=>this.moveItemsToBacklog(undefined, "sideMapBoard", "sideBacklog")}
            disabled={this.state.selectedObjects.members.length===0 || this.state.selectedObjects.type!=="sideMapBoard"}
            tabIndex={this.props.tabIndex}
            {...btnBase()}
          />
        </div>
        <div>
          <RaisedButton 
            label="Automatch" 
            onClick={this.automatch}
            disabled={this.automatchIsDisabled()}
            tabIndex={this.props.tabIndex}
          />
        </div>
        <div>
          <RaisedButton 
            primary
            label={this.props.windowWidth<=768?"▲":"▲ Move To Mapping" }
            onClick={()=>this.moveItemsToMap(undefined, "imageMapBoard", "imageBacklog")}
            disabled={this.state.selectedObjects.members.length===0 || this.state.selectedObjects.type!=="imageBacklog"}
            {...btnBase()}
            style={{...btnBase().style, marginRight:"0.2em"}}
            tabIndex={this.props.tabIndex}
            />
          <RaisedButton 
            primary
            label={this.props.windowWidth<=768?"▼":"▼ Move To Backlog"}
            onClick={()=>this.moveItemsToBacklog(undefined, "imageMapBoard", "imageBacklog")}
            disabled={this.state.selectedObjects.members.length===0 || this.state.selectedObjects.type!=="imageMapBoard"}
            tabIndex={this.props.tabIndex}
            {...btnBase()}
            />
          </div>
      </div>
    );

    const sideBacklog = (
      <div className="sideBacklog">
        <div className="panelBar">
          <div className="title">Sides backlog</div>
        </div>
        <div className="scrollable" role="region" aria-label="sides backlog">
          <SideBacklog
            id={"sideBacklog"}
            sideIDs={this.state.sideBacklog}
            Rectos={this.props.Rectos}
            Versos={this.props.Versos}
            handleObjectClick={this.handleObjectClick}
            selectedObjects={this.state.selectedObjects}
            moveItemsToMap={this.moveItemsToMap}
            tabIndex={this.props.tabIndex}
            leafIDs={this.props.leafIDs}
          />
        </div>
      </div>
    );

    const imageBacklog = (
      <div className="imageBacklog">
        <div className="panelBar">
          <div className="title">Image Backlog</div>
          <div className="manifestSelection">
            <div className="form"  role="region" aria-label="manifest selection">
              <SelectField
                label="Choose manifest"
                id="manifestSelect"
                value={this.state.activeManifest.id}
                onChange={(manifestID)=>this.handleManifestChange(manifestID)}
                tabIndex={this.props.tabIndex}
                data={Object.entries(this.props.manifests).map(([manifestID, manifest])=>{
                  return {value: manifestID, text: manifest.name}}
                )}
              />
            </div>
          </div>
        </div>

        <div role="region" aria-label="image backlog">
          <ImageBacklog 
            id={"imageBacklog"}
            images={this.state.imageBacklog.filter(backlogImage => backlogImage.manifestID===this.state.activeManifest.id)} 
            activeManifest={this.state.activeManifest}
            manifests={this.props.manifests}
            toggleImageModal={this.toggleImageModal}
            handleObjectClick={this.handleObjectClick}
            selectedObjects={this.state.selectedObjects}
            moveItemsToMap={this.moveItemsToMap}
            tabIndex={this.props.tabIndex}
            windowWidth={this.props.windowWidth}
          />
        </div>
      </div>
    );

    const mainToolBar = (
      <div className="mainToolbar">
        <div className="message">Mapping {this.state.sideMapBoard.length} sides to {this.state.imageMapBoard.length} images</div>
        <div className="actions" role="region" aria-label="mapping actions">
          <RaisedButton 
            label="Reset Changes" 
            onClick={this.resetChanges}
            style={{marginRight: 15}}
            tabIndex={this.props.tabIndex}
          />
          <RaisedButton 
            primary 
            disabled={this.submitIsDisabled()} 
            label="Submit mapping" 
            onClick={this.submitMapping}
            tabIndex={this.props.tabIndex}
          />
        </div>
      </div>
    );

    const imageViewerModal = (
      <Dialog
        modal={false}
        open={this.state.imageModalOpen}
        onRequestClose={()=>this.toggleImageModal(false)}
        contentStyle={{background: "none", boxShadow: "inherit"}}
        bodyStyle={{padding:0}}
      >
        <ImageViewer 
          isRectoDIY={this.state.activeImage? this.state.activeImage.isDIY : false}
          rectoURL={this.state.activeImage? this.state.activeImage.url : ""} 
        />
      </Dialog>
    );

    return (
      <div className="imageMapper">
        <div className="topPanel">
          <div className="boards" role="region" aria-label="map board">
            {mapBoard}
          </div>
        </div>
        {middlePanel}
        <div className="bottomPanel">
          {sideBacklog}
          {imageBacklog}
        </div>
        {mainToolBar}
        {imageViewerModal}
      </div>
    );
  }
}

