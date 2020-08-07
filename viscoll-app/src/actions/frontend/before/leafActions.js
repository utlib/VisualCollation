import { getLeafMembers } from './helperActions';

export function autoConjoinLeafs(
  action,
  state,
  leaves,
  oddMemberLeftOut = false
) {
  // Remove the existing conjoined_to of each leaf if it is already conjoined_to another leaf
  for (let leafID of leaves) {
    const leafConjoinedToID = state.project.Leafs[leafID].conjoined_to;
    if (leafConjoinedToID) {
      state.project.Leafs[leafConjoinedToID].conjoined_to = null;
    }
  }
  // Remove the oddLeafID from leaves list
  if (leaves.length % 2 === 1) {
    let oddLeafID;
    if (oddMemberLeftOut) oddLeafID = leaves[oddMemberLeftOut - 1];
    else oddLeafID = leaves[Math.floor(leaves.length / 2)];
    const oddLeafIDIndex = leaves.indexOf(oddLeafID);
    leaves.splice(oddLeafIDIndex, 1);
    state.project.Leafs[oddLeafID].conjoined_to = null;
  }
  for (let i = 0; i < leaves.length; i++) {
    if (leaves.length / 2 === i) break;
    else {
      const leafOneID = leaves[i];
      const leafTwoID = leaves[leaves.length - i - 1];
      state.project.Leafs[leafOneID].conjoined_to = leafTwoID;
      state.project.Leafs[leafTwoID].conjoined_to = leafOneID;
    }
  }
  return state;
}

export function createLeaves(action, state, fromGroupCreation = false) {
  const parentGroupID = action.payload.request.data.leaf.parentID;
  const parentGroup = state.project.Groups[parentGroupID];
  const noOfLeaves = action.payload.request.data.additional.noOfLeafs;
  const memberOrder = action.payload.request.data.additional.memberOrder;
  const globalOrder = action.payload.request.data.additional.order;
  const autoConjoin = action.payload.request.data.additional.conjoin;
  const oddMemberLeftOut =
    action.payload.request.data.additional.oddMemberLeftOut;
  const leafIDs = action.payload.request.data.additional.leafIDs;
  const sideIDs = action.payload.request.data.additional.sideIDs;
  let newlyAddedLeafIDs = [];
  let sideCount = 0;
  for (let count = 0; count < noOfLeaves; count++) {
    // Create new Leaf with give leafID
    state.project.Leafs['Leaf_' + leafIDs[count]] = {
      id: 'Leaf_' + leafIDs[count],
      material: action.payload.request.data.leaf.material
        ? action.payload.request.data.leaf.material
        : 'None',
      type: action.payload.request.data.leaf.type
        ? action.payload.request.data.leaf.type
        : 'None',
      folio_number: null,
      conjoined_to: null,
      attached_above: 'None',
      attached_below: 'None',
      stub: action.payload.request.data.leaf.stub
        ? action.payload.request.data.leaf.stub
        : 'None',
      nestLevel: parentGroup.nestLevel,
      parentID: parentGroupID,
      rectoID: 'Recto_' + sideIDs[sideCount],
      versoID: 'Verso_' + sideIDs[sideCount + 1],
      notes: [],
      memberType: 'Leaf',
    };
    newlyAddedLeafIDs.push('Leaf_' + leafIDs[count]);
    // Create new Recto with given rectoID
    state.project.Rectos['Recto_' + sideIDs[sideCount]] = {
      id: 'Recto_' + sideIDs[sideCount],
      parentID: 'Leaf_' + leafIDs[count],
      page_number: null,
      texture: 'Hair',
      image: {},
      script_direction: 'None',
      notes: [],
      memberType: 'Recto',
    };
    state.project.rectoIDs.push('Recto_' + sideIDs[sideCount]);
    // Create new Verso with given rectoID
    state.project.Versos['Verso_' + sideIDs[sideCount + 1]] = {
      id: 'Verso_' + sideIDs[sideCount + 1],
      parentID: 'Leaf_' + leafIDs[count],
      page_number: null,
      texture: 'Flesh',
      image: {},
      script_direction: 'None',
      notes: [],
      memberType: 'Verso',
    };
    state.project.versoIDs.push('Verso_' + sideIDs[sideCount + 1]);
    sideCount += 2;
  }
  if (!fromGroupCreation) {
    // Add newlyAddedLeafIDs to the parentGroup's memberIDs list
    state.project.Groups[parentGroupID].memberIDs.splice(
      memberOrder - 1,
      0,
      ...newlyAddedLeafIDs
    );
    // Add newlyAddedLeafIDs to the active project's leafIDs list
    if (globalOrder)
      state.project.leafIDs.splice(globalOrder - 1, 0, ...newlyAddedLeafIDs);
    else {
      // Populate leafIDs recursively and replace the active project's leafIDs list
      let updatedLeafIDs = [];
      for (let groupID of state.project.groupIDs) {
        const group = state.project.Groups[groupID];
        if (group.nestLevel === 1)
          getLeafMembers(group.memberIDs, state, updatedLeafIDs);
      }
      state.project.leafIDs = updatedLeafIDs;
    }
    // AutoConjoin newlyAddedLeaves if necessary
  }
  if (autoConjoin)
    autoConjoinLeafs(action, state, newlyAddedLeafIDs, oddMemberLeftOut);
  // Generate the list of new Leaves to flash
  state.collationManager.flashItems.leaves = [...newlyAddedLeafIDs];
  return state;
}

export function updateLeaf(action, state) {
  const updatedLeafID = action.payload.request.url.split('/').pop();
  const updatedLeaf = action.payload.request.data.leaf;
  // Do side effects if necessary
  if (action.payload.request.data.leaf.hasOwnProperty('conjoined_to')) {
    state = handleConjoin(
      state,
      updatedLeafID,
      action.payload.request.data.leaf.conjoined_to
    );
  } else if (
    action.payload.request.data.leaf.hasOwnProperty('attached_above')
  ) {
    state = handleAttachAbove(
      state,
      updatedLeafID,
      action.payload.request.data.leaf.attached_above
    );
  } else if (
    action.payload.request.data.leaf.hasOwnProperty('attached_below')
  ) {
    state = handleAttachBelow(
      state,
      updatedLeafID,
      action.payload.request.data.leaf.attached_below
    );
  } else if (
    action.payload.request.data.leaf.hasOwnProperty('material') &&
    action.payload.request.data.leaf.material === 'Paper'
  ) {
    state = handlePaperUpdate(state, updatedLeafID);
  }
  // Update the leaf with id updatedLeafID
  state.project.Leafs[updatedLeafID] = {
    ...state.project.Leafs[updatedLeafID],
    ...updatedLeaf,
  };
  return state;
}

function handleConjoin(state, leafID, conjoinedToID) {
  const leaf = state.project.Leafs[leafID];
  if (leaf.conjoined_to) {
    state.project.Leafs[leaf.conjoined_to].conjoined_to = null;
  }
  if (conjoinedToID) {
    const conjoinedToLeaf = state.project.Leafs[conjoinedToID];
    if (conjoinedToLeaf.conjoined_to) {
      state.project.Leafs[conjoinedToLeaf.conjoined_to].conjoined_to = null;
    }
    state.project.Leafs[conjoinedToID].conjoined_to = leafID;
  }
  return state;
}

function handleAttachAbove(state, leafID, attachType) {
  const aboveLeafID =
    state.project.leafIDs[state.project.leafIDs.indexOf(leafID) - 1];
  state.project.Leafs[aboveLeafID].attached_below = attachType;
  return state;
}

function handleAttachBelow(state, leafID, attachType) {
  const belowLeafID =
    state.project.leafIDs[state.project.leafIDs.indexOf(leafID) + 1];
  state.project.Leafs[belowLeafID].attached_above = attachType;
  return state;
}

function handlePaperUpdate(state, leafID) {
  const leaf = state.project.Leafs[leafID];
  state.project.Rectos[leaf.rectoID].texture = 'None';
  state.project.Versos[leaf.versoID].texture = 'None';
  return state;
}

export function updateLeaves(action, state) {
  const updatedLeaves = action.payload.request.data.leafs;
  for (let updatedLeaf of updatedLeaves) {
    // Update the leaf of id updatedLeaf.id with attributes updatedLeaf.attributes
    state.project.Leafs[updatedLeaf.id] = {
      ...state.project.Leafs[updatedLeaf.id],
      ...updatedLeaf.attributes,
    };
    if (
      updatedLeaf.attributes.hasOwnProperty('material') &&
      updatedLeaf.attributes.material === 'Paper'
    ) {
      state = handlePaperUpdate(state, updatedLeaf.id);
    }
  }
  return state;
}

export function deleteLeaf(deletedLeafID, state) {
  const deletedLeaf = state.project.Leafs[deletedLeafID];
  const deletedLeafParent = state.project.Groups[deletedLeaf.parentID];
  const deletedLeafMemberIndex = deletedLeafParent.memberIDs.indexOf(
    deletedLeafID
  );
  // Detach deletedLeaf's conjoined leaf if exists
  if (deletedLeaf.conjoined_to !== null)
    state.project.Leafs[deletedLeaf.conjoined_to].conjoined_to = null;
  // Detach deletedLeaf's attached_above leaf if exists
  if (deletedLeaf.attached_above !== 'None') {
    const attachedAboveLeafID =
      deletedLeafParent.memberIDs[deletedLeafMemberIndex - 1];
    if (attachedAboveLeafID) {
      // deletedLeaf could be the first leaf in Group
      state.project.Leafs[attachedAboveLeafID].attached_below = 'None';
    }
  }
  // Detach deletedLeaf's attached_below leaf if exists
  if (deletedLeaf.attached_below !== 'None') {
    const attachedBelowLeafID =
      deletedLeafParent.memberIDs[deletedLeafMemberIndex + 1];
    if (attachedBelowLeafID)
      // deletedLeaf could be the last leaf in Group
      state.project.Leafs[attachedBelowLeafID].attached_above = 'None';
  }
  // Remove deletedLeafID from leafIDs list
  let deletedLeafIDIndex = state.project.leafIDs.indexOf(deletedLeafID);
  state.project.leafIDs.splice(deletedLeafIDIndex, 1);
  // Remove deletedLeafID from deletedLeafParent's memberIDs list
  deletedLeafIDIndex = deletedLeafParent.memberIDs.indexOf(deletedLeafID);
  state.project.Groups[deletedLeaf.parentID].memberIDs.splice(
    deletedLeafIDIndex,
    1
  );
  // Update deletedLeafParent's tacketed if deletedLeafID is present
  deletedLeafIDIndex = deletedLeafParent.tacketed.indexOf(deletedLeafID);
  if (deletedLeafIDIndex !== -1)
    state.project.Groups[deletedLeaf.parentID].tacketed.splice(
      deletedLeafIDIndex,
      1
    );
  // Update deletedLeafParent's sewing if deletedLeafID is present
  deletedLeafIDIndex = deletedLeafParent.sewing.indexOf(deletedLeafID);
  if (deletedLeafIDIndex !== -1)
    state.project.Groups[deletedLeaf.parentID].sewing.splice(
      deletedLeafIDIndex,
      1
    );
  // Unlink all Notes of deletedLeafID. Also unlink Notes in Recto and Verso of deletedLeafID
  for (let noteID in state.project.Notes) {
    deletedLeafIDIndex = state.project.Notes[noteID].objects.Leaf.indexOf(
      deletedLeafID
    );
    let rectoIDIndex = state.project.Notes[noteID].objects.Recto.indexOf(
      deletedLeaf.rectoID
    );
    let versoIDIndex = state.project.Notes[noteID].objects.Verso.indexOf(
      deletedLeaf.versoID
    );
    if (deletedLeafIDIndex !== -1)
      state.project.Notes[noteID].objects.Leaf.splice(deletedLeafIDIndex, 1);
    if (rectoIDIndex !== -1)
      state.project.Notes[noteID].objects.Recto.splice(rectoIDIndex, 1);
    if (versoIDIndex !== -1)
      state.project.Notes[noteID].objects.Verso.splice(versoIDIndex, 1);
  }
  // Remove deletedLeaf's Recto and Verso IDs from Rectos, rectoIDs, Versos, versoIDs
  delete state.project.Rectos[deletedLeaf.rectoID];
  delete state.project.Versos[deletedLeaf.versoID];
  const rectoIDIndex = state.project.rectoIDs.indexOf(deletedLeaf.rectoID);
  state.project.rectoIDs.splice(rectoIDIndex, 1);
  const versoIDIndex = state.project.versoIDs.indexOf(deletedLeaf.versoID);
  state.project.versoIDs.splice(versoIDIndex, 1);
  // Reset selectedObjects to empty list
  state.collationManager.selectedObjects = {
    type: '',
    members: [],
    lastSelected: '',
  };
  // Remove the deletedLeafID from Leafs
  delete state.project.Leafs[deletedLeafID];
  return state;
}

export function deleteLeaves(deletedLeafIDs, state) {
  for (let deletedLeafID of deletedLeafIDs) {
    deleteLeaf(deletedLeafID, state);
  }
  return state;
}

export function generatePageNumbers(action, state) {
  let numberCount = action.payload.request.data.startNumber;
  let rectoIDs = action.payload.request.data.rectoIDs;
  let versoIDs = action.payload.request.data.versoIDs;
  for (const index in rectoIDs) {
    const recto = state.project.Rectos[rectoIDs[index]];
    const verso = state.project.Versos[versoIDs[index]];
    recto['page_number'] = numberCount;
    numberCount++;
    verso['page_number'] = numberCount;
    numberCount++;
  }
  return state;
}

export function generateFolioNumbers(action, state) {
  let numberCount = action.payload.request.data.startNumber;
  let leafIDs = action.payload.request.data.leafIDs;
  for (const index in leafIDs) {
    const leaf = state.project.Leafs[leafIDs[index]];
    leaf['folio_number'] = `${numberCount}`;
    numberCount++;
  }
  return state;
}
