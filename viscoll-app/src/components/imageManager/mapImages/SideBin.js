import React, { Component } from 'react';
import { ItemTypes } from './Constants';
import { DropTarget } from 'react-dnd';
import SideItem from './SideItem';

const boardTarget = {
  drop(props) {
    return {id: props.id}
  },
  hover(props, monitor, component) {
    // console.log("bin hover", props, monitor.getItem(), component);
    const item = monitor.getItem();
    if (props.id!==item.parentBoardID && !props.sides.find((side)=>side.id===item.id)) {
      const addToFrontOfList = props.id==="sideBacklog";
      props.changeBins(item.parentBoardID, props.id, item.object, addToFrontOfList);
      monitor.getItem().parentBoardID = props.id;
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

class SideBin extends Component {
  render() {
    const { connectDropTarget } = this.props;
    
    return connectDropTarget(
      <div style={{
        position: 'relative',
        height: '100%',
      }}>
        {this.props.sides.length===0 && this.props.id.includes("Board")?<div className="binText">Drag items from the "sides backlog" to this area</div>:""}
        {this.props.sides.map((side, index)=>
          <div style={{marginBottom:2}} key={this.props.id+side.id+index} >
          <SideItem 
            parentBoardID={this.props.id}
            side={side} 
            index={index} 
            reorderItem={this.props.reorderItem} 
            changeBins={this.props.changeBins} 
            getIndex={this.props.getIndex}
            moveItem={this.props.moveItem}
          />
          </div>
        )}
      </div>
    );
  }
}


export default DropTarget(ItemTypes.SIDE, boardTarget, collect)(SideBin);