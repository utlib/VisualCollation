export function changeViewMode(viewMode) {
  return { 
    type: "CHANGE_VIEW_MODE", 
    payload: viewMode 
  };
}

export function changeManagerMode(managerMode) {
  return { 
    type: "CHANGE_MANAGER_MODE", 
    payload: managerMode 
  };
}

export function changeNotesTab(newTab) {
  return { 
    type: "CHANGE_NOTES_TAB", 
    payload: newTab 
  };
}

export function changeImageTab(newTab) {
  return { 
    type: "CHANGE_IMAGES_TAB", 
    payload: newTab 
  };
}

export function toggleFilterPanel(value) {
  return { 
    type: "TOGGLE_FILTER_PANEL", 
    payload: value 
  };
}

export function handleObjectPress(selectedObjects, object, event) {
  selectedObjects = {...selectedObjects, members: [...selectedObjects.members]};
  selectedObjects.type = object.memberType;
  selectedObjects.members = [object.id];

  return { 
    type: "TOGGLE_SELECTED_OBJECTS",
    payload: selectedObjects
  };
  
}

export function handleObjectClick(selectedObjects, object, event, objects) {
  selectedObjects = {...selectedObjects, members: [...selectedObjects.members]};
  if (event.ctrlKey || event.metaKey || (event.modifiers!==undefined && event.modifiers.command)) {
    // Toggle this object without clearing active objects unless type is different
    if (selectedObjects.type !== object.memberType) {
      selectedObjects.members = [];
      selectedObjects.type = object.memberType;
    }
    const index = selectedObjects.members.indexOf(object.id);
    if (index !== -1) {
      selectedObjects.members.splice(index, 1);
    }
    else {
      selectedObjects.members.push(object.id)
    }
  }
  if (event.button === 0 || event.modifiers!==undefined) {
    let notCtrl=event.ctrlKey !== undefined && !event.ctrlKey && !event.shiftKey;
    let notCmd=event.metaKey !== undefined && !event.metaKey && !event.shiftKey;
    let notCanvasCmd=event.modifiers !== undefined && !event.modifiers.command && !event.modifiers.shift;
    if ((notCtrl&&notCmd)||notCanvasCmd) {
      // Clear all and toggle only this object
      if (selectedObjects.members.includes(object.id)) {
        selectedObjects.members = [];
      } 
      else {
        selectedObjects.members = [object.id];
      }
    }
    if (event.shiftKey || (event.modifiers!==undefined && event.modifiers.shift)) {
      window.getSelection().removeAllRanges();
      // Object type changed, clear all active selected objects
      if (selectedObjects.type !== object.memberType) {
        selectedObjects.members = [object.id];
      } else {
        // Select all similar type objects within this object and last selected object
        const orderOfCurrentElement = objects[object.memberType+"s"].indexOf(object.id)
        const orderOfLastElement = objects[object.memberType+"s"].indexOf(selectedObjects.lastSelected)
        let indexes = [orderOfLastElement, orderOfCurrentElement];
        indexes.sort((a, b) => {return a-b});
        const currentSelected = [...selectedObjects.members];
        selectedObjects.members = objects[object.memberType+"s"].slice(indexes[0], indexes[1]+1);
        for (let id of currentSelected){
          if (!selectedObjects.members.includes(id))
            selectedObjects.members.push(id);
        }
      }
    }
  }
  // Sort the selected members by ascending order
  selectedObjects.members.sort((a, b)=>objects[object.memberType+"s"].indexOf(a) > objects[object.memberType+"s"].indexOf(b) ? 1 : -1);
 
  if (selectedObjects.members.length === 0) {
    selectedObjects.type = "";
  } else {
    selectedObjects.type = object.memberType;
    selectedObjects.lastSelected = object.id;
  }

  return { 
    type: "TOGGLE_SELECTED_OBJECTS",
    payload: selectedObjects
  };
}


export function toggleVisibility(memberType, attributeName, newValue) {
  return { 
    type: "TOGGLE_VISIBILITY", 
    payload: {
      memberType, 
      attributeName, 
      newValue
    } 
  };
}
/**
 * Switch selectedObjects between types: Leaf, Recto, Verso
 * @param {object} selectedObjects currently selected objects
 * @param {string} newType new type to switch to (leaf, recto or verso)
 * @param {object} Leafs all Leaf, Recto & Verso objects of this project
 */
export function changeInfoBoxTab(newType, selectedObjects, objects) {
  let newSelectedObjects = {type: newType, members: [], lastSelected: ""};
  if (selectedObjects.type==="newType")
    return { type: "NO_TAB_CHANGE" }

  const object = objects[selectedObjects.type+"s"];

  switch(newType) {
    case "Leaf":
      for (let id of selectedObjects.members){
        newSelectedObjects.members.push(object[id].parentID)
      }
      break;
    case "Recto":
      for (let id of selectedObjects.members){
        if (selectedObjects.type==="Leaf")
          newSelectedObjects.members.push(object[id].rectoID)
        else
          newSelectedObjects.members.push(objects.Leafs[object[id].parentID].rectoID)
      }
      break;
    case "Verso":
      for (let id of selectedObjects.members){
        if (selectedObjects.type==="Leaf")
          newSelectedObjects.members.push(object[id].versoID)
        else
          newSelectedObjects.members.push(objects.Leafs[object[id].parentID].versoID)
      }
      break;
    default:
      break;
  }

  newSelectedObjects.lastSelected = newSelectedObjects.members[newSelectedObjects.members.length-1]

  return { 
    type: "TOGGLE_SELECTED_OBJECTS", 
    payload: newSelectedObjects,
  };
}

export function toggleVisualizationDrawing(request) {
  return { 
    type: 'TOGGLE_VISUALIZATION_DRAWING',
    payload: request
  };
}