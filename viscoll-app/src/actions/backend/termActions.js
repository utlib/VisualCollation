export function addTerm(term) {
  /**
     term: {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "id": "595130sadsadsa9bf3c7b9a573a3f"
    "title": "some title for term",
    "taxonomy": "Ink",
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
    "taxonomy": "Ink",
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

export function createTaxonomy(taxonomy) {
  /**
     "taxonomy": {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "taxonomy": "Ink"
  }
     */
  return {
    types: [
      'CREATE_TAXONOMY_FRONTEND',
      'CREATE_TAXONOMY_SUCCESS_BACKEND',
      'CREATE_TAXONOMY_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/taxonomy`,
        method: 'post',
        data: { taxonomy },
        successMessage: 'Successfully created the term taxonomy',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
    isUndoable: true,
  };
}

export function updateTaxonomy(taxonomy) {
  /**
     "taxonomy": {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "taxonomy": "Ink",
    "old_taxonomy": "Inkss"
  }
     */
  return {
    types: [
      'UPDATE_TAXONOMY_FRONTEND',
      'UPDATE_TAXONOMY_SUCCESS_BACKEND',
      'UPDATE_TAXONOMY_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/taxonomy`,
        method: 'put',
        data: { taxonomy },
        successMessage: 'Successfully updated the term taxonomy',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
    isUndoable: true,
  };
}

export function deleteTaxonomy(taxonomy) {
  /**
     "taxonomy": {
    "project_id": "5951303fc9bf3c7b9a573a3f",
    "taxonomy": "Ink"
  }
     */
  return {
    types: [
      'DELETE_TAXONOMY_FRONTEND',
      'DELETE_TAXONOMY_SUCCESS_BACKEND',
      'DELETE_TAXONOMY_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/terms/taxonomy`,
        method: 'delete',
        data: { taxonomy },
        successMessage: 'Successfully deleted the term taxonomy',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
    isUndoable: true,
  };
}
