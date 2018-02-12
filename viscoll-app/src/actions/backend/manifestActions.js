


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
    },
    isUndoable: true,
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
    },
    isUndoable: true,
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