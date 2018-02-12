
/**
 *
 * @param {list} projectIDs [ 5a26d22f3b0eb7594c9dec23, ... ]
 * @param {imageIDs} imageIDs [ 5a26d22f3b0eb7594c9dec23, ... ]
 */
export function linkImages(projectIDs, imageIDs) {
    return {
        types: ['LINK_IMAGES_FRONTEND','LINK_IMAGES_SUCCESS_BACKEND','LINK_IMAGE_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/images/link`,
                data: {projectIDs, imageIDs},
                method: 'put',
                successMessage: projectIDs.length>1 ? "You have successfully linked the projects to this image" : "You have successfully linked the project to this image" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

/**
 *
 * @param {list} projectIDs [ 5a26d22f3b0eb7594c9dec23, ... ]
 * @param {imageIDs} imageIDs [ 5a26d22f3b0eb7594c9dec23, ... ]
 */
export function unlinkImages(projectIDs, imageIDs) {
    return {
        types: ['UNLINK_IMAGES_FRONTEND','UNLINK_IMAGES_SUCCESS_BACKEND','UNLINK_IMAGES_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/images/unlink`,
                data: {projectIDs, imageIDs},
                method: 'put',
                successMessage: projectIDs.length>1 ? "You have successfully unlinked the projects to this image" : "You have successfully unlinked this project to this image" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

/**
 *
 * @param {list} imageIDs
 */
export function deleteImages(imageIDs) {
    return {
        types: ['DELETE_IMAGES_FRONTEND','DELETE_IMAGES_SUCCESS_BACKEND','DELETE_IMAGES_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/images/`,
                method: 'delete',
                data: {imageIDs},
                successMessage: imageIDs.length>1?"You have successfully deleted the images":"You have successfully deleted the image",
                errorMessage: "Ooops! Something went wrong"
            }
        }
    };
}

/**
 *
 * @param {list} images [ { filename:"", contents: data(base64) } , ... ]
 */
export function uploadImages(images, projectID) {
    return {
        types: ['SHOW_LOADING','UPLOAD_IMAGES_SUCCESS_BACKEND','UPLOAD_IMAGES_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/images`,
                method: 'post',
                data: {projectID, images},
                successMessage: images.length>1? "You have successfully uploaded your images" : "You have successfully uploaded your image" ,
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
    },
    isUndoable: true,
  };
}