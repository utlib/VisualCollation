
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
        },
        isUndoable: true,
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
        },
        isUndoable: true,
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
        },
        isUndoable: true,
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
        },
        isUndoable: true,
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
        },
        isUndoable: true,
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
        },
        isUndoable: true,
    };
}