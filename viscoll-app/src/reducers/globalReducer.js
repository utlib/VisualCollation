import { initialState } from './initialStates/global';


export default function globalReducer(state=initialState, action) {
  if (action.error && action.error.status===0) {
    state = {...state, serverError: true}
  }
  switch(action.type) {
    case "SHOW_LOADING":
      state = {...state, loading: true}
      break;
    case "HIDE_LOADING":
      state = {...state, loading: false}
      break;
    case "SHOW_NOTIFICATION":
      state = {...state, notification: action.payload}
      break;
    case "HIDE_NOTIFICATION":
      state = {...state, notification: ""}
      break;
    case "DELETE_PROFILE_SUCCESS":
    case "LOGOUT_SUCCESS":
      state = initialState
      break;
    case "BACKEND_SERVER_ERROR":
      state = {...state, serverError: true}
      break;
    default:
      break;
  }
  return state;
}

