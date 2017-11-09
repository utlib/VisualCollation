import React from 'react';
import PropTypes from 'prop-types';
import Group from './tabularMode/Group';


/** Stateless functional component that mounts the root groups. */
const TabularMode = (props) => {
  const { filters } = props.collationManager
  const { Groups, groupIDs } = props.project
  let group_components = [];
  for (let groupID of groupIDs){
    const group = Groups[groupID]
    if (group.nestLevel === 1)
      group_components.push(
        <Group  
          key={group.id}
          activeGroup={group}
          project={props.project}
          collationManager={props.collationManager}
          handleObjectClick={props.handleObjectClick}
        />
      );
  }

  let emptyResults = false;
  const activeFiltersLength = filters.Groups.length + filters.Leafs.length + filters.Sides.length + filters.Notes.length;
  if (activeFiltersLength===0)
    emptyResults = true && filters.hideOthers && filters.active

  return (
    <div>
      {emptyResults ? <h2>No objects match the query</h2> : group_components}
    </div>
  );
}

TabularMode.propTypes = {
  /** Callback for handling clicking on an object (group or leaf) */
  handleObjectClick: PropTypes.func,
}

export default TabularMode;
