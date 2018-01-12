
export function login(session) {
  return { 
    types: ['NO_LOADING','LOGIN_SUCCESS','LOGIN_FAILED'],
    payload: {
      request : {
        url: `/session`,
        method: 'post',
        data: { session },
        successMessage: "You have successfully logged in" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function register(user) {
  return { 
    types: ['NO_LOADING','REGISTER_SUCCESS','REGISTER_FAILED'],
    payload: {
      request : {
        url: `/registration`,
        method: 'post',
        data: {user},
        successMessage: "You have successfully registered" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function confirm(confirmation_token) {
  return { 
    types: ['NO_LOADING','CONFIRM_SUCCESS','CONFIRM_FAILED'],
    payload: {
      request : {
        url: `/confirmation`,
        method: 'put',
        data: { confirmation_token },
        successMessage: "You have successfully confirmed your account" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function resendConfirmation(email) {
  return {
    type: 'RESEND_CONFIRMATION',
    payload: {
      request : {
        url: `/confirmation`,
        method: 'post',
        data: {
          confirmation: {
            email: email
          }
        },
        successMessage: "You have successfully resent the confirmation email" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  }
}

export function logout() {
  return { 
    types: ['NO_LOADING','LOGOUT_SUCCESS','LOGOUT_FAILED'],
    payload: {
      request : {
        url: `/session`,
        method: 'delete',
        successMessage: "You have successfully logged out" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function resetPasswordRequest(email) {
  return { 
    types: ['NO_LOADING','REQUEST_RESET_SUCCESS','REQUEST_RESET_FAILED'],
    payload: {
      request : {
        url: `/password`,
        method: 'post',
        data: {password: { email }},
        successMessage: "You have successfully requested to reset password" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function resetPassword(reset_password_token, password) {
  return { 
    types: ['NO_LOADING','RESET_SUCCESS','RESET_FAILED'],
    payload: {
      request : {
        url: `/password`,
        method: 'put',
        data: {reset_password_token, password},
        successMessage: "You have successfully reset your password" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function updateProfile(user, userID) {
  return { 
    types: ['SHOW_LOADING','UPDATE_PROFILE_SUCCESS','UPDATE_PROFILE_FAILED'],
    payload: {
      request : {
        url: `/users/${userID}`,
        method: 'put',
        data: user,
        successMessage: "You have successfully updated your account" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function deleteProfile(userID) {
  return { 
    types: ['SHOW_LOADING','DELETE_PROFILE_SUCCESS','DELETE_PROFILE_FAILED'],
    payload: {
      request : {
        url: `/users/${userID}`,
        method: 'delete',
        successMessage: "You have successfully deleted your account" ,
        errorMessage: "Ooops! Something went wrong"
      }
    }
  };
}

export function sendFeedback(title, message, browserInformation, project) {
  return {
    types: ['NO_LOADING', 'SEND_FEEDBACK_SUCCESS', 'SEND_FEEDBACK_FAILED'],
    payload: {
      request: {
        url: `/feedback`,
        method: 'post',
        data: {title, message, browserInformation, project},
        successMessage: "You have successfully sent a feedback!",
        errorMessage: "Ooops! Something went wrong"
      }
    }
  }
}


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
    }
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
    }
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