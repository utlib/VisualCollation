import {
  deleteTaxonomy,
  updateTaxonomy,
  createTaxonomy,
  updateTerm,
  unlinkTerm,
  linkTerm,
  addTerm,
} from '../backend/termActions';

export function undoUpdateTaxonomy(action, state) {
  const taxonomy = {
    project_id: state.project.id,
    old_taxonomy: action.payload.request.data.taxonomy.taxonomy,
    taxonomy: action.payload.request.data.taxonomy.old_taxonomy,
  }
  const historyAction = updateTaxonomy(taxonomy);
  return [historyAction];
}

export function undoCreateTaxonomy(action, state) {
  const taxonomy = {
    project_id: state.project.id,
    taxonomy: action.payload.request.data.taxonomy.taxonomy,
  }
  const historyAction = deleteTaxonomy(taxonomy);
  return [historyAction];
}

export function undoDeleteTaxonomy(action, state) {
  const historyActions = [];
  // Create term taxonomy
  const tax = action.payload.request.data.taxonomy.taxonomy;
  const taxonomy = {
    project_id: state.project.id,
    tax,
  }
  historyActions.push(createTaxonomy(taxonomy));
  // Update terms that had this taxonomy
  for (const key in state.project.Terms) {
    if (!state.project.Terms.hasOwnProperty(key)) continue;
    if (state.project.Terms[key].taxonomy === tax) {
      historyActions.push(updateTerm(key, {tax}));
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
    taxonomy: term.taxonomy,
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