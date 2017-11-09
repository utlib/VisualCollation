import userReducer from '../../src/reducers/userReducer';
import { initialState } from '../../src/reducers/initialStates/user';


const authenticatedState = {
  authenticated: true,
  token: "secretToken",
  id: "userID",
  name: "user",
  email: "user@mail.com",
  errors: {
    login: {errorMessage: ""},
    register: {email: "", password: ""},
    update: {password: "", current_password: "", email: ""},
    confirmation: "",
  }
}


describe('>>>R E D U C E R --- Test userReducer',()=>{
  it('+++ reducer for LOGIN_SUCCESS', () => {
      let state = initialState
      state = userReducer(
        state, 
        {
          type: "LOGIN_SUCCESS",
          payload: {
            session: {
              jwt: "secretToken",
              id: "userID",
              name: "user",
              email: "user@mail.com",
              lastLoggedIn: "2017-07-12T16:44:31.756Z"
            }
          }
        }
      )
      expect(state).toEqual({
        ...state,
        authenticated: true,
        token: "secretToken",
        id: "userID",
        name: "user",
        email: "user@mail.com",
        lastLoggedIn: "2017-07-12T16:44:31.756Z"
      })
  });

  it('+++ reducer for LOGIN_FAILED', () => {
      let state = initialState
      state = userReducer(
        state, 
        {
          type: "LOGIN_FAILED",
          payload: {
            errors: {
              session: ["invalid email / password"]
            }
          }
        }
      )
      expect(state).toEqual({
        ...state,
        errors: {
          ...state.errors,
          login: {
            errorMessage: ["invalid email / password"]
          },
        }
      })
  });

  it('+++ reducer for REGISTER_SUCCESS', () => {
      let state = initialState
      state = userReducer(
        state, 
        {
          type: "REGISTER_SUCCESS"
        }
      )
      expect(state).toEqual({
        ...state,
        registerSuccess: true
      })
  });

  it('+++ reducer for REGISTER_FAILED', () => {
      let state = initialState
      state = userReducer(
        state, 
        {
          type: "REGISTER_FAILED",
          payload: {
            errors: {
              email: ["is already taken"],
              password: ["can't be blank"]
            }
          }
        }
      )
      expect(state).toEqual({
        ...state,
        errors: {
          ...state.errors,
          register: {
            email: ["is already taken"],
            password: ["can't be blank"]
          }
        }
      })
  });

  it('+++ reducer for CONFIRM_SUCCESS', () => {
      let state = authenticatedState
      state = userReducer(state, {type: "CONFIRM_SUCCESS"})
      expect(state).toEqual({...authenticatedState})
  });

  it('+++ reducer for CONFIRM_FAILED', () => {
      let state = authenticatedState
      state = userReducer(state, {
        type: "CONFIRM_FAILED", 
        payload: { errors: { confirmation_token: ["is expired"] } },
      })
      expect(state).toEqual({
        ...authenticatedState, 
        errors: {
          ...authenticatedState.errors, 
          confirmation: "Confirmation token is expired"
        }
      })
  });

  it('+++ reducer for RESET_SUCCESS', () => {
      let state = authenticatedState
      state = userReducer(state, {type: "RESET_SUCCESS"})
      expect(state).toEqual({...authenticatedState})
  });

  it('+++ reducer for RESET_FAILED', () => {
      let state = authenticatedState
      state = userReducer(state, {type: "RESET_FAILED"})
      expect(state).toEqual({...authenticatedState})
  });

  it('+++ reducer for LOGOUT_SUCCESS', () => {
      let state = authenticatedState
      state = userReducer(state, {type: "LOGOUT_SUCCESS"})
      expect(state).toEqual({...initialState})
  });

  it('+++ reducer for LOGOUT_FAILED', () => {
      let state = authenticatedState
      state = userReducer(state, {type: "LOGOUT_FAILED"})
      expect(state).toEqual({...authenticatedState})
  });

  it('+++ reducer for UPDATE_PROFILE_SUCCESS', () => {
      let state = authenticatedState
      let action = {
        type: "UPDATE_PROFILE_SUCCESS",
        payload: {user: {id: 1, name: "batman"}, errors: "errors"}
      };
      state = userReducer(state, action)
      expect(state).toEqual({
        ...authenticatedState,
        errors: initialState.errors,
        ...action.payload
      })
  });

  it('+++ reducer for UPDATE_PROFILE_FAILED', () => {
      let state = authenticatedState
      let action = {
        type: "UPDATE_PROFILE_FAILED",
        payload: {user: {id: 1, name: "batman"}, errors: "errors"}
      };
      state = userReducer(state, action)
      expect(state).toEqual({
        ...authenticatedState,
        errors: {
          ...state.errors,
          update: {...state.errors.update, ...action.payload}
        }
      })
  });

  it('+++ reducer for persist/REHYDRATE', () => {
    let action = {
      type: "persist/REHYDRATE",
      payload: {user: {id: 1, name: "batman"}, errors: "errors"}
    };
    let state = userReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      ...action.payload.user, 
      errors: initialState.errors
    });
  });

  it('+++ reducer for axios error config', () => {
    let action = {
      type: "RESET_FAILED",
      error: "some error"
    };
    let state = userReducer(initialState, action);
    expect(state).toEqual(initialState)
  });

  it('+++ reducer for DEFAULT CASE', () => {
    let action = {
      type: "SOMETHING ELSE"
    };
    let state = userReducer(initialState, action);
    expect(state).toEqual({
      ...initialState
    })
  });
  
});
