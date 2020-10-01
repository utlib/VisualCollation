import {
  addGroups,
  updateGroup,
  updateGroups,
  deleteGroups,
} from '../backend/groupActions';

import {
  helperUndoDeleteLeaves
} from './leafHelper';

import {
  linkNote,
} from '../backend/termActions';

export function undoCreateGroups(action, state) {
  const groupIDs = action.payload.request.data.additional.groupIDs.map((id)=>{return ("Group_"+id)});
  const deleteRequest = deleteGroups({groups: groupIDs}, state.project.id);
  return [deleteRequest];
}

export function undoUpdateGroups(action, state) {
  const requestData = action.payload.request.data.groups;
  let groups = [];
  for (const request of requestData) {
    const group = state.project.Groups[request.id];
    let item = {
      id: request.id,
      attributes: {},
    }
    for (let attribute in request.attributes) {
      if (!request.attributes.hasOwnProperty(attribute)) continue;
      item.attributes[attribute] = group[attribute];
    }
    groups.push(item)
  }
  const historyAction = updateGroups(groups);
  return [historyAction];
}

export function undoUpdateGroup(action, state) {
  const groupID = action.payload.request.url.split("/").pop();
  let attribute = Object.keys(action.payload.request.data.group)[0];

  let group = {
    [attribute]: state.project.Groups[groupID][attribute],
  }
  const historyAction = updateGroup(groupID, group);
  return [historyAction];
}

export function undoDeleteGroup(action, state) {
  const groupID = action.payload.request.url.split("/").pop();
  const historyActions = helperUndoDeleteGroup(groupID, state);
  return historyActions;
}

export function undoDeleteGroups(action, state) {
  const groupIDs = action.payload.request.data.groups;
  let historyActions = [];
  for (const groupID of groupIDs) {
    const group = state.project.Groups[groupID];
    if (!(group.parentID && groupIDs.includes(group.parentID))) {
      historyActions = historyActions.concat(helperUndoDeleteGroup(groupID, state));
    }
  }
  return historyActions;
}

function helperUndoDeleteGroup(groupID, state) {
  const group = state.project.Groups[groupID];
  let historyActions = [];
  // Create emtpy group
  const groupInfo = {
    project_id: state.project.id,
    title: group.title,
    type: group.type,
    tacketed: group.tacketed,
    sewing: group.sewing,
  }
  const additional = {
    noOfGroups: 1,
    leafIDs: [],
    sideIDs: [],
    groupIDs: [groupID.split("_")[1]],
    order: state.project.groupIDs.indexOf(groupID) + 1,
  }
  if (group.parentID) {
    additional["memberOrder"] = state.project.Groups[group.parentID].memberIDs.indexOf(groupID) + 1;
    additional["parentGroupID"] = group.parentID;
  } else {
    additional["memberOrder"] = additional.order;
  }
  historyActions.push(addGroups(groupInfo, additional));

  // Populate members
  const groupedMembers = helperSeparateMembers(group.memberIDs);
  for (let members of groupedMembers) {
    if (members[0][0]==="L") {
      historyActions = historyActions.concat(helperUndoDeleteLeaves(members, state));
    } else {
      // Recurse!
      historyActions = historyActions.concat(helperUndoDeleteGroup(members[0], state));
    }
  }
  // Link notes to group
  if (group.notes.length>0) {
    const objects = [{ id: groupID, type: "Group" }];
    for (const noteID of group.notes) {
      const noteRequest = linkNote(noteID, objects);
      historyActions.push(noteRequest);
    }
  }
  return historyActions;
}

/**
 * Separate members into groups of leaves and groups
 */
function helperSeparateMembers(memberIDs) {
  let result = memberIDs.length>0? [[memberIDs[0]]] : [];
  for (let i=1; i<memberIDs.length; i++) {
    const latestGroup = result[result.length-1];
    const latestItem = latestGroup[latestGroup.length-1];
    const itemID = memberIDs[i];
    if (itemID[0]==="G" || latestItem[0]==="G") {
      result.push([itemID]);
    } else {
      latestGroup.push(itemID);
    }
  }
  return result;
}