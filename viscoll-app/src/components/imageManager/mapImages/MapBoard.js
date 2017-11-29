import React, { Component } from 'react';
import ThumbnailIcon from 'material-ui/svg-icons/editor/insert-photo';
import IconButton from 'material-ui/IconButton';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-downward';
import ArrowUp from 'material-ui/svg-icons/navigation/arrow-upward';
import Remove from 'material-ui/svg-icons/content/remove-circle-outline';
import VirtualList from 'react-tiny-virtual-list';


export default class ImageBin extends Component {




  renderSideItem = (index) => {
    const sideID = this.props.sideIDs[index];
    const side = sideID.charAt(0)==="R" ? this.props.Rectos[sideID] : this.props.Versos[sideID];
    const folioNumber = side.folio_number!=="None" ? side.folio_number : "";
    let actionButtons = (
      <div style={{paddingRight: "1em"}} onClick={(event)=> event.stopPropagation()}>
        <IconButton 
          tooltip={index===0?"":"Move Up" }
          aria-label={"Move " + folioNumber + " up"}
          onClick={()=>this.props.moveItemUpOrDown(sideID, "sideMapBoard", "up")} 
          disabled={index===0}
          tabIndex={this.props.tabIndex}
        >
          <ArrowUp />
        </IconButton>
        <IconButton 
          tooltip={index===this.props.sideIDs.length-1?"":"Move Down"}
          aria-label={"Move " + folioNumber + " down"}
          onClick={()=>this.props.moveItemUpOrDown(sideID, "sideMapBoard", "down")} 
          disabled={index===this.props.sideIDs.length-1}
          tabIndex={this.props.tabIndex}
        >
          <ArrowDown />
        </IconButton>
        <IconButton 
          tooltip="Remove" 
          aria-label={"Remove " + folioNumber}
          onClick={()=>this.props.moveItemsToBacklog([sideID], "sideMapBoard", "sideBacklog")} 
          tabIndex={this.props.tabIndex}
        >
          <Remove />
        </IconButton>
      </div>
    );
    let activeStyle = {};
    if (this.props.selectedObjects.members.includes(sideID))
      activeStyle = {backgroundColor: "#4ED6CB"}
    return (
      <div key={side.id} style={{...activeStyle, width: '49%', float: 'left'}} className="draggableItem" onClick={(event)=>this.props.handleObjectClick("sideMapBoard", sideID, event)}>
        <div className="text"  style={{display: 'inline-block'}} onClick={(event)=> event.stopPropagation()}>
          {"Leaf " + side.parentOrder + " " + side.memberType + " (" + folioNumber+")"}
        </div>
        {actionButtons}
      </div>
    );
  }

  renderGhostSideItem = (index) => {
    return (<div key={index} style={{width: '49%', float: 'left', backgroundColor: '#eaeaea'}} className="draggableItem"/>);
  }

  renderImageItem = (index) => {
    const image = this.props.images[index];
    let actionButtons = (
      <div style={{paddingRight: "1em"}} onClick={(event)=> event.stopPropagation()}>
        <IconButton 
          tooltip={index===0?"":"Move Up"}
          aria-label={"Move " + image.label + " up"}
          onClick={()=>this.props.moveItemUpOrDown(image, "imageMapBoard", "up")} 
          disabled={index===0}
          tabIndex={this.props.tabIndex}
        >
          <ArrowUp />
        </IconButton>
        <IconButton 
          tooltip={index===this.props.images.length-1?"":"Move Down"}
          aria-label={"Move " + image.label + " down"}
          onClick={()=>this.props.moveItemUpOrDown(image, "imageMapBoard", "down")} 
          tabIndex={this.props.tabIndex}
          disabled={index===this.props.images.length-1}
        >
          <ArrowDown />
        </IconButton>
        <IconButton 
          tooltip="Remove" 
          aria-label={"Remove " + image.label}
          onClick={()=>this.props.moveItemsToBacklog([image], "imageMapBoard", "imageBacklog")} 
          tabIndex={this.props.tabIndex}
        >
          <Remove />
        </IconButton>
      </div>
    );
    let activeStyle = {};
    if (this.props.selectedObjects.members.find(item => item.label===image.label && item.manifestID===image.manifestID))
      activeStyle = {backgroundColor: "#4ED6CB"}
    return (
      <div key={image.label} style={{...activeStyle, width: '49%', float: 'right'}} className="draggableItem" onClick={(event)=>this.props.handleObjectClick("imageMapBoard", image, event)} >
        <div style={{display:"flex",alignItems:"center"}}>
          <div className="thumbnail" onClick={(e)=>{e.stopPropagation();this.props.toggleImageModal(true, image.url)}}>
            <IconButton aria-label={"View " + image.label + " image"} tooltip="View Image" tabIndex={this.props.tabIndex}>
              <ThumbnailIcon/>
            </IconButton>
          </div>
          <div onClick={(event)=> event.stopPropagation()}>
            {image.label}
          </div>
        </div>
        {actionButtons}
      </div>
    );
  }


  renderGhostImageItem = (index) => {
    return (<div key={index} style={{width: '49%', float: 'right', backgroundColor: '#eaeaea'}} className="draggableItem"/>);
  }


  renderItem = (index, style) => {
    return (
      <div key={index} style={{...style}}>
        {this.props.sideIDs[index] ? 
          this.renderSideItem(index)
          :
          this.renderGhostSideItem(index)
        }
        {this.props.images[index] ? 
          this.renderImageItem(index)
          :
          this.renderGhostImageItem(index)
        }
      </div>
    );
  }


  render() {
    if (this.props.sideIDs.length===0 && this.props.images.length===0){
      return (
        <div className="binText"><div>Move items from the "backlog" into this area</div></div>
      );
    }

    return (
      <VirtualList
        width='100%'
        height='39vh'
        itemSize={51}
        itemCount={Math.max(this.props.sideIDs.length, this.props.images.length)}
        renderItem={({index, style}) => this.renderItem(index, style)}
        overscanCount={10}
        estimatedItemSize={100}
      />
    );


  }
}
