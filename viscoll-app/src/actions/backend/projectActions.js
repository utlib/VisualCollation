export function loadProject(projectID, showLoading = 'SHOW_LOADING') {
  return {
    types: [showLoading, 'LOAD_PROJECT_SUCCESS', 'LOAD_PROJECT_FAILED'],
    payload: {
      request: {
        url: `/projects/${projectID}`,
        method: 'get',
        successMessage: '',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function loadProjectViewOnly(projectID, showLoading = 'SHOW_LOADING') {
  return {
    types: [
      showLoading,
      'LOAD_PROJECT_VIEW_ONLY_SUCCESS',
      'LOAD_PROJECT_VIEW_ONLY_FAILED',
    ],
    payload: {
      request: {
        url: `/projects/${projectID}/viewOnly`,
        method: 'get',
        successMessage: '',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function createProject(newProject) {
  return {
    types: ['SHOW_LOADING', 'CREATE_PROJECT_SUCCESS', 'CREATE_PROJECT_FAILED'],
    payload: {
      request: {
        url: `/projects`,
        method: 'post',
        data: newProject,
        successMessage: 'Successfully created the project',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function updateProject(projectID, project) {
  return {
    types: [
      'UPDATE_PROJECT_FRONTEND',
      'UPDATE_PROJECT_SUCCESS_BACKEND',
      'UPDATE_PROJECT_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/projects/${projectID}`,
        method: 'put',
        data: { project },
        successMessage: 'Successfully updated the project',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function updatePreferences(projectID, project) {
  return {
    types: ['UPDATE_PREFERENCES_FRONTEND', '', 'UPDATE_PROJECT_FAILED_BACKEND'],
    payload: {
      request: {
        url: `/projects/${projectID}`,
        method: 'put',
        data: { project },
        successMessage: 'Successfully updated the project',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function deleteProject(projectID, deleteUnlinkedImages) {
  return {
    types: [
      'DELETE_PROJECT_FRONTEND',
      'DELETE_PROJECT_SUCCESS_BACKEND',
      'DELETE_PROJECT_FAILED_BACKEND',
    ],
    payload: {
      request: {
        url: `/projects/${projectID}`,
        method: 'delete',
        data: { deleteUnlinkedImages },
        successMessage: 'Successfully deleted the project',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function loadProjects() {
  return {
    types: ['NO_LOADING', 'LOAD_PROJECTS_SUCCESS', 'LOAD_PROJECTS_FAILED'],
    payload: {
      request: {
        url: `/projects`,
        method: 'get',
        successMessage: '',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

/**
 *
 * @param {object} data {importData:"", importFormat:"", imageData:""}
 */
export function importProject(data) {
  return {
    types: ['SHOW_LOADING', 'IMPORT_PROJECT_SUCCESS', 'IMPORT_PROJECT_FAILED'],
    payload: {
      request: {
        url: `/projects/import`,
        method: 'put',
        data: data,
        successMessage: 'Successfully imported the project',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function cloneProject(projectID) {
  return {
    types: ['SHOW_LOADING', 'CLONE_PROJECT_SUCCESS', 'CLONE_PROJECT_FAILED'],
    payload: {
      request: {
        url: `/projects/${projectID}/clone`,
        method: 'get',
        successMessage: 'Successfully cloned the project',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function exportProject(projectID, format) {
  return {
    types: ['SHOW_LOADING', 'EXPORT_SUCCESS', 'EXPORT_FAILED'],
    payload: {
      request: {
        url: `/projects/${projectID}/export/${format}`,
        method: 'get',
        successMessage: '',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}

export function exportProjectBeforeFeedback(projectID, format) {
  return {
    types: ['NO_LOADING', 'EXPORT_SUCCESS', 'EXPORT_FAILED'],
    payload: {
      request: {
        url: `/projects/${projectID}/export/${format}`,
        method: 'get',
        successMessage: 'You have successfully sent a feedback!',
        errorMessage: 'Ooops! Something went wrong',
      },
    },
  };
}
