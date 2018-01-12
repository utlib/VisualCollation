export function getMemberOrder(member, Groups, groupIDs) {
  const parentID = member.parentID
  if (parentID){
    return Groups[parentID].memberIDs.indexOf(member.id)+1
  } else {
    // member is a root Group. Find member order from groupIDs
    return groupIDs.indexOf(member.id)+1
  }

}
