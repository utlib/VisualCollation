export function updateSide(action, state) {
  const updatedSideID = action.payload.request.url.split("/").pop();
  const updatedSide = action.payload.request.data.side
  // Update the side with id updatedSideID
  if (updatedSideID.charAt(0)==="R")
    state.project.Rectos[updatedSideID] = { ...state.project.Rectos[updatedSideID], ...updatedSide }
  else
    state.project.Versos[updatedSideID] = { ...state.project.Versos[updatedSideID], ...updatedSide }
  return state
}


export function updateSides(action, state) {
  const updatedSides = action.payload.request.data.sides
  for (let updatedSide of updatedSides) {
    // Update the side of id updatedSide.id with attributes updatedSide.attributes
    if (updatedSide.id.charAt(0) === "R")
      state.project.Rectos[updatedSide.id] = { ...state.project.Rectos[updatedSide.id], ...updatedSide.attributes }
    else
      state.project.Versos[updatedSide.id] = { ...state.project.Versos[updatedSide.id], ...updatedSide.attributes }
  }
  return state
}


export function mapSides(action, active, dashboard) {
  // SPEICAL CASE FOR DIY IMAGE MAPPING
  const mappedSides = action.payload.request.data.sides
  for (let mappedSide of mappedSides){
    const mappedSideID = mappedSide.id
    const mappedSideImage = mappedSide.attributes.image
    const sideNameKey = mappedSideID.charAt(0) === "R" ? "Rectos" : "Versos"
    const currentSideImage = active.project[sideNameKey][mappedSideID].image
    let imageLinkedID = false
    // If an Image was linked, check if it is a DIY Image and link mappedSideID to the Image
    if (mappedSideImage.hasOwnProperty('manifestID') && mappedSideImage.manifestID==='DIYImages'){
      imageLinkedID = mappedSideImage.url.split("/").pop().split("_")[0]
      let imageLinkedIDIndex = dashboard.images.findIndex(image => image.id===imageLinkedID)
      let mappedSideIDIndex = dashboard.images[imageLinkedIDIndex].sideIDs.indexOf(mappedSideID)
      // Link mappedSideID to this image
      if (mappedSideIDIndex===-1)
        dashboard.images[imageLinkedIDIndex].sideIDs.push(mappedSideID)  
    }
    // Check if this mappedSideID is now already linked to another DIY Image and unlink this mappedSideID from that Image
    if (mappedSideImage.hasOwnProperty('manifestID') && currentSideImage.hasOwnProperty('manifestID') && currentSideImage.manifestID === 'DIYImages') {
      let imageUnlinkedID = currentSideImage.url.split("/").pop().split("_")[0]
      if (!imageLinkedID || imageLinkedID !== imageUnlinkedID) {
        let imageUnlinkedIDIndex = dashboard.images.findIndex(image => image.id === imageUnlinkedID)
        let mappedSideIDIndex = dashboard.images[imageUnlinkedIDIndex].sideIDs.indexOf(mappedSideID)
        if (mappedSideIDIndex !== -1)
          dashboard.images[imageUnlinkedIDIndex].sideIDs.splice(mappedSideIDIndex, 1)
      }
    }
    // If an Image was unlinked, check if it was a DIY Image and unlink mappedSideID from the Image
    if (!mappedSideImage.hasOwnProperty('manifestID') && currentSideImage.hasOwnProperty('manifestID') && currentSideImage.manifestID==='DIYImages'){
      let imageID = currentSideImage.url.split("/").pop().split("_")[0]
      let imageIndex = dashboard.images.findIndex(image => image.id === imageID)
      let mappedSideIDIndex = dashboard.images[imageIndex].sideIDs.indexOf(mappedSideID)
      if (mappedSideIDIndex !== -1)
        dashboard.images[imageIndex].sideIDs.splice(mappedSideIDIndex, 1)
    }
  }
  updateSides(action, active) // this will handle updating the 'image' field of all mapped Sides
  return { dashboard, active }
}


function to_roman(num) {
  if (!+num) return NaN;
  let digits = String(+num).split(""),
    key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
          "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
          "","I","II","III","IV","V","VI","VII","VIII","IX"],
    roman = "",
    i = 3;
  while (i--)
    roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;

}

export function generateFolioNumbers(state) {
  let endleafCount = 0
  let folioNumberCount = 0
  for (let leafID of state.project.leafIDs) {
    const leaf = state.project.Leafs[leafID];
    const recto = state.project.Rectos[leaf.rectoID];
    const verso = state.project.Versos[leaf.versoID];
    if (leaf.type==="Endleaf") {
      endleafCount++;
      if (!recto.folio_number) {
        recto.generated_folio_number = to_roman(endleafCount) + recto.id[0];
      }
      if (!verso.folio_number) {
        verso.generated_folio_number = to_roman(endleafCount) + verso.id[0];
      }
    } else {
      if (!recto.folio_number || recto.folio_number==="" || !verso.folio_number || verso.folio_number==="") {
        folioNumberCount++;
        if (!recto.folio_number || recto.folio_number==="") {
          recto.generated_folio_number = folioNumberCount + recto.id[0];
        }
        if (!verso.folio_number || verso.folio_number==="") {
          verso.generated_folio_number = folioNumberCount + verso.id[0];
        }
      }
    }
  }
  return state
}