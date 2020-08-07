import { initialState } from './initialStates/projects';

export default function dashboardReducer(state = initialState, action) {
  try {
    if (action.error) {
      action = { type: action.type, payload: action.error.response.data };
    }
  } catch (e) {}

  switch (action.type) {
    case 'LOAD_PROJECT_SUCCESS':
      state = action.payload.dashboard;
      break;
    case 'LOAD_PROJECTS_SUCCESS':
    case 'CREATE_PROJECT_SUCCESS':
    case 'CLONE_PROJECT_IMPORT_SUCCESS':
    case 'IMPORT_MANIFEST_SUCCESS':
      state = action.payload;
      break;
    case 'IMPORT_PROJECT_SUCCESS':
      state = {
        projects: action.payload.projects,
        images: action.payload.images,
        importStatus: 'SUCCESS',
      };
      break;
    case 'IMPORT_PROJECT_SUCCESS_CALLBACK':
      state = { ...state, importStatus: null };
      break;
    case 'LOGOUT_SUCCESS':
    case 'DELETE_PROFILE_SUCCESS':
      state = initialState;
      break;
    case 'IMPORT_PROJECT_FAILED':
      state = {
        ...state,
        importStatus: action.payload.error,
      };
      break;
    case 'CREATE_PROJECT_FAILED':
    case 'LOAD_PROJECTS_FAILED':
    case 'CLONE_PROJECT_IMPORT_FAILED':
      break;

    // FRONT-END ACTIONS
    case 'UPDATE_PROJECT_FRONTEND':
    case 'DELETE_PROJECT_FRONTEND':
      state = action.payload.response;
      break;
    case 'LINK_IMAGES_FRONTEND':
    case 'UNLINK_IMAGES_FRONTEND':
    case 'DELETE_IMAGES_FRONTEND':
    case 'MAP_SIDES_FRONTEND':
      state = action.payload.response.dashboard;
      break;
    case 'UPLOAD_IMAGES_SUCCESS_BACKEND':
      state = action.payload.response.dashboard;
      break;
    case 'DELETE_PROJECT_SUCCESS_BACKEND':
      state = action.payload;
      break;
    default:
      break;
  }
  return state;
}
