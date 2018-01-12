export function updateImagesAfterUpload(action, dashboard, active) {
  const newDIYImages = action.payload.images
  dashboard.images = [...dashboard.images, ...newDIYImages]
  if (active.project.id !== ""){
    // Update the active project's DIYManifest images list
    active.project.manifests.DIYImages.images = [
      ...active.project.manifests.DIYImages.images, 
      ...newDIYImages.map(image => { 
        return { label: image.label, url: image.url, manifestID: "DIYImages" } 
      })
    ]
  }
  return {dashboard, active}
}
