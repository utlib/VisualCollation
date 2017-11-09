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
    let attributeName = attribute.name;
    if (visibleAttributes.side[attributeName]) {
      sideAttributes.push(
        <div 
          className={isActive?"attribute active":"attribute"} 
          key={activeSide.id+attributeName}
        >
          <span>{attribute.displayName}:</span> {activeSide[attributeName]}
        </div>
      );
    } 
  }

  let activeSideStyle = {};

  if (isActive) {
    activeSideStyle["backgroundColor"] = "#4ED6CB";
    activeSideStyle["borderColor"] = "#4ED6CB";
  }

  if (isFiltered && !hideOthers) {
    activeSideStyle["borderColor"] = "#0f7fdb";
  }

  if (isAffectedFiltered && hideOthers && isFilterActive){
    activeSideStyle["backgroundColor"] = "#d9dbdb";
    activeSideStyle["borderColor"] = "#d9dbdb";
  }

  const activeSideName = activeSide.id.split("_")[0];
  let sideComponent = (
    <div 
      className="side" 
      title={`Activate ${activeSideName} Side`} 
      onMouseDown={(event) => props.handleObjectClick(activeSide, event)}
      style={{ ...activeSideStyle }}
    >
      {activeSideName.charAt(0)}
    </div>
  );

  if (sideAttributes.length>0) {
    sideComponent = (
      <div 
        className="side" 
        onMouseDown={(event) => props.handleObjectClick(activeSide, event)}
        style={{ ...activeSideStyle }}
      >
        <div className="name">{activeSideName}</div>
        {sideAttributes}
      </div>
    );
  }


  return (
    sideComponent
  );
}


export default Side;
