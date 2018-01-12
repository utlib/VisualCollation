import React from 'react';
import Leaf from './Leaf';
import IconButton from 'material-ui/IconButton';
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import ExpandLess from 'material-ui/svg-icons/navigation/expand-less';

/** Displays one group in the tabular edit mode. Recursively mounts nested groups and leaves. */
export default class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    }
  }

  handleChange = (type, value) => {
    this.setState({[type]:value});
  }

  render() {

    const isActive = this.props.collationManager.selectedObjects.members.includes(this.props.activeGroup.id);
    const isFiltered = this.props.collationManager.filters.Groups.includes(this.props.activeGroup.id);
    const groupsOfMatchingElements = this.props.collationManager.filters.GroupsOfMatchingLeafs + this.props.collationManager.filters.GroupsOfMatchingSides + this.props.collationManager.filters.GroupsOfMatchingNotes;
    const isAffectedFiltered = groupsOfMatchingElements.includes(this.props.activeGroup.id) && !isFiltered;
    const hideOthers = this.props.collationManager.filters.hideOthers;
    const isFilterActive = this.props.collationManager.filters.active;
    // Populate all the members of this Group.
    let groupMembers = [];
    this.props.activeGroup.memberIDs.forEach((memberID, index) => {
      if (memberID.charAt(0)==="L"){
          let current_leaf = this.props.project.Leafs[memberID];
          groupMembers.push(
            <Leaf  
              key={current_leaf.id}
              activeLeaf={current_leaf}
              activeLeafOrder={this.props.project.leafIDs.indexOf(current_leaf.id) + 1}
              Rectos={this.props.project.Rectos}
              Versos={this.props.project.Versos}
              collationManager={this.props.collationManager}
              handleObjectClick={this.props.handleObjectClick}
              toggleFocusLeaf={this.props.toggleFocusLeaf}
              focusLeafID={this.props.focusLeafID}
              handleObjectPress={this.props.handleObjectPress}
              tabIndex={this.props.tabIndex}
              leafIDs={this.props.leafIDs}
            />
          );
        } else {
          let current_group =  this.props.project.Groups[memberID];
          groupMembers.push(
            <Group 
              key={current_group.id}
              activeGroup={current_group}
              activeGroupOrder={this.props.project.groupIDs.indexOf(current_group.id) + 1}
              project={this.props.project}
              collationManager={this.props.collationManager}
              handleObjectClick={this.props.handleObjectClick}
              focusLeafID={this.props.focusLeafID}
              focusGroupID={this.props.focusGroupID}
              toggleFocusGroup={this.props.toggleFocusGroup}
              toggleFocusLeaf={this.props.toggleFocusLeaf}
              handleObjectPress={this.props.handleObjectPress}
              tabIndex={this.props.tabIndex}
              leafIDs={this.props.leafIDs}
            />
          );
        }
    });

    let attributes = [];
    for (var i in this.props.collationManager.defaultAttributes.group) {
      let attributeName = this.props.collationManager.defaultAttributes.group[i].name;
      if (this.props.collationManager.visibleAttributes.group[attributeName]) {
        attributes.push(
          <div className={isActive? "attribute active" : "attribute"} key={"infoGroup"+attributeName}>
            <div>
              <span>{this.props.collationManager.defaultAttributes.group[i].displayName}</span>
              {this.props.activeGroup[attributeName]}
            </div>
          </div>
        );
      }
    }

    let activeGroupStyle = {};
    if (isFiltered && !hideOthers) {
      activeGroupStyle["borderColor"] = "#0f7fdb";
    }
    if (isAffectedFiltered && hideOthers && isFilterActive){
      activeGroupStyle["backgroundColor"] = "#d9dbdb";
      activeGroupStyle["borderColor"] = "#d9dbdb";
    }
    let groupContainerClasses = "groupContainer ";
    if (this.props.collationManager.flashItems.groups.includes(this.props.activeGroup.id)) groupContainerClasses += "flash ";
    if (isActive) groupContainerClasses += "active ";
    if (this.props.focusLeafID===null && this.props.focusGroupID === this.props.activeGroup.id) groupContainerClasses += "focus ";

    let groupComponent =  <div 
                            className={groupContainerClasses}
                            style={activeGroupStyle}
                            onMouseEnter={()=>this.props.toggleFocusGroup(this.props.activeGroup.id)}
                            onMouseLeave={()=>this.props.toggleFocusGroup(null)}
                            onClick={(event) =>this.props.handleObjectClick(this.props.activeGroup, event)}
                          >
                              <div className={"itemContainer group"}>
                                <div className="groupSection">
                                  <div className="itemName">
                                    Group {this.props.activeGroupOrder}
                                    <input 
                                      aria-label={"Group " + this.props.activeGroupOrder}
                                      name={"tabular"} 
                                      type="radio"
                                      onKeyPress={(e)=>{if(e.key===" "){this.props.handleObjectPress(this.props.activeGroup, e)}}}
                                      onClick={(e)=>{this.props.handleObjectPress(this.props.activeGroup, e);}}
                                      tabIndex={this.props.tabIndex}
                                    />
                                  </div>
                                  {attributes}
                                </div>
                                <div className="toggleButton">
                                  <IconButton 
                                    onClick={(e)=>{e.stopPropagation();e.preventDefault();this.handleChange("open", !this.state.open)}}
                                    aria-label={this.state.open?"Collapse group " + this.props.activeGroupOrder : "Expand group " + this.props.activeGroupOrder }
                                    tabIndex={this.props.tabIndex}
                                    tooltip={this.state.open?"Collapse group" : "Expand group"}
                                  >
                                    {this.state.open? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </div>
                              </div>
                            <div className={this.state.open? "groupMembers" : "groupMembers hidden"}>   
                              {groupMembers}
                            </div>
                          </div>

      if (!isFiltered && hideOthers && isFilterActive && !isAffectedFiltered)
        groupComponent = <div></div>;

      return (
        groupComponent
      );
    }
  }


 