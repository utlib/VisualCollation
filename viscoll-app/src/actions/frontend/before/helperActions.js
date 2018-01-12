export function getLeafMembers(memberIDs, state, leafIDs=[]) {
  for (let memberID of memberIDs){
    if (memberID.charAt(0)==="G"){
      getLeafMembers(state.project.Groups[memberID].memberIDs, state, leafIDs)
    } else {
      leafIDs.push(memberID)
    }
  }
}