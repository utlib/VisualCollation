import React from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import Group from './tabularMode/Group';


/** Stateless functional component that mounts the root groups. */
export default class TabularMode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusGroupID: [],
      focusLeafID: null,
    }
  }
  
  toggleFocusGroup = (id) => {
    let newList = [];
    if (id!==null) {
      // Push to array
      newList = update(this.state.focusGroupID, {$push: [id]});
    } else {
      // Pop the array
      newList = update(this.state.focusGroupID, {$splice: [[this.state.focusGroupID.length-1, 1]]});
    }
    this.setState({focusGroupID: newList});
  }

  toggleFocusLeaf = (id) => {
    this.setState({focusLeafID: id, focusGroupID: [this.state.focusGroupID[this.state.focusGroupID.length-1]]});
  }

  render() {  
    let group_components = [];
    for (let groupID of this.props.project.groupIDs){
      const group = this.props.project.Groups[groupID]
      if (group.nestLevel === 1)
        group_components.push(
          <Group  
            key={group.id}
            activeGroup={group}
            project={this.props.project}
            collationManager={this.props.collationManager}
            handleObjectClick={this.props.handleObjectClick}
            toggleFocusGroup={this.toggleFocusGroup}
            toggleFocusLeaf={this.toggleFocusLeaf}
            focusGroupID={this.state.focusGroupID.length>0? this.state.focusGroupID[this.state.focusGroupID.length-1] : null}
            focusLeafID={this.state.focusLeafID}
            handleObjectPress={this.props.handleObjectPress}
            tabIndex={this.props.tabIndex}
          />
        );
    }

    let emptyResults = false;
    const activeFiltersLength = this.props.collationManager.filters.Groups.length + this.props.collationManager.filters.Leafs.length + this.props.collationManager.filters.Sides.length + this.props.collationManager.filters.Notes.length;
    if (activeFiltersLength===0)
      emptyResults = true && this.props.collationManager.filters.hideOthers && this.props.collationManager.filters.active

    return (
      <div>
        {emptyResults ? <h2>No objects match the query</h2> : group_components}
      </div>
    );
  }
}

TabularMode.propTypes = {
  /** Callback for handling clicking on an object (group or leaf) */
  handleObjectClick: PropTypes.func,
}

