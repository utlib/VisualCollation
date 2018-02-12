import React from 'react';
import Side from './Side';

/** Leaf element of collation used in tabular edit mode*/
const Leaf = (props) => {
  const { activeLeaf, project } = props;
  const {
    selectedObjects,
    filters, 
    defaultAttributes, 
    flashItems,
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
    if (project.preferences.side && project.preferences.side[attributeName]) {
      sideAttributesActive = true;
      break;
    } 
  }

  // Render any visible leaf attributes
  for (let leafAttribute of defaultAttributes.leaf) {
    let attributeName = leafAttribute.name;
    if (project.preferences.leaf && project.preferences.leaf[attributeName]) {
      let divStyle = "attribute ";
      if (isActive) divStyle += "active ";
      if (attributeName==="conjoined_to"){
        leafAttributes.push(
          <div className={divStyle} key={"infoLeaf" + leafAttribute.displayName}>
            <div>
              <span>{leafAttribute.displayName}</span>
              {props.leafIDs.indexOf(activeLeaf[attributeName])!==-1 ? `Leaf ${props.leafIDs.indexOf(activeLeaf[attributeName])+1}` : "None"}
            </div>
          </div>
        );
      } else{
        leafAttributes.push(
          <div className={divStyle} key={"infoLeaf" + leafAttribute.displayName}>
            <div>
              <span>{leafAttribute.displayName}</span>
              {activeLeaf[attributeName]}
            </div>
          </div>
        );
      }
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
        activeSideParentOrder={props.leafIDs.indexOf(rectoSide.parentID)+1}
        collationManager={props.collationManager}
        handleObjectClick={props.handleObjectClick}
        toggleFocusLeaf={props.toggleFocusLeaf}
        focusLeafID={props.focusLeafID}
        handleObjectPress={props.handleObjectPress}
        tabIndex={props.tabIndex}
        project={props.project}
      />
      <Side 
        key={versoSide.id}
        activeSide={versoSide} 
        activeSideParentOrder={props.leafIDs.indexOf(versoSide.parentID) + 1}
        collationManager={props.collationManager}
        handleObjectClick={props.handleObjectClick}
        toggleFocusLeaf={props.toggleFocusLeaf}
        focusLeafID={props.focusLeafID}
        handleObjectPress={props.handleObjectPress}
        tabIndex={props.tabIndex}
        project={props.project}
      />
    </div>
  );


  let sectionStyle = "leafSection ";
  if (isActive) sectionStyle += "active ";
  if (props.focusLeafID === activeLeaf.id) sectionStyle += "focus";

  let leafComponent =  <div 
                  className={flashItems.leaves.includes(activeLeaf.id)? "flash leafContainer" : "leafContainer"}
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
                        Leaf {props.activeLeafOrder} 
                        <input 
                          aria-label={"Leaf " + props.activeLeafOrder}
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
export default Leaf;
