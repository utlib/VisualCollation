import { createLeaves, deleteLeaf } from './leafActions';
import { getLeafMembers } from './helperActions';

export function createGroups(action, state) {
  const parentGroupID = action.payload.request.data.additional.parentGroupID
  const parentGroup = parentGroupID ? state.project.Groups[parentGroupID] : null
  const noOfGroups = action.payload.request.data.additional.noOfGroups
  const noOfLeaves = action.payload.request.data.additional.noOfLeafs
  const memberOrder = action.payload.request.data.additional.memberOrder
  const globalOrder = action.payload.request.data.additional.order
  const autoConjoin = action.payload.request.data.additional.conjoin
  const oddMemberLeftOut = action.payload.request.data.additional.oddMemberLeftOut
  const groupIDs = action.payload.request.data.additional.groupIDs
  const leafIDs = action.payload.request.data.additional.leafIDs
  const sideIDs = action.payload.request.data.additional.sideIDs
  const title = action.payload.request.data.group.title
  const type = action.payload.request.data.group.type
  const tacketed = action.payload.request.data.group.tacketed
  const sewing = action.payload.request.data.group.sewing
  let newlyAddedGroupIDs = []
  for (let count = 0; count < noOfGroups; count++) {
    // Create new Group with give groupID
    state.project.Groups["Group_" + groupIDs[count]] = {
      id: "Group_" + groupIDs[count],
      title: title? title : "None",
      type: type? type : "Quire",
      tacketed: tacketed? tacketed : [],
      sewing: sewing? sewing : [],
      nestLevel: parentGroup ? parentGroup.nestLevel+1 : 1,
      parentID: parentGroup ? parentGroup.id : null,
      notes: [],
      memberType: "Group",
      memberIDs: leafIDs.slice(count*noOfLeaves, count*noOfLeaves+noOfLeaves).map(leafID => "Leaf_"+leafID)
    }
    newlyAddedGroupIDs.push("Group_" + groupIDs[count])
  }
  // Add newlyAddedGroupIDs to the parentGroup's memberIDs list if parentGroup exist
  if (parentGroup) state.project.Groups[parentGroupID].memberIDs.splice(memberOrder-1, 0, ...newlyAddedGroupIDs)
  // Add newlyAddedGroupIDs to the active project's groupIDs list
  state.project.groupIDs.splice(globalOrder-1, 0, ...newlyAddedGroupIDs)
  // Populate leafIDs recursively and replace the active project's leafIDs list
  let updatedLeafIDs = [];
  for (let groupID of state.project.groupIDs) {
    const group = state.project.Groups[groupID];
    if (group.nestLevel===1) getLeafMembers(group.memberIDs, state, updatedLeafIDs)
  }
  state.project.leafIDs = updatedLeafIDs;
  // Create new leaves for each new Group
  let groupCount = 0
  for (let groupID of newlyAddedGroupIDs){
    const action = {payload: {request: {data: {
      leaf: { parentID: groupID },
      additional: {
        noOfLeafs: noOfLeaves,
        conjoin: autoConjoin,
        oddMemberLeftOut: oddMemberLeftOut,
        leafIDs: leafIDs.slice(groupCount*noOfLeaves, groupCount*noOfLeaves+noOfLeaves),
        sideIDs: sideIDs.slice(groupCount*2*noOfLeaves, groupCount*2*noOfLeaves+2*noOfLeaves)
      }
    }}}}
    state = createLeaves(action, state, true)
    groupCount += 1
  }
  // Generate the list of new Groups and Leaves to flash
  state.collationManager.flashItems.leaves = leafIDs.map((leafID)=>"Leaf_"+leafID);
  state.collationManager.flashItems.groups = [...newlyAddedGroupIDs]
  return state
}

export function updateGroup(action, state) {
  const updatedGroupID = action.payload.request.url.split("/").pop();
  const updatedGroup = action.payload.request.data.group
  // Update the group with id updatedGroupID
  state.project.Groups[updatedGroupID] = { ...state.project.Groups[updatedGroupID], ...updatedGroup }
  return state
}


export function updateGroups(action, state) {
  const updatedGroups = action.payload.request.data.groups
  for (let updatedGroup of updatedGroups) {
    // Update the group of id updatedGroup.id with attributes updatedGroup.attributes
    state.project.Groups[updatedGroup.id] = { ...state.project.Groups[updatedGroup.id], ...updatedGroup.attributes }
  }
  return state
}


export function deleteGroup(deletedGroupID, state) {
  const deletedGroup = state.project.Groups[deletedGroupID]
  // Remove deletedGroupID from groupIDs list
  let deletedGroupIDIndex = state.project.groupIDs.indexOf(deletedGroupID)
  state.project.groupIDs.splice(deletedGroupIDIndex, 1)
  // Unlink all Notes of deletedGroupID
  for (let noteID in state.project.Notes) {
    deletedGroupIDIndex = state.project.Notes[noteID].objects.Group.indexOf(deletedGroupID)
    if (deletedGroupIDIndex !== -1)
    state.project.Notes[noteID].objects.Group.splice(deletedGroupIDIndex, 1)
  }
  // Remove deletedGroupID from deletedGroupParent's memberIDs list if exists
  if (deletedGroup.parentID ) {
    const deletedGroupParent = state.project.Groups[deletedGroup.parentID]
    deletedGroupIDIndex = deletedGroupParent.memberIDs.indexOf(deletedGroupID)
    state.project.Groups[deletedGroup.parentID].memberIDs.splice(deletedGroupIDIndex, 1)
  }
  // Remove all Group members of deletedGroup
  for (let memberID of [...deletedGroup.memberIDs]){
    if (memberID.charAt(0)==="G")
      deleteGroup(memberID, state)
    else
      deleteLeaf(memberID, state)
  }
  // Reset selectedObjects to empty list
  state.collationManager.selectedObjects = { type: "", members: [], lastSelected: "" }
  // Remove the deletedGroupID from Groups
  delete state.project.Groups[deletedGroupID]
  return state
}


export function deleteGroups(deletedGroupIDs, state) {
  for (let deletedGroupID of deletedGroupIDs) {
    if (state.project.Groups.hasOwnProperty(deletedGroupID))
      deleteGroup(deletedGroupID, state)
  }
  return state
}