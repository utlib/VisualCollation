import React from 'react';
import PropTypes from 'prop-types';
import Leaf from './Leaf';
import {Card, CardText, CardHeader} from 'material-ui/Card';
import tabularStyle from '../../../styles/tabular';

/** Stateless functional component that displays one group in the tabular edit mode. Recursively mounts nested groups and leaves. */
const Group = (props) => {
  const { activeGroup } = props;
  const { Leafs, Groups, Rectos, Versos } = props.project
  const { 
    selectedObjects, 
    filters, 
    defaultAttributes, 
    visibleAttributes,
    flashItems 
  } = props.collationManager;
  const isActive = selectedObjects.members.includes(activeGroup.id);
  const isFiltered = filters.Groups.includes(activeGroup.id);
  const groupsOfMatchingElements = filters.GroupsOfMatchingLeafs + filters.GroupsOfMatchingSides + filters.GroupsOfMatchingNotes;
  const isAffectedFiltered = groupsOfMatchingElements.includes(activeGroup.id) && !isFiltered;
  const hideOthers = filters.hideOthers;
  const isFilterActive = filters.active;
  // Populate all the members of this Group.
  let groupMembers = [];
  activeGroup.memberIDs.forEach((memberID, index) => {
    if (memberID.charAt(0)==="L"){
        let current_leaf = Leafs[memberID];
        groupMembers.push(
          <Leaf  
            key={current_leaf.id}
            activeLeaf={current_leaf}
            Rectos={Rectos}
            Versos={Versos}
            collationManager={props.collationManager}
            handleObjectClick={props.handleObjectClick}
          />
        );
      } else {
        let current_group =  Groups[memberID];
        groupMembers.push(
          <Group 
            key={current_group.id}
            activeGroup={current_group}
            project={props.project}
            collationManager={props.collationManager}
            handleObjectClick={props.handleObjectClick}
          />
        );
      }
  });


  let attributes = [];
  for (var i in defaultAttributes.group) {
    let attributeName = defaultAttributes.group[i].name;
    if (visibleAttributes.group[attributeName]) {
      attributes.push(
        <div className={isActive? "attribute active" : "attribute"} key={"infoGroup"+attributeName}>
          <div>
            <span>{defaultAttributes.group[i].displayName}</span>
            {activeGroup[attributeName]}
          </div>
        </div>
      );
    }
  }

  let activeGroupStyle = {borderColor:"white"};
  if (isActive) {
    activeGroupStyle["backgroundColor"] = "#4ED6CB";
    activeGroupStyle["borderColor"] = "#4ED6CB";
  }
  if (isFiltered && !hideOthers) {
    activeGroupStyle["borderColor"] = "#0f7fdb";
  }
  if (isAffectedFiltered && hideOthers && isFilterActive){
    activeGroupStyle["backgroundColor"] = "#d9dbdb";
    activeGroupStyle["borderColor"] = "#d9dbdb";
  }
  let groupComponent =  <Card 
                          expandable={true} 
                          initiallyExpanded={true} 
                          style={{...tabularStyle.group.card, ...activeGroupStyle}} 
                          containerStyle={tabularStyle.group.containerStyle}
                          className={flashItems.groups.includes(activeGroup.order)? "flash groupCard" : "groupCard"}
                          >
                          <CardHeader
                            showExpandableButton={true}
                            onMouseDown={(event) => props.handleObjectClick(activeGroup, event)}
                            style={tabularStyle.group.cardHeader}
                          >
                            <div className={isActive?"itemContainer group active":"itemContainer group"}>
                              <div className="itemName">
                                Group {activeGroup.order}
                              </div>
                            {attributes}
                            </div>
                          </CardHeader>
                          <CardText expandable={true} style={tabularStyle.group.cardTextStyle}>   
                             
                            {groupMembers}
                          </CardText>
                        </Card>

  if (!isFiltered && hideOthers && isFilterActive && !isAffectedFiltered)
    groupComponent = <Card></Card>;

  return (
    groupComponent
  );
}
Group.propTypes = {
  /** Group object */
  activeGroup: PropTypes.object,
  /** Callback for handling clicking on an object (group or leaf) */
  handleObjectClick: PropTypes.func,
}

export default Group;
