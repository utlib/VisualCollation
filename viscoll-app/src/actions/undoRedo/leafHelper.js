import {
  updateLeaf,
  updateLeafs,
  addLeafs,
  deleteLeafs,
} from '../backend/leafActions';
import { updateSides } from '../backend/sideActions';
import { linkNote } from '../backend/noteActions';
import { updateGroups } from '../backend/groupActions';

export function undoCreateLeaves(action, state) {
  const leafIDs = action.payload.request.data.additional.leafIDs.map(id => {
    return 'Leaf_' + id;
  });
  const deleteRequest = deleteLeafs({ leafs: leafIDs });
  return [deleteRequest];
}

export function undoUpdateLeaf(action, state) {
  const historyActions = [];
  const leafID = action.payload.request.url.split('/').pop();
  const attribute = Object.keys(action.payload.request.data.leaf)[0];

  const leaf = {
    [attribute]: state.project.Leafs[leafID][attribute],
  };
  historyActions.push(updateLeaf(leafID, leaf));
  if (
    attribute === 'material' &&
    (action.payload.request.data.leaf.material === 'Paper' ||
      action.payload.request.data.leaf.material === 'Parchment')
  ) {
    historyActions.push(
      updateSides([
        {
          id: state.project.Leafs[leafID].rectoID,
          attributes: {
            texture:
              state.project.Rectos[state.project.Leafs[leafID].rectoID].texture,
          },
        },
        {
          id: state.project.Leafs[leafID].versoID,
          attributes: {
            texture:
              state.project.Versos[state.project.Leafs[leafID].versoID].texture,
          },
        },
      ])
    );
  }
  return historyActions;
}

export function undoUpdateLeaves(action, state) {
  const requestData = action.payload.request.data.leafs;
  const leafs = [];
  const historyActions = [];

  for (const request of requestData) {
    const leaf = state.project.Leafs[request.id];
    const item = {
      id: request.id,
      attributes: {},
    };
    for (const attribute in request.attributes) {
      if (!request.attributes.hasOwnProperty(attribute)) continue;
      item.attributes[attribute] = leaf[attribute];
      if (
        attribute === 'material' &&
        (request.attributes[attribute] === 'Paper' ||
          request.attributes[attribute] === 'Parchment')
      ) {
        historyActions.push(
          updateSides([
            {
              id: state.project.Leafs[leaf.id].rectoID,
              attributes: {
                texture:
                  state.project.Rectos[state.project.Leafs[leaf.id].rectoID]
                    .texture,
              },
            },
            {
              id: state.project.Leafs[leaf.id].versoID,
              attributes: {
                texture:
                  state.project.Versos[state.project.Leafs[leaf.id].versoID]
                    .texture,
              },
            },
          ])
        );
      }
    }
    leafs.push(item);
  }
  historyActions.push(updateLeafs(leafs, state.project.id));
  return historyActions;
}

export function undoDeleteLeaves(action, state) {
  const historyActions = helperUndoDeleteLeaves(
    action.payload.request.data.leafs,
    state
  );
  return historyActions;
}

export function undoDeleteLeaf(action, state) {
  const leafID = action.payload.request.url.split('/').pop();
  const historyActions = helperUndoDeleteLeaves([leafID], state);
  return historyActions;
}

/**
 * Params
 *   leafIDs    list of leaf IDs that may not belong to the same parent nor are sequential
 *   state      active tree state
 * Returns [ [leafID, leafID,..], ... ]
 */
function helperSeparateLeavesByGroup(leafIDs, state) {
  const leafNeighbours = [[leafIDs[0]]];
  for (let i = 1; i < leafIDs.length; i++) {
    const leafID = leafIDs[i];
    const latestGroup = leafNeighbours[leafNeighbours.length - 1];
    const latestLeafID = latestGroup[latestGroup.length - 1];
    if (
      state.project.Leafs[latestLeafID].parentID ===
        state.project.Leafs[leafID].parentID &&
      state.project.leafIDs.indexOf(leafID) -
        state.project.leafIDs.indexOf(latestLeafID) ===
        1
    ) {
      // Neighbour of last leaf, so add to same group
      latestGroup.push(leafID);
    } else {
      // Make a new group
      leafNeighbours.push([leafID]);
    }
  }
  return leafNeighbours;
}

export function helperUndoDeleteLeaves(leafIDs, state) {
  const historyActions = [];
  // Make create requests
  // There'll be multiple create requests if not all leaves are under the same parent or are sequential
  const groupedLeaves = helperSeparateLeavesByGroup(leafIDs, state);

  for (const leafIDs of groupedLeaves) {
    const parentID = state.project.Leafs[leafIDs[0]].parentID;
    const sideIDs = leafIDs
      .map(leafID => [
        state.project.Leafs[leafID].rectoID.split('_')[1],
        state.project.Leafs[leafID].versoID.split('_')[1],
      ])
      .reduce((a, b) => a.concat(b));

    const leaf = {
      project_id: state.project.id,
      parentID: parentID,
      nestLevel: state.project.Groups[parentID].nestLevel,
    };
    const additional = {
      conjoin: false,
      leafIDs: leafIDs.map(id => id.split('_')[1]),
      memberOrder:
        state.project.Groups[parentID].memberIDs.indexOf(leafIDs[0]) + 1,
      noOfLeafs: leafIDs.length,
      order: state.project.leafIDs.indexOf(leafIDs[0]) + 1,
      sideIDs: sideIDs,
    };
    const createRequest = addLeafs(leaf, additional);
    historyActions.push(createRequest);
  }

  // Update leaves attributes
  const leafs = [];
  for (const leafID of leafIDs) {
    const leaf = state.project.Leafs[leafID];
    let attributes = {};
    attributes['folio_number'] = leaf.folio_number;
    attributes['type'] = leaf.type;
    attributes['material'] = leaf.material;
    attributes['stub'] = leaf.stub;
    if (leaf.conjoined_to) {
      attributes['conjoined_to'] = leaf.conjoined_to;
      // Update the conjoin partner leaf too
      leafs.push({
        id: leaf.conjoined_to,
        attributes: { conjoined_to: leafID },
      });
    }
    if (leaf.attached_above !== 'None') {
      attributes['attached_above'] = leaf.attached_above;
      // Update the above leaf too
      const leafAboveID =
        state.project.leafIDs[state.project.leafIDs.indexOf(leafID) - 1];
      if (!leafIDs.includes(leafAboveID))
        leafs.push({
          id: leafAboveID,
          attributes: { attached_below: leaf.attached_above },
        });
    }
    if (leaf.attached_below !== 'None') {
      attributes['attached_below'] = leaf.attached_below;
      // Update the below leaf too
      const leafBelowID =
        state.project.leafIDs[state.project.leafIDs.indexOf(leafID) + 1];
      if (!leafIDs.includes(leafBelowID))
        leafs.push({
          id: leafBelowID,
          attributes: { attached_above: leaf.attached_below },
        });
    }
    leafs.push({
      id: leafID,
      attributes,
    });
  }
  const updateLeafsRequest = updateLeafs(leafs, state.project.id);
  historyActions.push(updateLeafsRequest);

  // Update side attributes
  const sides = [];
  for (const leafID of leafIDs) {
    const leaf = state.project.Leafs[leafID];
    const recto = state.project.Rectos[leaf.rectoID];
    const verso = state.project.Versos[leaf.versoID];
    sides.push({
      id: recto.id,
      attributes: {
        texture: recto.texture,
        folio_number: recto.folio_number ? recto.folio_number : '',
        script_direction: recto.script_direction,
      },
    });
    sides.push({
      id: verso.id,
      attributes: {
        texture: verso.texture,
        folio_number: verso.folio_number ? verso.folio_number : '',
        script_direction: verso.script_direction,
      },
    });
  }
  const sideRequest = updateSides(sides);
  historyActions.push(sideRequest);

  // Link notes
  for (const leafID of leafIDs) {
    const leaf = state.project.Leafs[leafID];
    const recto = state.project.Rectos[leaf.rectoID];
    const verso = state.project.Versos[leaf.versoID];

    if (leaf.notes.length > 0) {
      const objects = [{ id: leafID, type: 'Leaf' }];
      for (const noteID of leaf.notes) {
        const noteRequest = linkNote(noteID, objects);
        historyActions.push(noteRequest);
      }
    }
    if (recto.notes.length > 0) {
      const objects = [{ id: recto.id, type: 'Side' }];
      for (const noteID of recto.notes) {
        const noteRequest = linkNote(noteID, objects);
        historyActions.push(noteRequest);
      }
    }
    if (verso.notes.length > 0) {
      const objects = [{ id: verso.id, type: 'Side' }];
      for (const noteID of verso.notes) {
        const noteRequest = linkNote(noteID, objects);
        historyActions.push(noteRequest);
      }
    }
  }
  // Update parent group if leaves were part of sewing/tacket
  const groupsRequest = [];
  for (const leafID of leafIDs) {
    const leaf = state.project.Leafs[leafID];
    const group = state.project.Groups[leaf.parentID];
    if (
      group.sewing.length > 0 &&
      (group.sewing[0] === leafID ||
        (group.sewing[1] && group.sewing[1] === leafID))
    ) {
      groupsRequest.push({
        id: group.id,
        attributes: {
          sewing: group.sewing,
        },
      });
    }
    if (
      group.tacketed.length > 0 &&
      (group.tacketed[0] === leafID ||
        (group.tacketed[1] && group.tacketed[1] === leafID))
    ) {
      groupsRequest.push({
        id: group.id,
        attributes: {
          tacketed: group.tacketed,
        },
      });
    }
  }
  if (groupsRequest.length > 0)
    historyActions.push(updateGroups(groupsRequest));
  return historyActions;
}

export function undoAutoconjoin(action, state) {
  const leafIDs = action.payload.request.data.leafs;
  const leafs = [];
  for (const leafID of leafIDs) {
    leafs.push({
      id: leafID,
      attributes: { conjoined_to: state.project.Leafs[leafID].conjoined_to },
    });
  }
  const historyAction = updateLeafs(leafs, state.project.id);
  return [historyAction];
}

export function undoFolioNumbers(action, state) {
  const leafIDs = action.payload.request.data.leafIDs;
  const leaves = [];
  for (const leafID of leafIDs) {
    const item = {
      id: leafID,
      attributes: {
        folio_number: state.project['Leafs'][leafID]['folio_number'],
      },
    };
    leaves.push(item);
  }
  const historyActions = updateLeafs(leaves);
  return [historyActions];
}

export function undoPageNumbers(action, state) {
  const sideIDs = action.payload.request.data.rectoIDs.concat(
    action.payload.request.data.versoIDs
  );
  const sides = [];
  for (const sideID of sideIDs) {
    const sideType = sideID.split('_')[0] + 's';
    const item = {
      id: sideID,
      attributes: {
        page_number: state.project[sideType][sideID]['page_number'],
      },
    };
    sides.push(item);
  }
  const historyActions = updateSides(sides);
  return [historyActions];
}
