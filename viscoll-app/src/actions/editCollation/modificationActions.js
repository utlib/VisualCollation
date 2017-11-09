export function loadProject(projectID, showLoading='SHOW_LOADING') {
  return { 
    types: [showLoading,'LOAD_PROJECT_SUCCESS','LOAD_PROJECT_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}`,
        method: 'get',
        successMessage: "" ,
        errorMessage: "Ooops! Something went wrong",
      },
    }
  };
}

export function addLeafs(leaf, additional) {
  return { 
    types: ['SHOW_LOADING','ADD_LEAF(S)_SUCCESS','ADD_LEAF(S)_FAILED'],
    payload: {
      request : {
        url: `/leafs`,
        method: 'post',
        data: {leaf, additional},
        successMessage: "Successfully added the leaf(s)" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateLeaf(leafID, leaf) {
  return { 
    types: ['NO_LOADING','UPDATE_LEAF_SUCCESS','UPDATE_LEAF_FAILED'],
    payload: {
      request : {
        url: `/leafs/${leafID}`,
        method: 'put',
        data: {leaf},
        successMessage: "Successfully updated the leaf" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateLeafs(leafs, project_id) {
  return { 
    types: ['NO_LOADING','UPDATE_LEAFS_SUCCESS','UPDATE_LEAFS_FAILED'],
    payload: {
      request : {
        url: `/leafs`,
        method: 'put',
        data: {leafs, project_id},
        successMessage: "Successfully updated the leafs" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function conjoinLeafs(leafs) {
  return { 
    types: ['NO_LOADING','UPDATE_LEAFS_SUCCESS','UPDATE_LEAFS_FAILED'],
    payload: {
      request : {
        url: `/leafs/conjoin`,
        method: 'put',
        data: {leafs},
        successMessage: "Successfully conjoined the leafs" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteLeaf(leafID) {
  return { 
    types: ['SHOW_LOADING','DELETE_LEAF_SUCCESS','DELETE_LEAF_FAILED'],
    payload: {
      request : {
        url: `/leafs/${leafID}`,
        method: 'delete',
        successMessage: "Successfully deleted the leaf" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteLeafs(leafs) {
  return { 
    types: ['SHOW_LOADING','DELETE_LEAFS_SUCCESS','DELETE_LEAFS_FAILED'],
    payload: {
      request : {
        url: `/leafs`,
        method: 'delete',
        data: leafs,
        successMessage: "Successfully deleted the leafs" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function addGroups(group, additional) {
  return { 
    types: ['SHOW_LOADING','ADD_GROUP(S)_SUCCESS','ADD_GROUP(S)_FAILED'],
    payload: {
      request : {
        url: `/groups`,
        method: 'post',
        data: {group, additional},
        successMessage: "Successfully added the groups" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateGroup(groupID, group) {
  return { 
    types: ['NO_LOADING','UPDATE_GROUP_SUCCESS','UPDATE_GROUP_FAILED'],
    payload: {
      request : {
        url: `/groups/${groupID}`,
        method: 'put',
        data: {group},
        successMessage: "Successfully updated the group" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateGroups(groups) {
  return { 
    types: ['NO_LOADING','UPDATE_GROUPS_SUCCESS','UPDATE_GROUPS_FAILED'],
    payload: {
      request : {
        url: `/groups`,
        method: 'put',
        data: {groups},
        successMessage: "Successfully updated the groups" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteGroup(groupID) {
  return { 
    types: ['SHOW_LOADING','DELETE_GROUP_SUCCESS','DELETE_GROUP_FAILED'],
    payload: {
      request : {
        url: `/groups/${groupID}`,
        method: 'delete',
        successMessage: "Successfully deleted the group" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteGroups(groups, projectID) {
  return { 
    types: ['SHOW_LOADING','DELETE_GROUPS_SUCCESS','DELETE_GROUPS_FAILED'],
    payload: {
      request : {
        url: `/groups`,
        method: 'delete',
        data: {...groups, projectID},
        successMessage: "Successfully deleted the groups" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateSide(sideID, side) {
  return { 
    types: ['NO_LOADING','UPDATE_SIDE_SUCCESS','UPDATE_SIDE_FAILED'],
    payload: {
      request : {
        url: `/sides/${sideID}`,
        method: 'put',
        data: {side},
        successMessage: "Successfully updated the side" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateSides(sides) {
  return { 
    types: ['NO_LOADING','UPDATE_SIDES_SUCCESS','UPDATE_SIDES_FAILED'],
    payload: {
      request : {
        url: `/sides`,
        method: 'put',
        data: {sides},
        successMessage: "Successfully updated the sides" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function addNote(note) {
  /**
  note: {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "title": "some title for note",
    "type": "Ink",
    "description": "blue ink"
  }
  */
  return { 
    types: ['SHOW_LOADING','CREATE_NOTE_SUCCESS','CREATE_NOTE_FAILED'],
    payload: {
      request : {
        url: `/notes`,
        method: 'post',
        data: {note},
        successMessage: "Successfully created the note" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateNote(noteID, note) {
  /**
  note: {
    "title": "some title for note",
    "type": "Ink",
    "description": "blue ink"
  }
  */
  return { 
    types: ['SHOW_LOADING','UPDATE_NOTE_SUCCESS','UPDATE_NOTE_FAILED'],
    payload: {
      request : {
        url: `/notes/${noteID}`,
        method: 'put',
        data: {note},
        successMessage: "Successfully updated the note" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function getNotes(projectID) {
  return { 
    types: ['NO_LOADING','LOAD_NOTES_SUCCESS','LOAD_NOTES_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}/notes`,
        method: 'get',
        successMessage: "Successfully loaded the notes" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteNote(noteID) {
  return { 
    types: ['SHOW_LOADING','DELETE_NOTE_SUCCESS','DELETE_NOTE_FAILED'],
    payload: {
      request : {
        url: `/notes/${noteID}`,
        method: 'delete',
        successMessage: "Successfully deleted the note" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function linkNote(noteID, objects) {
  /**
   objects: [
    {
      "id": "5951303fc9bf3c7b9a573a3f",
      "type": "Group"
    },
   ]
  */
  return { 
    types: ['NO_LOADING','LINK_NOTE_SUCCESS','LINK_NOTE_FAILED'],
    payload: {
      request : {
        url: `/notes/${noteID}/link`,
        method: 'put',
        data: {objects},
        successMessage: "Successfully linked the note" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function unlinkNote(noteID, objects) {
  /**
   objects: [
    {
      "id": "5951303fc9bf3c7b9a573a3f",
      "type": "Group"
    },
   ]
  */
  return { 
    types: ['NO_LOADING','UNLINK_NOTE_SUCCESS','UNLINK_NOTE_FAILED'],
    payload: {
      request : {
        url: `/notes/${noteID}/unlink`,
        method: 'put',
        data: {objects},
        successMessage: "Successfully unlinked the note" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function createNoteType(noteType) {
  /**
  "noteType": {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "type": "Ink"
  }
  */
  return { 
    types: ['NO_LOADING','CREATE_NOTETYPE_SUCCESS','CREATE_NOTETYPE_FAILED'],
    payload: {
      request : {
        url: `/notes/type`,
        method: 'post',
        data: {noteType},
        successMessage: "Successfully created the note type" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function updateNoteType(noteType) {
  /**
  "noteType": {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "type": "Ink",
    "old_type": "Inkss"
  }
  */
  return { 
    types: ['NO_LOADING','UPDATE_NOTETYPE_SUCCESS','UPDATE_NOTETYPE_FAILED'],
    payload: {
      request : {
        url: `/notes/type`,
        method: 'put',
        data: {noteType},
        successMessage: "Successfully updated the note type" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function deleteNoteType(noteType) {
  /**
  "noteType": {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "type": "Ink"
  }
  */
  return { 
    types: ['NO_LOADING','DELETE_NOTETYPE_SUCCESS','DELETE_NOTETYPE_FAILED'],
    payload: {
      request : {
        url: `/notes/type`,
        method: 'delete',
        data: {noteType},
        successMessage: "Successfully deleted the note type" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function mapSidesToImages(linkedSideIDs, images, unlinkedSideIDs) {
  // linkedSideIDs = [{id, ...}, {id, ...}]
  // images = [{manifestID: 123, label: "imageName", url: "http..."}]
  // unlinkedSideIDs = [id, id, id]
  let sides = [];
  for (const index of linkedSideIDs.keys()) {
    let side = {id: linkedSideIDs[index].id};
    side["attributes"] = {
      image: {manifestID: images[index].manifestID, label: images[index].id, url: images[index].url}
    }
    sides.push(side);
  }
  for (const id of unlinkedSideIDs) {
    let side = {id};
    side["attributes"] = {
      image: {}
    }
    sides.push(side);
  }
  return { 
    types: ['SHOW_LOADING','MAP_SIDES_SUCCESS','MAP_SIDES_FAILED'],
    payload: {
      request : {
        url: `/sides`,
        method: 'put',
        data: {sides},
        successMessage: "Successfully updated the sides" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}