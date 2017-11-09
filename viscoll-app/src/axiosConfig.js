import axios from "axios";

let API_URL = '/api';

// IN DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  API_URL = 'http://localhost:3001';
}
export const client = axios.create({ 
  baseURL: API_URL,
  responseType: 'json'
});

export const clientOptions = {
  interceptors: {
    request: [
      ({getState, dispatch, getSourceAction}, request) => {
        if (getState().user.token) {
          request.headers['Authorization'] = getState().user.token
        }
        return request;
      }
    ],
    response: [{
      success: function ({getState, dispatch, getSourceAction}, response) {
        dispatch({ type: "HIDE_LOADING" });
        if (response.config.successMessage){
          dispatch({ 
            type: "SHOW_NOTIFICATION",
            payload: response.config.successMessage
          }); 
          setTimeout(()=>dispatch({type: "HIDE_NOTIFICATION"}), 4000);
        }
         return Promise.resolve(response.data);
      },
      error: function ({getState, dispatch, getSourceAction}, error) {
        dispatch({ type: "HIDE_LOADING" });
        if (error.config.errorMessage) {
          dispatch({ 
            type: "SHOW_NOTIFICATION",
            payload: error.config.errorMessage
          }); 
          setTimeout(()=>dispatch({type: "HIDE_NOTIFICATION"}), 4000); 
        }
        return Promise.reject(error);
      }
    }]
  }
}
