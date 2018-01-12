import { initialState } from './initialStates/projects';

export default function projectReducer(state=initialState, action) {
  try {
    if (action.error) {
      if (action.error.status===0 || action.error.response.status===400 || action.error.response.status===401) return initialState;
      action = {type: action.type, payload: action.error.response.data}
    }
  } catch (e) {}

  switch(action.type) {
    case "persist/REHYDRATE":
      if (action.payload.projects){
        state = {projects: action.payload.projects.projects, images: action.payload.projects.images, importStatus: null}
      }
      break;
    case "LOAD_PROJECTS_SUCCESS":
    case "CREATE_PROJECT_SUCCESS":
    case "UPDATE_PROJECT_SUCCESS":
    case 'DELETE_PROJECT_SUCCESS':
    case "CLONE_PROJECT_IMPORT_SUCCESS":
    case "IMPORT_MANIFEST_SUCCESS":
    case "LINK_IMAGES_SUCCESS":
    case "UNLINK_IMAGES_SUCCESS":
    case "DELETE_IMAGES_SUCCESS":
      state = action.payload;
      break;
    case "UPLOAD_IMAGES_SUCCESS":
    case "UPLOAD_IMAGES_IN_PROJECT_SUCCESS":
      let newImages = Object.assign([], state.images);
      newImages = newImages.concat(action.payload.images);
      state = {...state,
        images: newImages,
      }
      break;
    case "IMPORT_PROJECT_SUCCESS":
      state = {
        projects: action.payload.projects, 
        images: action.payload.images, 
        importStatus: "SUCCESS"
      }
      break;
    case "IMPORT_PROJECT_SUCCESS_CALLBACK":
      state = {...state, importStatus: null}
      break;
    case "LOGOUT_SUCCESS":
    case "DELETE_PROFILE_SUCCESS":
      state = initialState
      break;
    case "IMPORT_PROJECT_FAILED":
      state = {
        ...state,
         importStatus: action.payload.error
      }
      break;
    case "CREATE_PROJECT_FAILED":
    case "UPDATE_PROJECT_FAILED":
    case "DELETE_PROJECT_FAILED":
    case "LOAD_PROJECTS_FAILED":
    case "CLONE_PROJECT_IMPORT_FAILED":
      break;
    default:
      break;
  }
  return state;
}

