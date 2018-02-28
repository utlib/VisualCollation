export function updateManifest(action, state) {
  const updatedManifest = action.payload.request.data.manifest
  // Only manifest name is allowed to be updated
  state.project.manifests[updatedManifest.id].name = updatedManifest.name
  return state
}

export function deleteManifest(action, state) {
  const deletedManifest = action.payload.request.data.manifest
  // Delete the manifest with id deletedManifest.id from the active project's manifests
  delete state.project.manifests[deletedManifest.id]
  // Update all sides that have an image mapped from deletedManifest
  for (let rectoID of [...Object.keys(state.project.Rectos)]){
    const rectoSide = state.project.Rectos[rectoID]
    if (rectoSide.image.hasOwnProperty('manifestID') && rectoSide.image.manifestID===deletedManifest.id)
      state.project.Rectos[rectoID].image = {}
  }
  for (let versoID of [...Object.keys(state.project.Versos)]) {
    const versoSide = state.project.Versos[versoID]
    if (versoSide.image.hasOwnProperty('manifestID') && versoSide.image.manifestID === deletedManifest.id)
      state.project.Versos[versoID].image = {}
  }
  return state
}
