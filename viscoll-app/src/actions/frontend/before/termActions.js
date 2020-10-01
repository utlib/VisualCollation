export function createNoteType(action, state) {
  const newNoteType = action.payload.request.data.noteType.type;
  state.project.noteTypes.push(newNoteType);
  return state;
}

export function updateNoteType(action, state) {
  const updatedNoteType = action.payload.request.data.noteType.type;
  const oldNoteType = action.payload.request.data.noteType.old_type;
  // Rename the noteType of each Note that had oldNoteType
  for (let termID in state.project.Terms) {
    if (state.project.Terms[termID].type === oldNoteType)
      state.project.Terms[termID].type = updatedNoteType;
  }
  // Rename the noteType in the noteTypes array
  const oldNoteTypeIndex = state.project.noteTypes.indexOf(oldNoteType);
  state.project.noteTypes[oldNoteTypeIndex] = updatedNoteType;
  return state;
}

export function deleteNoteType(action, state) {
  const deletedNoteType = action.payload.request.data.noteType.type;
  // Rename the noteType of each Note that had deleteNoteType to Unknown
  for (let termID in state.project.Terms) {
    if (state.project.Notes[termID].type === deletedNoteType)
      state.project.Terms[termID].type = 'Unknown';
  }
  // Delete the noteType from the noteTypes array
  const deletedNoteTypeIndex = state.project.noteTypes.indexOf(deletedNoteType);
  state.project.noteTypes.splice(deletedNoteTypeIndex, 1);
  return state;
}

export function createTerm(action, state) {
  const newTerm = action.payload.request.data.term;
  // Add new term to Terms
  state.project.Terms[newTerm.id] = {
    id: newTerm.id,
    title: newTerm.title,
    type: newTerm.type,
    description: newTerm.description,
    uri: newTerm.uri,
    show: newTerm.show,
    objects: { Group: [], Leaf: [], Recto: [], Verso: [] },
  };
  return state;
}

export function updateTerm(action, state) {
  const updatedTermID = action.payload.request.url.split('/').pop();
  const updatedTerm = action.payload.request.data.term;
  // Update the term with id updatedTermID
  state.project.Terms[updatedTermID] = {
    ...state.project.Terms[updatedTermID],
    ...updatedTerm,
  };
  return state;
}

export function linkTerm(action, state) {
  const linkedTermID = action.payload.request.url.split('/').slice(-2)[0];
  const linkedObjects = action.payload.request.data.objects;
  // Update each object with linkedTermID
  for (let object of linkedObjects) {
    if (object.type === 'Side')
      object.type = object.id.charAt(0) === 'R' ? 'Recto' : 'Verso';
    state.project[`${object.type}s`][object.id].terms.push(linkedTermID);
    // Update the objects property of term with linkedTermID
    state.project.Terms[linkedTermID].objects[object.type].push(object.id);
  }
  return state;
}

export function unlinkTerm(action, state) {
  const unlinkedTermID = action.payload.request.url.split('/').slice(-2)[0];
  const unlinkedObjects = action.payload.request.data.objects;
  // Update each object by removing unlinkedTermID
  for (let object of unlinkedObjects) {
    if (object.type === 'Side')
      object.type = object.id.charAt(0) === 'R' ? 'Recto' : 'Verso';
    const unlinkedTermIDIndex = state.project[`${object.type}s`][
      object.id
    ].terms.indexOf(unlinkedTermID);
    state.project[`${object.type}s`][object.id].terms.splice(
      unlinkedTermIDIndex,
      1
    );
    // Update the objects property of term with unlinkedTermID
    const unlinkedObjectIDIndex = state.project.Terms[unlinkedTermID].objects[
      object.type
    ].indexOf(object.id);
    state.project.Terms[unlinkedTermID].objects[object.type].splice(
      unlinkedObjectIDIndex,
      1
    );
  }
  return state;
}

export function deleteTerm(action, state) {
  const deletedTermID = action.payload.request.url.split('/').pop();
  // Delete the reference on all Groups,Leaves,Sides that this deletedTerm had
  for (let groupID of state.project.Terms[deletedTermID].objects.Group) {
    const deletedTermIDIndex = state.project.Groups[groupID].terms.indexOf(
      deletedTermID
    );
    state.project.Groups[groupID].terms.splice(deletedTermIDIndex, 1);
  }
  for (let leafID of state.project.Terms[deletedTermID].objects.Leaf) {
    const deletedTermIDIndex = state.project.Leafs[leafID].terms.indexOf(
      deletedTermID
    );
    state.project.Leafs[leafID].terms.splice(deletedTermIDIndex, 1);
  }
  for (let rectoID of state.project.Terms[deletedTermID].objects.Recto) {
    const deletedTermIDIndex = state.project.Rectos[rectoID].terms.indexOf(
      deletedTermID
    );
    state.project.Rectos[rectoID].terms.splice(deletedTermIDIndex, 1);
  }
  for (let versoID of state.project.Terms[deletedTermID].objects.Verso) {
    const deletedTermIDIndex = state.project.Versos[versoID].terms.indexOf(
      deletedTermID
    );
    state.project.Versos[versoID].terms.splice(deletedTermIDIndex, 1);
  }
  // Delete the term with id deletedTermID in Terms
  delete state.project.Terms[deletedTermID];
  return state;
}
