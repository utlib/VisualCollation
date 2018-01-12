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
    types: ['CREATE_LEAVES_FRONTEND','CREATE_LEAVES_SUCCESS_BACKEND','CREATE_LEAVES_FAILED_BACKEND'],
    payload: {
      request : {
        url: `/leafs`,
        method: 'post',
        data: { leaf, additional },
        successMessage: "Successfully added the leaf(s)" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateLeaf(leafID, leaf) {
  return { 
    types: ['UPDATE_LEAF_FRONTEND','UPDATE_LEAF_SUCCESS_BACKEND','UPDATE_LEAF_FAILED_BACKEND'],
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
    types: ['UPDATE_LEAVES_FRONTEND','UPDATE_LEAVES_SUCCESS_BACKEND','UPDATE_LEAVES_FAILED_BACKEND'],
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


/**
leafs: [
  "59ea025c3b0eb7168e9591de",
  "59ea025c3b0eb7168e9591de",
  "59ea025c3b0eb7168e9591de",
  "59ea025c3b0eb7168e9591de"
]
*/
export function autoConjoinLeafs(leafs) {
  return { 
    types: ['AUTOCONJOIN_LEAFS_FRONTEND','AUTOCONJOIN_LEAFS_SUCCESS_BACKEND','AUTOCONJOIN_LEAFS_FAILED_BACKEND'],
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
    types: ['DELETE_LEAF_FRONTEND','DELETE_LEAF_SUCCESS_BACKEND','DELETE_LEAF_FAILED_BACKEND'],
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
    types: ['DELETE_LEAVES_FRONTEND','DELETE_LEAFS_SUCCESS_BACKEND','DELETE_LEAFS_FAILED_BACKEND'],
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
    types: ['CREATE_GROUPS_FRONTEND','CREATE_GROUPS_SUCCESS_BACKEND','CREATE_GROUPS_FAILED_BACKEND'],
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
    types: ['UPDATE_GROUP_FRONTEND','UPDATE_GROUP_SUCCESS_BACKEND','UPDATE_GROUP_FAILED_BACKEND'],
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
    types: ['UPDATE_GROUPS_FRONTEND','UPDATE_GROUPS_SUCCESS_BACKEND','UPDATE_GROUPS_FAILED_BACKEND'],
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
    types: ['DELETE_GROUP_FRONTEND','DELETE_GROUP_SUCCESS_BACKEND','DELETE_GROUP_FAILED_BACKEND'],
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
    types: ['DELETE_GROUPS_FRONTEND','DELETE_GROUPS_SUCCESS_BACKEND','DELETE_GROUPS_FAILED_BACKEND'],
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
    types: ['UPDATE_SIDE_FRONTEND','UPDATE_SIDE_SUCCESS_BACKEND','UPDATE_SIDE_FAILED_BACKEND'],
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
    types: ['UPDATE_SIDES_FRONTEND','UPDATE_SIDES_SUCCESS_BACKEND','UPDATE_SIDES_FAILED_BACKEND'],
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
    "id": "595130sadsadsa9bf3c7b9a573a3f"
    "title": "some title for note",
    "type": "Ink",
    "description": "blue ink",
    "show": "true"
  }
  */
  return { 
    types: ['CREATE_NOTE_FRONTEND','CREATE_NOTE_SUCCESS_BACKEND','CREATE_NOTE_FAILED_BACKEND'],
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
    types: ['UPDATE_NOTE_FRONTEND','UPDATE_NOTE_SUCCESS_BACKEND','UPDATE_NOTE_FAILED_BACKEND'],
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



export function deleteNote(noteID) {
  return { 
    types: ['DELETE_NOTE_FRONTEND','DELETE_NOTE_SUCCESS_BACKEND','DELETE_NOTE_FAILED_BACKEND'],
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
    types: ['LINK_NOTE_FRONTEND','LINK_NOTE_SUCCESS_BACKEND','LINK_NOTE_FAILED_BACKEND'],
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
    types: ['UNLINK_NOTE_FRONTEND','UNLINK_NOTE_SUCCESS_BACKEND','UNLINK_NOTE_FAILED_BACKEND'],
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
    types: ['CREATE_NOTETYPE_FRONTEND','CREATE_NOTETYPE_SUCCESS_BACKEND','CREATE_NOTETYPE_FAILED_BACKEND'],
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
    types: ['UPDATE_NOTETYPE_FRONTEND','UPDATE_NOTETYPE_SUCCESS_BACKEND','UPDATE_NOTETYPE_FAILED_BACKEND'],
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
    types: ['DELETE_NOTETYPE_FRONTEND','DELETE_NOTETYPE_SUCCESS_BACKEND','DELETE_NOTETYPE_FAILED_BACKEND'],
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


export function mapSidesToImages(sideMappings) {
  // sideMappings = [{id: 112, image: {}}, ...]
  return { 
    types: ['MAP_SIDES_FRONTEND','MAP_SIDES_SUCCESS_BACKEND','MAP_SIDES_FAILED_BACKEND'],
    payload: {
      request : {
        url: `/sides`,
        method: 'put',
        data: {sides: sideMappings},
        successMessage: "Successfully updated the sides" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}