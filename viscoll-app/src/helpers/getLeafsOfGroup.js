export function getLeafsOfGroup(group, Leafs, includeNone=true){
  let leafMembersOfCurrentGroup = [];
  if (includeNone) {
    leafMembersOfCurrentGroup.push({
      order: "None",
      id: "None",
    })
  }
  for (let memberID of group.memberIDs) {
    if (memberID.charAt(0)==="L") leafMembersOfCurrentGroup.push(Leafs[memberID]);
  }
  return leafMembersOfCurrentGroup;
}
