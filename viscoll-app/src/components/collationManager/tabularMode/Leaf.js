import React from 'react';
import PropTypes from 'prop-types';
import Side from './Side';

/** Stateless functional component that displays one leaf in the tabular edit mode.  */

const Leaf = (props) => {
  const { activeLeaf } = props;
  const { 
    selectedObjects, 
    filters, 
    defaultAttributes, 
    visibleAttributes,
    flashItems 
  } = props.collationManager;
  const isActive = selectedObjects.members.includes(activeLeaf.id);
  const isFiltered = filters.Leafs.includes(activeLeaf.id);
  const leafsOfMatchingElements = filters.LeafsOfMatchingSides + filters.LeafsOfMatchingNotes;
  const isAffectedFiltered = leafsOfMatchingElements.includes(activeLeaf.id) && !isFiltered;
  const hideOthers = filters.hideOthers;
  const isFilterActive = filters.active;
  let leafAttributes = [];
  let sideAttributesActive = false;

  // Determine if any side attributes are active (visibility toggled)
  for (let sideAttribute of defaultAttributes.side) {
    let attributeName = sideAttribute.name;
    if (visibleAttributes.side[attributeName]) {
      sideAttributesActive = true;
      break;
    } 
  }

  // Render any visible leaf attributes
  for (let leafAttribute of defaultAttributes.leaf) {
    let attributeName = leafAttribute.name;
    if (visibleAttributes.leaf[attributeName]) {
      let divStyle = "attribute ";
      if (isActive) divStyle += "active ";
        leafAttributes.push(
          <div className={divStyle} key={"infoLeaf"+leafAttribute.displayName}>
            <div>
            <span>{leafAttribute.displayName}</span>
            {activeLeaf[attributeName]}
            </div>
          </div>
        );
    }
  }



  let activeLeafStyle = {};
  if (isFiltered && !hideOthers) {
    activeLeafStyle["borderColor"] = "#0f7fdb";
  }
  if (isAffectedFiltered && hideOthers && isFilterActive){
    activeLeafStyle["backgroundColor"] = "#d9dbdb";
    activeLeafStyle["borderColor"] = "#d9dbdb";
  }
  
  let sideComponents;
  let sideClassName = "sideToggle";
  if (sideAttributesActive) {
    sideClassName = "sideSection";
  }
  const rectoSide = props.Rectos[activeLeaf.rectoID];
  const versoSide = props.Versos[activeLeaf.versoID];
  sideComponents = (
    <div className={sideClassName}>
      <Side 
        key={rectoSide.id}
        activeSide={rectoSide} 
        collationManager={props.collationManager}
        handleObjectClick={props.handleObjectClick}
        toggleFocusLeaf={props.toggleFocusLeaf}
        focusLeafID={props.focusLeafID}
        handleObjectPress={props.handleObjectPress}
        tabIndex={props.tabIndex}
      />
      <Side 
        key={versoSide.id}
        activeSide={versoSide} 
        collationManager={props.collationManager}
        handleObjectClick={props.handleObjectClick}
        toggleFocusLeaf={props.toggleFocusLeaf}
        focusLeafID={props.focusLeafID}
        handleObjectPress={props.handleObjectPress}
        tabIndex={props.tabIndex}
      />
    </div>
  );


  let sectionStyle = "leafSection ";
  if (isActive) sectionStyle += "active ";
  if (props.focusLeafID === activeLeaf.id) sectionStyle += "focus";

  let leafComponent =  <div 
                  className={flashItems.leaves.includes(activeLeaf.order)? "flash leafContainer" : "leafContainer"}
                >
                  <div className="itemContainer">
                    <div 
                      className={sectionStyle} 
                      onClick={(event) => {props.handleObjectClick(activeLeaf, event);event.stopPropagation()}}
                      style={{ ...activeLeafStyle }}
                      onMouseEnter={()=>props.toggleFocusLeaf(activeLeaf.id)}
                      onMouseLeave={()=>props.toggleFocusLeaf(null)}
                    >
                      <div className="itemName">
                        Leaf {activeLeaf.order} 
                        <input 
                          aria-label={"Leaf " + activeLeaf.order}
                          name={"tabular"} 
                          type="radio"
                          onKeyPress={(e)=>{if(e.key===" "){props.handleObjectPress(activeLeaf, e)}}}
                          onClick={(e)=>{props.handleObjectPress(activeLeaf, e);e.stopPropagation();}}
                          tabIndex={props.tabIndex}
                        />
                      </div>
                      {leafAttributes.length>0?
                      <div className="itemAttributes">
                        {leafAttributes}
                      </div>
                      :""}
                    </div>
                    {sideComponents}
                  </div>
                </div>

  if (!isFiltered && hideOthers && isFilterActive && !isAffectedFiltered)
    leafComponent = <div></div>;

  return (
    leafComponent
  );
}
Leaf.propTypes = {
  /** Leaf object */
  activeLeaf: PropTypes.object,
  /** Callback for handling clicking on an object (group or leaf) */
  handleObjectClick: PropTypes.func,
}

export default Leaf;
