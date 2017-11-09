import React, { Component } from 'react';
import { ItemTypes } from './Constants';
import { DragSource, DropTarget } from 'react-dnd';

const sideSource = {
  beginDrag(props) {
    return { 
      id: props.side.id,
      index: props.index,
      object: props.side,
      parentBoardID: props.parentBoardID,
    };
  },
  isDragging(props, monitor) {
    return props.side.id === monitor.getItem().id;
  },
  endDrag(props, monitor) {
    // const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult && dropResult.id!==props.parentBoardID) {
      // console.log("Item: dropped " + item.id +" into ", dropResult);
    }
  }
};
const sideTarget = {
  drop(props) {
    return {index: props.index}
  },
  hover(props, monitor, component) {
    const draggedId = monitor.getItem().id;
    if (draggedId !== props.side.id) {
      props.moveItem(draggedId, props.side.id, props.parentBoardID)
      const updatedIndex = props.getIndex(monitor.getItem().object, props.parentBoardID);
      if (monitor.getItem().index!==updatedIndex) {
        monitor.getItem().index = updatedIndex;
        monitor.getItem().parentBoardID = props.parentBoardID;
      }
    }
	},
};

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

class SideItem extends Component {
  render() {
    const { side, connectDragSource, connectDropTarget, isDragging } = this.props;
    const folioNumber = side.folioNumber!=="None"? " ("+side.folioNumber+")" : "";
    return connectDragSource(
      connectDropTarget(
      <div>
        {isDragging? <div style={{height: 50}}></div>:
        <div className="draggableItem">
            <div className="text">
              {"Leaf " + side.leafOrder + " " + side.sideType + folioNumber}
            </div>
        </div>}
      </div>
      
    ));
  }
}
export default DragSource(ItemTypes.SIDE, sideSource, dragCollect)(DropTarget(ItemTypes.SIDE, sideTarget, dropCollect)(SideItem));
