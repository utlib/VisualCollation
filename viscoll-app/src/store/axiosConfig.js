import axios from 'axios';

export let API_URL = '';

// IN DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  API_URL = 'http://localhost:3001';
}
export const client = axios.create({
  baseURL: API_URL,
  responseType: 'json',
});

export const clientOptions = {
  interceptors: {
    request: [
      ({ getState, dispatch, getSourceAction }, request) => {
        if (getState().user.token)
          request.headers['Authorization'] = getState().user.token;
        return request;
      },
    ],
    response: [
      {
        success: function ({ getState, dispatch, getSourceAction }, response) {
          if (getState().global.loading) {
            if (getState().global.loadingRequestCount > 0)
              dispatch({
                type: 'UPDATE_LOADING_COUNT',
                payload: getState().global.loadingRequestCount - 1,
              });
            if (getState().global.loadingRequestCount <= 1)
              dispatch({ type: 'HIDE_LOADING' });
          }
          return Promise.resolve(response.data);
        },
        error: function ({ getState, dispatch, getSourceAction }, error) {
          if (getState().global.loading) dispatch({ type: 'HIDE_LOADING' });
          if (error.config.errorMessage) {
            dispatch({
              type: 'SHOW_NOTIFICATION',
              payload: error.config.errorMessage,
            });
            setTimeout(() => dispatch({ type: 'HIDE_NOTIFICATION' }), 4000);
          }
          if (
            error.response &&
            (error.response.status === 401 || error.response.status !== 422)
          ) {
            dispatch({ type: 'BACKEND_SERVER_ERROR' });
          }
          return Promise.reject(error);
        },
      },
    ],
  },
};
