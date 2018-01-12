
export function createProject(newProject) {
  return { 
    types: ['SHOW_LOADING','CREATE_PROJECT_SUCCESS','CREATE_PROJECT_FAILED'],
    payload: {
      request : {
        url: `/projects`,
        method: 'post',
        data: newProject,
        successMessage: "Successfully created the project" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateProject(projectID, project) {
  return { 
    types: ['UPDATE_PROJECT_FRONTEND','UPDATE_PROJECT_SUCCESS_BACKEND','UPDATE_PROJECT_FAILED_BACKEND'],
    payload: {
      request : {
        url: `/projects/${projectID}`,
        method: 'put',
        data: {project},
        successMessage: "Successfully updated the project",
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteProject(projectID, deleteUnlinkedImages) {
  return { 
    types: ['DELETE_PROJECT_FRONTEND','DELETE_PROJECT_SUCCESS_BACKEND','DELETE_PROJECT_FAILED_BACKEND'],
    payload: {
      request : {
        url: `/projects/${projectID}`,
        method: 'delete',
        data: {deleteUnlinkedImages},
        successMessage: "Successfully deleted the project" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function loadProjects() {
  return { 
    types: ['NO_LOADING','LOAD_PROJECTS_SUCCESS','LOAD_PROJECTS_FAILED'],
    payload: {
      request : {
        url: `/projects`,
        method: 'get',
        successMessage: "" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


/**
 * 
 * @param {object} data {importData:"", importFormat:"", imageData:""}
 */
export function importProject(data) {
  return { 
    types: ['SHOW_LOADING','IMPORT_PROJECT_SUCCESS','IMPORT_PROJECT_FAILED'],
    payload: {
      request : {
        url: `/projects/import`,
        method: 'put',
        data: data,
        successMessage: "Successfully imported the project",
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function cloneProject(projectID) {
  return { 
    types: ['SHOW_LOADING','CLONE_PROJECT_SUCCESS','CLONE_PROJECT_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}/clone`,
        method: 'get',
        successMessage: "Successfully cloned the project" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}


export function exportProject(projectID, format) {
  return { 
    types: ['SHOW_LOADING','EXPORT_SUCCESS','EXPORT_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}/export/${format}`,
        method: 'get',
        successMessage: "" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };  
}


export function exportProjectBeforeFeedback(projectID, format) {
  return { 
    types: ['NO_LOADING','EXPORT_SUCCESS','EXPORT_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}/export/${format}`,
        method: 'get',
        successMessage: "You have successfully sent a feedback!" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };  
}


export function createManifest(projectID, manifest) {
  return { 
    types: ['SHOW_LOADING','CREATE_MANIFEST_SUCCESS','CREATE_MANIFEST_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}/manifests`,
        method: 'post',
        data: manifest,
        successMessage: "You have successfully created the manifest" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };  
}


export function updateManifest(projectID, manifest) {
  return { 
    types: ['UPDATE_MANIFEST_FRONTEND','UPDATE_MANIFEST_SUCCESS_BACKEND','UPDATE_MANIFEST_FAILED_BACKEND'],
    payload: {
      request : {
        url: `/projects/${projectID}/manifests`,
        method: 'put',
        data: manifest,
        successMessage: "You have successfully updated the manifest" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };  
}


export function deleteManifest(projectID, manifest) {
  return { 
    types: ['DELETE_MANIFEST_FRONTEND','DELETE_MANIFEST_SUCCESS_BACKEND','DELETE_MANIFEST_FAILED_BACKEND'],
    payload: {
      request : {
        url: `/projects/${projectID}/manifests`,
        method: 'delete',
        data: manifest,
        successMessage: "You have successfully deleted the manifest" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };  
}

export function cancelCreateManifest(){
  return {type: "CANCEL_CREATE_MANIFEST"}
}


export function cloneProjectImagesMapping(projectID) {
  return { 
    types: ['NO_LOADING','CLONE_PROJECT_MAPPING_SUCCESS','CLONE_PROJECT_MAPPING_FAILED'],
    payload: {
      request : {
        url: `/projects/${projectID}/cloneImageMapping`,
        method: 'get',
        successMessage: "" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}