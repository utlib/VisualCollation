import {
  deleteNoteType,
  updateNoteType,
  createNoteType,
  updateTerm,
  unlinkTerm,
  linkTerm,
  addTerm,
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
  // Update terms that had this note type
  for (const key in state.project.Terms) {
    if (!state.project.Terms.hasOwnProperty(key)) continue;
    if (state.project.Terms[key].type === type) {
      historyActions.push(updateTerm(key, {type}));
    }
  }
  return historyActions;
}

export function undoLinkTerm(action, state) {
  const urlSplit = action.payload.request.url.split("/");
  const termID = urlSplit[urlSplit.length-2];
  const historyAction = unlinkTerm(termID, action.payload.request.data.objects);
  return [historyAction];
}

export function undoUnlinkTerm(action, state) {
  const urlSplit = action.payload.request.url.split("/");
  const termID = urlSplit[urlSplit.length-2];
  const historyAction = linkTerm(termID, action.payload.request.data.objects);
  return [historyAction];
}

export function undoDeleteTerm(action, state) {
  const historyActions = [];
  const termID = action.payload.request.url.split("/").pop();
  const term = state.project.Terms[termID];

  // Create term
  const termData = {
    project_id: state.project.id,
    id: termID,
    title: term.title,
    type: term.type,
    description: term.description,
    show: term.show,
  }
  historyActions.push(addTerm(termData));

  // Relink leaves, groups, sides
  const objects = [];
  for (const id of term.objects.Group) {
    objects.push({id, type:"Group"});
  }
  for (const id of term.objects.Leaf) {
    objects.push({id, type:"Leaf"});
  }
  for (const id of term.objects.Recto) {
    objects.push({id, type:"Recto"});
  }
  for (const id of term.objects.Verso) {
    objects.push({id, type:"Verso"});
  }
  historyActions.push(linkTerm(termID, objects));

  return historyActions;
}