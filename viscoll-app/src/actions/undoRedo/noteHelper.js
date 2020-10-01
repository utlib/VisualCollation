import {
  deleteNoteType,
  updateNoteType,
  createNoteType,
  updateNote,
  unlinkNote,
  linkNote,
  addNote,
} from '../backend/termActions';

export function undoUpdateNoteType(action, state) {
  const noteType = {
    project_id: state.project.id,
    old_type: action.payload.request.data.noteType.type,
    type: action.payload.request.data.noteType.old_type,
  }
  const historyAction = updateNoteType(noteType);
  return [historyAction];
}

export function undoCreateNoteType(action, state) {
  const noteType = {
    project_id: state.project.id,
    type: action.payload.request.data.noteType.type,
  }
  const historyAction = deleteNoteType(noteType);
  return [historyAction];
}

export function undoDeleteNoteType(action, state) {
  const historyActions = [];
  // Create note type
  const type = action.payload.request.data.noteType.type;
  const noteType = {
    project_id: state.project.id,
    type,
  }
  historyActions.push(createNoteType(noteType));
  // Update notes that had this note type
  for (const key in state.project.Notes) {
    if (!state.project.Notes.hasOwnProperty(key)) continue;
    if (state.project.Notes[key].type === type) {
      historyActions.push(updateNote(key, {type}));
    }
  }
  return historyActions;
}

export function undoLinkNote(action, state) {
  const urlSplit = action.payload.request.url.split("/");
  const noteID = urlSplit[urlSplit.length-2];
  const historyAction = unlinkNote(noteID, action.payload.request.data.objects);
  return [historyAction];
}

export function undoUnlinkNote(action, state) {
  const urlSplit = action.payload.request.url.split("/");
  const noteID = urlSplit[urlSplit.length-2];
  const historyAction = linkNote(noteID, action.payload.request.data.objects);
  return [historyAction];
}

export function undoDeleteNote(action, state) {
  const historyActions = [];
  const noteID = action.payload.request.url.split("/").pop();
  const note = state.project.Notes[noteID];

  // Create note
  const noteData = {
    project_id: state.project.id,
    id: noteID,
    title: note.title,
    type: note.type,
    description: note.description,
    show: note.show,
  }
  historyActions.push(addNote(noteData));

  // Relink leaves, groups, sides
  const objects = [];
  for (const id of note.objects.Group) {
    objects.push({id, type:"Group"});
  }
  for (const id of note.objects.Leaf) {
    objects.push({id, type:"Leaf"});
  }
  for (const id of note.objects.Recto) {
    objects.push({id, type:"Recto"});
  }
  for (const id of note.objects.Verso) {
    objects.push({id, type:"Verso"});
  }
  historyActions.push(linkNote(noteID, objects));

  return historyActions;
}