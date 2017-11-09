export function getLeafsOfGroup(group, Leafs){
  let leafMembersOfCurrentGroup = [];
  leafMembersOfCurrentGroup.push({
    order: "None",
    id: null
  })
  for (let memberID of group.memberIDs) {
    if (memberID.charAt(0)==="L") leafMembersOfCurrentGroup.push(Leafs[memberID]);
  }
  return leafMembersOfCurrentGroup;
}
