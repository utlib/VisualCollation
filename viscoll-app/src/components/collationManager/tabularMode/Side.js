import React from 'react';


const Side = (props) => {
  const { activeSide } = props;
  const { 
    selectedObjects, 
    filters, 
    defaultAttributes, 
    visibleAttributes,
  } = props.collationManager;
  const isActive = selectedObjects.members.includes(activeSide.id);
  const sidesOfMatchingElements = filters.SidesOfMatchingNotes;
  const isFiltered = filters.Sides.includes(activeSide.id);
  const isAffectedFiltered = sidesOfMatchingElements.includes(activeSide.id) && !isFiltered;
  const hideOthers = filters.hideOthers;
  const isFilterActive = filters.active;

  let sideAttributes = [];

  for (let attribute of defaultAttributes.side) {
    if (visibleAttributes.side[attribute.name]) {
      sideAttributes.push(
        <div 
          className={isActive?"attribute active":"attribute"} 
          key={activeSide.id+attribute.name}
        >
          <span>{attribute.displayName}:</span> {activeSide[attribute.name]}
        </div>
      );
    } 
  }

  let activeSideStyle = {};

  if (isFiltered && !hideOthers) {
    activeSideStyle["borderColor"] = "#0f7fdb";
  }

  if (isAffectedFiltered && hideOthers && isFilterActive){
    activeSideStyle["backgroundColor"] = "#d9dbdb";
    activeSideStyle["borderColor"] = "#d9dbdb";
  }

  const activeSideName = activeSide.id.split("_")[0];

  let classNames = "side ";
  if (props.focusLeafID===props.activeSide.id) classNames += "focus ";
  if (isActive) classNames += "active ";

  let sideComponent = (
    <div 
      className={classNames} 
      title={`Activate ${activeSideName} Side`} 
      onClick={(event) => {props.handleObjectClick(activeSide, event); event.stopPropagation();}}
      style={{ ...activeSideStyle }}
      onMouseEnter={()=>props.toggleFocusLeaf(activeSide.id)}
      onMouseLeave={()=>props.toggleFocusLeaf(null)}
    >
      {activeSideName.charAt(0)}
      <input 
        aria-label={"Leaf " + props.activeSideParentOrder + " " + activeSide.memberType + " " + activeSide.folio_number}
        name={"tabular"} 
        type="radio"
        onKeyPress={(e)=>{if(e.key===" "){props.handleObjectPress(activeSide, e)}}}
        onClick={(e)=>{props.handleObjectPress(activeSide, e);e.stopPropagation();}}
        tabIndex={props.tabIndex}
      />
    </div>
  );

  if (sideAttributes.length>0) {
    sideComponent = (
      <div 
        className={classNames} 
        onClick={(event) => {props.handleObjectClick(activeSide, event); event.stopPropagation();}}
        style={{ ...activeSideStyle }}
        onMouseEnter={()=>props.toggleFocusLeaf(activeSide.id)}
        onMouseLeave={()=>props.toggleFocusLeaf(null)}
      >
        <div className="name">
          {activeSideName}
          <input 
            aria-label={"Leaf " + props.activeSideParentOrder + " " + activeSide.memberType + " " + activeSide.folio_number}
            name={"tabular"} 
            type="radio"
            onKeyPress={(e)=>{if(e.key===" "){props.handleObjectPress(activeSide, e)}}}
            onClick={(e)=>{props.handleObjectPress(activeSide, e);e.stopPropagation();}}
            tabIndex={props.tabIndex}
          />
        </div>
        {sideAttributes}
      </div>
    );
  }


  return (
    sideComponent
  );
}


export default Side;
