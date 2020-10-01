export function addTerm(term) {
  /**
     term: {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "id": "595130sadsadsa9bf3c7b9a573a3f"
    "title": "some title for term",
    "type": "Ink",
    "description": "blue ink",
    "uri": "https://www.test.com/",
    "show": "true"
  }
     */
  return {
    types: [
      'CREATE_TERM_FRONTEND',
      'CREATE_TERM_SUCCESS_BACKEND',
      'CREATE_TERM_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms`,
        method: 'post',
        data: { term },
        successMessage: 'Successfully created the term',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function updateTerm(termID, term) {
  /**
     term: {
    "title": "some title for term",
    "type": "Ink",
    "description": "blue ink"
    "uri": "https://www.test.com/",
  }
     */
  return {
    types: [
      'UPDATE_TERM_FRONTEND',
      'UPDATE_TERM_SUCCESS_BACKEND',
      'UPDATE_TERM_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/${termID}`,
        method: 'put',
        data: { term },
        successMessage: 'Successfully updated the term',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function deleteTerm(termID) {
  return {
    types: [
      'DELETE_TERM_FRONTEND',
      'DELETE_TERM_SUCCESS_BACKEND',
      'DELETE_TERM_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/${termID}`,
        method: 'delete',
        successMessage: 'Successfully deleted the term',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
    isUndoable: true,
  };
}

export function linkTerm(termID, objects) {
  /**
     objects: [
     {
       "id": "5951303fc9bf3c7b9a573a3f",
       "type": "Group"
     },
     ]
     */
  return {
    types: [
      'LINK_TERM_FRONTEND',
      'LINK_TERM_SUCCESS_BACKEND',
      'LINK_TERM_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/${termID}/link`,
        method: 'put',
        data: { objects },
        successMessage: 'Successfully linked the term',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
    isUndoable: true,
  };
}

export function unlinkTerm(termID, objects) {
  /**
     objects: [
     {
       "id": "5951303fc9bf3c7b9a573a3f",
       "type": "Group"
     },
     ]
     */
  return {
    types: [
      'UNLINK_TERM_FRONTEND',
      'UNLINK_TERM_SUCCESS_BACKEND',
      'UNLINK_TERM_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/${termID}/unlink`,
        method: 'put',
        data: { objects },
        successMessage: 'Successfully unlinked the term',
        errorMessage: 'Ooops! Something went wrong',
      },
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
    types: [
      'CREATE_NOTETYPE_FRONTEND',
      'CREATE_NOTETYPE_SUCCESS_BACKEND',
      'CREATE_NOTETYPE_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/type`,
        method: 'post',
        data: { noteType },
        successMessage: 'Successfully created the note type',
        errorMessage: 'Ooops! Something went wrong',
      },
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
    types: [
      'UPDATE_NOTETYPE_FRONTEND',
      'UPDATE_NOTETYPE_SUCCESS_BACKEND',
      'UPDATE_NOTETYPE_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/type`,
        method: 'put',
        data: { noteType },
        successMessage: 'Successfully updated the note type',
        errorMessage: 'Ooops! Something went wrong',
      },
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
    types: [
      'DELETE_NOTETYPE_FRONTEND',
      'DELETE_NOTETYPE_SUCCESS_BACKEND',
      'DELETE_NOTETYPE_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/type`,
        method: 'delete',
        data: { noteType },
        successMessage: 'Successfully deleted the note type',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
    isUndoable: true,
  };
}
