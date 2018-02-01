export function linkImages(action, dashboard, active) {
  if (active.project.id!=="")
    linkImagesFromProject(action, dashboard, active)
  linkImagesFromDashboard(action, dashboard)
  return {dashboard, active}
}

export function unlinkImages(action, dashboard, active) {
  if (active.project.id !== "")
    unlinkImagesFromProject(action, dashboard, active)
  unlinkImagesFromDashboard(action, dashboard)
  return { dashboard, active }
}

export function deleteImages(action, dashboard, active) {
  if (active.project.id !== "")
    unlinkImagesFromProject(action, dashboard, active)
  deleteImagesFromDashboard(action, dashboard)
  return { dashboard, active }
}


export function linkImagesFromProject(action, dashboard, active) {
  const imageIDs = action.payload.request.data.imageIDs
  for (let imageID of imageIDs) {
    // Add image of imageID to the list of DIYImages in active project
    const imageIndex = dashboard.images.findIndex(image => image.id === imageID)
    const image = dashboard.images[imageIndex]
    active.project.manifests.DIYImages.images.push({
      label: image.label,
      url: image.url,
      manifestID: "DIYImages"
    })
  }
}


export function unlinkImagesFromProject(action, dashboard, active) {
  const imageIDs = action.payload.request.data.imageIDs
  for (let imageID of imageIDs) {
    // Remove image of imageID from the list of DIYImages in active project
    let imageIndex = dashboard.images.findIndex(image => image.id === imageID)
    const image = dashboard.images[imageIndex]
    imageIndex = active.project.manifests.DIYImages.images.findIndex(DIYImage => DIYImage.label === image.label)
    active.project.manifests.DIYImages.images.splice(imageIndex, 1)
    // Unlink all sides of this project if it was mapped to this image
    for (let sideID of image.sideIDs) {
      if (active.project.Rectos.hasOwnProperty(sideID))
        active.project.Rectos[sideID].image = {}
      if (active.project.Versos.hasOwnProperty(sideID))
        active.project.Versos[sideID].image = {}
    }
  }
}


export function linkImagesFromDashboard(action, dashboard) {
  const projectIDs = action.payload.request.data.projectIDs
  const imageIDs = action.payload.request.data.imageIDs
  for (let projectID of projectIDs){
    // Add projectID to the list of projectIDs for each image of imageIDs
    for (let imageID of imageIDs) {
      let imageIndex = dashboard.images.findIndex(image => image.id === imageID)
      let projectIDIndex = dashboard.images[imageIndex].projectIDs.indexOf(projectID)
      if (projectIDIndex === -1)
        dashboard.images[imageIndex].projectIDs.push(projectID)
    }
  }
}


export function unlinkImagesFromDashboard(action, dashboard) {
  const projectIDs = action.payload.request.data.projectIDs
  const imageIDs = action.payload.request.data.imageIDs
  for (let projectID of projectIDs) {
    // Remove projectID from the list of projectIDs for each image of imageIDs
    for (let imageID of imageIDs) {
      let imageIndex = dashboard.images.findIndex(image => image.id === imageID)
      let projectIDIndex = dashboard.images[imageIndex].projectIDs.indexOf(projectID)
      if (projectIDIndex !== -1)
        dashboard.images[imageIndex].projectIDs.splice(projectIDIndex, 1)
    }
  }
}


export function deleteImagesFromDashboard(action, dashboard) {
  const imageIDs = action.payload.request.data.imageIDs
  // Remove imageID from dashboard.images for each image of imageIDs
  for (let imageID of imageIDs) {
    let imageIndex = dashboard.images.findIndex(image => image.id === imageID)
    dashboard.images.splice(imageIndex, 1)
  }
}