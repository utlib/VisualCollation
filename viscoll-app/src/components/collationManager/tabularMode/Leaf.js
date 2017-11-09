import React from 'react';
import PropTypes from 'prop-types';
import {Card} from 'material-ui/Card';
import tabularStyle from '../../../styles/tabular';
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



  let activeLeafStyle = {borderColor: "white"};
  if (isActive) {
    activeLeafStyle["backgroundColor"] = "#4ED6CB";
    activeLeafStyle["borderColor"] = "#4ED6CB";
  }
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
      />
      <Side 
        key={versoSide.id}
        activeSide={versoSide} 
        collationManager={props.collationManager}
        handleObjectClick={props.handleObjectClick}
      />
    </div>
  );


  let leafComponent =  <Card 
                  style={{...tabularStyle.leaf.card}}
                  className={flashItems.leaves.includes(activeLeaf.order)? "flash" : ""}
                >
                  <div className="itemContainer">
                    <div 
                      className={isActive?"leafSection active":"leafSection"} 
                      onMouseDown={(event) => props.handleObjectClick(activeLeaf, event)}
                      style={{ ...activeLeafStyle }}
                    >
                      <div className="itemName">
                        Leaf {activeLeaf.order}
                      </div>
                      {leafAttributes.length>0?
                      <div className="itemAttributes">
                        {leafAttributes}
                      </div>
                      :""}
                    </div>
                    {sideComponents}
                  </div>
                </Card>

  if (!isFiltered && hideOthers && isFilterActive && !isAffectedFiltered)
    leafComponent = <Card></Card>;

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
