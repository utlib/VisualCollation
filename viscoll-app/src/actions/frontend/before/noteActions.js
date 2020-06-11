export function createNoteType(action, state) {
  const newNoteType = action.payload.request.data.noteType.type;
  state.project.noteTypes.push(newNoteType);
  return state;
}

export function updateNoteType(action, state) {
  const updatedNoteType = action.payload.request.data.noteType.type;
  const oldNoteType = action.payload.request.data.noteType.old_type;
  // Rename the noteType of each Note that had oldNoteType
  for (let noteID in state.project.Notes) {
    if (state.project.Notes[noteID].type === oldNoteType)
      state.project.Notes[noteID].type = updatedNoteType;
  }
  // Rename the noteType in the noteTypes array
  const oldNoteTypeIndex = state.project.noteTypes.indexOf(oldNoteType);
  state.project.noteTypes[oldNoteTypeIndex] = updatedNoteType;
  return state;
}

export function deleteNoteType(action, state) {
  const deletedNoteType = action.payload.request.data.noteType.type;
  // Rename the noteType of each Note that had deleteNoteType to Unknown
  for (let noteID in state.project.Notes) {
    if (state.project.Notes[noteID].type === deletedNoteType)
      state.project.Notes[noteID].type = 'Unknown';
  }
  // Delete the noteType from the noteTypes array
  const deletedNoteTypeIndex = state.project.noteTypes.indexOf(deletedNoteType);
  state.project.noteTypes.splice(deletedNoteTypeIndex, 1);
  return state;
}

export function createNote(action, state) {
  const newNote = action.payload.request.data.note;
  // Add new note to Notes
  state.project.Notes[newNote.id] = {
    id: newNote.id,
    title: newNote.title,
    type: newNote.type,
    description: newNote.description,
    //URI: newNote.URI,
    show: newNote.show,
    objects: { Group: [], Leaf: [], Recto: [], Verso: [] },
  };
  return state;
}

export function updateNote(action, state) {
  const updatedNoteID = action.payload.request.url.split('/').pop();
  const updatedNote = action.payload.request.data.note;
  // Update the note with id updatedNoteID
  state.project.Notes[updatedNoteID] = {
    ...state.project.Notes[updatedNoteID],
    ...updatedNote,
  };
  return state;
}

export function linkNote(action, state) {
  const linkedNoteID = action.payload.request.url.split('/').slice(-2)[0];
  const linkedObjects = action.payload.request.data.objects;
  // Update each object with linkedNoteID
  for (let object of linkedObjects) {
    if (object.type === 'Side')
      object.type = object.id.charAt(0) === 'R' ? 'Recto' : 'Verso';
    state.project[`${object.type}s`][object.id].notes.push(linkedNoteID);
    // Update the objects property of note with linkedNoteID
    state.project.Notes[linkedNoteID].objects[object.type].push(object.id);
  }
  return state;
}

export function unlinkNote(action, state) {
  const unlinkedNoteID = action.payload.request.url.split('/').slice(-2)[0];
  const unlinkedObjects = action.payload.request.data.objects;
  // Update each object by removing unlinkedNoteID
  for (let object of unlinkedObjects) {
    if (object.type === 'Side')
      object.type = object.id.charAt(0) === 'R' ? 'Recto' : 'Verso';
    const unlinkedNoteIDIndex = state.project[`${object.type}s`][
      object.id
    ].notes.indexOf(unlinkedNoteID);
    state.project[`${object.type}s`][object.id].notes.splice(
      unlinkedNoteIDIndex,
      1
    );
    // Update the objects property of note with unlinkedNoteID
    const unlinkedObjectIDIndex = state.project.Notes[unlinkedNoteID].objects[
      object.type
    ].indexOf(object.id);
    state.project.Notes[unlinkedNoteID].objects[object.type].splice(
      unlinkedObjectIDIndex,
      1
    );
  }
  return state;
}

export function deleteNote(action, state) {
  const deletedNoteID = action.payload.request.url.split('/').pop();
  // Delete the reference on all Groups,Leaves,Sides that this deletedNote had
  for (let groupID of state.project.Notes[deletedNoteID].objects.Group) {
    const deletedNoteIDIndex = state.project.Groups[groupID].notes.indexOf(
      deletedNoteID
    );
    state.project.Groups[groupID].notes.splice(deletedNoteIDIndex, 1);
  }
  for (let leafID of state.project.Notes[deletedNoteID].objects.Leaf) {
    const deletedNoteIDIndex = state.project.Leafs[leafID].notes.indexOf(
      deletedNoteID
    );
    state.project.Leafs[leafID].notes.splice(deletedNoteIDIndex, 1);
  }
  for (let rectoID of state.project.Notes[deletedNoteID].objects.Recto) {
    const deletedNoteIDIndex = state.project.Rectos[rectoID].notes.indexOf(
      deletedNoteID
    );
    state.project.Rectos[rectoID].notes.splice(deletedNoteIDIndex, 1);
  }
  for (let versoID of state.project.Notes[deletedNoteID].objects.Verso) {
    const deletedNoteIDIndex = state.project.Versos[versoID].notes.indexOf(
      deletedNoteID
    );
    state.project.Versos[versoID].notes.splice(deletedNoteIDIndex, 1);
  }
  // Delete the note with id deletedNoteID in Notes
  delete state.project.Notes[deletedNoteID];
  return state;
}
