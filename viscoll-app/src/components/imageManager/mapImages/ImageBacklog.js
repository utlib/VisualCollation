import React, { Component } from 'react';
import ThumbnailIcon from 'material-ui/svg-icons/editor/insert-photo';
import IconButton from 'material-ui/IconButton';
import Add from 'material-ui/svg-icons/content/add-circle-outline';
import VirtualList from 'react-tiny-virtual-list';


export default class ImageBacklog extends Component {

  renderImageItem = (index, style) => {
    const image = this.props.images[index];
    let actionButtons = (
      <div style={{marginRight: "1em"}}>
        <IconButton 
          tooltip="Move To Mapping" 
          onClick={(event)=>{event.stopPropagation();this.props.moveItemsToMap([image], "imageMapBoard", "imageBacklog")}} 
          tabIndex={this.props.tabIndex}
        >
          <Add />
        </IconButton>
      </div>
    );
    let activeStyle = {};
    if (this.props.selectedObjects.members.find(item => item.label===image.label && item.manifestID===image.manifestID))
      activeStyle = {backgroundColor: "#4ED6CB"}
    return (
      <div key={index} style={{...style, ...activeStyle}} className="draggableItem" onClick={(event)=>this.props.handleObjectClick(this.props.id, image, event)} >
        <div style={{display: 'flex',alignItems:"center"}}>
          <div className="thumbnail" onClick={(e)=>{e.stopPropagation();this.props.toggleImageModal(true, image.url)}}>
            <IconButton aria-label={"View " + image.label + " image"} tooltip="View Image" tabIndex={this.props.tabIndex}>
              <ThumbnailIcon/>
            </IconButton>
          </div>
          <div >
            {image.label}
          </div>
        </div>
        {actionButtons}
      </div>
    );
  }


  render() {
    if (this.props.id==="imageMapBoard") {
      return (
        <div>
          <VirtualList
            width='100%'
            height='40vh'
            itemSize={51}
            itemCount={this.props.images.length}
            renderItem={({index, style}) => this.renderImageItem(index, style)}
            overscanCount={10}
            estimatedItemSize={400}
          />
        </div>
      );
    }

    // imageBacklog
    return (
      <VirtualList
        width='100%'
        height='32vh'
        itemSize={51}
        itemCount={this.props.images.length}
        renderItem={({index, style}) => this.renderImageItem(index, style)}
        overscanCount={10}
        estimatedItemSize={400}
      />
    );


  }
}
