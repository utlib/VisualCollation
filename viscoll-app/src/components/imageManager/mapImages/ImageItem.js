import React, { Component } from 'react';
import { ItemTypes } from './Constants';
import { DragSource, DropTarget } from 'react-dnd';
import ThumbnailIcon from 'material-ui/svg-icons/editor/insert-photo';

const imageSource = {
  beginDrag(props) {
    return { 
      id: props.image.id,
      index: props.index,
      object: props.image,
      parentBoardID: props.parentBoardID,
    };
  },
  isDragging(props, monitor) {
    return props.image.id === monitor.getItem().id;
  },
  endDrag(props, monitor) {
    // const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult && dropResult.id!==props.parentBoardID) {
      // console.log("Item: dropped " + item.id +" into ", dropResult);
    }
  }
};
const imageTarget = {
  drop(props) {
    return {index: props.index}
  },
  hover(props, monitor, component) {
    const draggedId = monitor.getItem().id
    const item = monitor.getItem();
    if (draggedId !== props.image.id) {
      // Do not move items if they don't belong to same backlogs
      if (props.parentBoardID.includes("Backlog") && item.object.binOrigin!==props.parentBoardID) return;
      props.moveItem(draggedId, props.image.id, props.parentBoardID)
      const updatedIndex = props.getIndex(item.object, props.parentBoardID);
      if (item.index!==updatedIndex) {
        item.index = updatedIndex;
        item.parentBoardID = props.parentBoardID;
      }
    }
	},
}

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

class ImageItem extends Component {
  render() {
    const { image, connectDragSource, connectDropTarget, isDragging } = this.props;
    return connectDragSource(
      connectDropTarget(
        <div>
          {isDragging? <div style={{height: 50}}></div>:
          <div className="draggableItem">
              <div className="thumbnail" onTouchTap={()=>this.props.toggleImageModal(true, image.url)}>
                <ThumbnailIcon />
              </div>
              <div className="text">
                { image.id }
                <br />
                <span>{image.binOrigin.split("imageBacklog_")[1]}</span>
                </div>
          </div>}
        </div>
    ));
  }
}
export default DragSource(ItemTypes.IMAGE, imageSource, dragCollect)(DropTarget(ItemTypes.IMAGE, imageTarget, dropCollect)(ImageItem));
