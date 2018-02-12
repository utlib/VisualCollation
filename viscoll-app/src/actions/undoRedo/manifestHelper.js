import {
  createManifest,
  updateManifest,
} from '../backend/manifestActions';

import {
  updateSides,
} from '../backend/sideActions';

export function undoUpdateManifest(action, state) {
  const manifest = {
    id: action.payload.request.data.manifest.id,
    name: state.project.manifests[action.payload.request.data.manifest.id].name,
  }
  const historyAction = updateManifest(state.project.id, {manifest});
  return [historyAction];
}

export function undoDeleteManifest(action, state) {
  const historyActions = [];
  const manifestID = action.payload.request.data.manifest.id;
  // Create manifest
  const manifest = {
    id: manifestID,
    url: state.project.manifests[manifestID].url,
  }
  const createAction = createManifest(state.project.id, {manifest});
  historyActions.push(createAction);

  // Relink sides linked to images in this manifest 
  const sides = [];
  for (const rectoID of state.project.rectoIDs) {
    const recto = state.project.Rectos[rectoID];
    if (recto.image.manifestID && recto.image.manifestID === manifestID) {
      const item = {
        id: recto.id,
        attributes: {
          image: {...recto.image},
        }
      }
      sides.push(item);
    }
  }
  for (const versoID of state.project.versoIDs) {
    const verso = state.project.Versos[versoID];
    if (verso.image.manifestID && verso.image.manifestID === manifestID) {
      const item = {
        id: verso.id,
        attributes: {
          image: {...verso.image},
        }
      };
      sides.push(item);
    }
  }
  if (sides.length>0) {
    const mapAction = updateSides(sides);
    historyActions.push(mapAction);
  }
  return historyActions;
}