import React, { Component } from 'react';
import { ItemTypes } from './Constants';
import { DropTarget } from 'react-dnd';
import ImageItem from './ImageItem';

const boardTarget = {
  drop(props) {
    return {id: props.id}
  },
  hover(props, monitor, component) {
    // console.log("bin hover", props, monitor.getItem(), component);
    const item = monitor.getItem();
    const moveToCorrectBacklog = !props.id.includes("imageBacklog") || (props.id.includes("imageBacklog") && item.object.binOrigin===props.id);
    if (moveToCorrectBacklog && props.id!==item.parentBoardID && !props.images.find((img)=>img.id===item.id)) {
      const addToFrontOfList = props.id.includes("imageBacklog");
      props.changeBins(item.parentBoardID, props.id, item.object, addToFrontOfList);
      monitor.getItem().parentBoardID = props.id;
    }
  },
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

class ImageBin extends Component {
  render() {
    const { connectDropTarget, isOver, canDrop } = this.props;
    if (this.props.isVisible) {
      return connectDropTarget(
        <div style={{
          height: "100%",
          background: (canDrop&&isOver)? "": "",
        }}>
          {this.props.images.length===0&&this.props.id.includes("Board")?<div className="binText">Drag items from the "images backlog" to this area</div>:""}
          {this.props.images.map((image, index)=>
            <div style={{marginBottom:2}} key={this.props.id+image.id+index} >
              <ImageItem 
                parentBoardID={this.props.id}
                image={image} 
                index={index} 
                reorderItem={this.props.reorderItem} 
                moveItem={this.props.moveItem}
                changeBins={this.props.changeBins} 
                getIndex={this.props.getIndex}
                toggleImageModal={this.props.toggleImageModal}
              />
            </div>
          )}
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}


export default DropTarget(ItemTypes.IMAGE, boardTarget, collect)(ImageBin);