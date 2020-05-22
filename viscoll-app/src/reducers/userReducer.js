import { initialState } from './initialStates/user';

export default function userReducer(state=initialState, action) {
  try {
    if (action.error) action = {type: action.type, payload: action.error.response.data}
  } catch (e) {}
  let errorMessage = "";
  state.notification = "";
  switch(action.type) {
    case "persist/REHYDRATE":
      state = {...state, ...action.payload.user, errors: initialState.errors}
      delete state.registerSuccess
      break;
    case "LOGIN_SUCCESS":
      state = {
          ...state,
          id: action.payload.session.id,
          name: action.payload.session.name,
          email: action.payload.session.email,
          token: action.payload.session.jwt,
          authenticated: true,
          lastLoggedIn: action.payload.session.lastLoggedIn,
          preferences: action.payload.session.preferences,
        }
      break;
    case "LOGIN_FAILED":
      if (action.payload && action.payload.errors) errorMessage = action.payload.errors.session;
      if (action.error) errorMessage = [action.error.data];
      state = {
        ...state,
        errors: {
          ...state.errors,
          login: {
            errorMessage,
          },
        }
      }
      break;
    case "REGISTER_SUCCESS":
      state = {
        ...state,
        registerSuccess: true
      }
      break;
    case "REGISTER_FAILED":
      state = {
        ...state,
        errors: {
          ...state.errors,
          register: action.payload.errors
        }
      }
      break;
    case "UPDATE_PROFILE_SUCCESS":
      state = {
        ...state,
        errors: initialState.errors,
        ...action.payload
      }
      break;
    case "UPDATE_PROFILE_FAILED":
      state = {
        ...state,
        errors: {
          ...state.errors,
          update: {...state.errors.update, ...action.payload}
        }
      }
      break;
    case "LOGOUT_SUCCESS":
    case "DELETE_PROFILE_SUCCESS":
      state = initialState
      break;
    case "CONFIRM_SUCCESS":
      state = {
        ...state,
        notification: "Successfully confirmed your account!",
      }
      break; 
    case "REQUEST_RESET_SUCCESS":
    case "REQUEST_RESET_FAILED":
    case "RESET_SUCCESS":
    case "RESET_FAILED":
    case "LOGOUT_FAILED":
    case "DELETE_PROFILE_FAILED":
      break;
    case "CONFIRM_FAILED":
      errorMessage = "Error confirming your account!";
      if (action.payload.errors.confirmation_token.length>0) {
        errorMessage = "Confirmation token " + action.payload.errors.confirmation_token[0];
      }
      state = {
        ...state,
        errors: {
          ...state.errors,
          confirmation: errorMessage,
        }
      }
      break;

    default:
      break;
  }
  return state;
}
