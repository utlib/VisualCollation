import { initialState } from './initialStates/user';

export default function userReducer(state=initialState, action) {
  try {
    if (action.error) {
      if (action.error.status===0) return initialState;
      action = {type: action.type, payload: action.error.response.data}
    }
  } catch (e) {}
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
      state = {
        ...state,
        errors: {
          ...state.errors,
          login: {
            errorMessage: action.payload.errors.session
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
    case "REQUEST_RESET_SUCCESS":
    case "REQUEST_RESET_FAILED":
    case "RESET_SUCCESS":
    case "RESET_FAILED":
    case "LOGOUT_FAILED":
    case "DELETE_PROFILE_FAILED":
      break;
    case "CONFIRM_FAILED":
      let errorMessage = "Error confirming your account!";
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
