export function updateProject(action, state){
  const updatedProject = action.payload.request.data.project;
  const updatedProjectID = action.payload.request.url.split("/").pop();
  const projectIndex = state.projects.findIndex(project => project.id === updatedProjectID)
  state.projects[projectIndex] = {...state.projects[projectIndex], ...updatedProject};
  return state
}

export function deleteProject(action, state) {
  const deletedProjectID = action.payload.request.url.split("/").pop();
  const deletedProjectIndex = state.projects.findIndex(project => project.id === deletedProjectID);
  state.projects.splice(deletedProjectIndex, 1)
  // Remove deletedProjectID from all images. If image has no projects linked, delete the image.
  for (let image of [...state.images]){
    const projectIDIndex = image.projectIDs.indexOf(deletedProjectID)
    const imageIndex = state.images.findIndex(DIYImage => DIYImage.id === image.id)
    if (projectIDIndex !== -1) {
      state.images[imageIndex].projectIDs.splice(projectIDIndex, 1)
    }
    // Remove the image if its not linked to any other projects
    if (projectIDIndex!==-1 && image.projectIDs.length===0 && action.payload.request.data.deleteUnlinkedImages) {
      state.images.splice(imageIndex, 1)
    }
  }
  return state
}
