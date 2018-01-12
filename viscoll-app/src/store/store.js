import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { autoRehydrate } from 'redux-persist'
import user from "../reducers/userReducer";
import dashboard from "../reducers/dashboardReducer";
import active from "../reducers/editCollationReducer";
import global from "../reducers/globalReducer";
import axiosMiddleware from 'redux-axios-middleware';
import { client, clientOptions } from './axiosConfig';
import frontendBeforeActionsMiddleware from './middleware/frontendBeforeActionsMiddleware';
import frontendAfterActionsMiddleware from './middleware/frontendAfterActionsMiddleware';

let storeEnhancers;
if (process.env.NODE_ENV === 'development') {
  storeEnhancers = compose(
    applyMiddleware(
      axiosMiddleware(client, clientOptions),
      frontendBeforeActionsMiddleware,
      frontendAfterActionsMiddleware,
    ),
    autoRehydrate(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
} else {
  storeEnhancers = compose(
    applyMiddleware(
      axiosMiddleware(client, clientOptions),
      frontendBeforeActionsMiddleware,
      frontendAfterActionsMiddleware,
    ),
    autoRehydrate()
  )
}

const store = createStore(
  combineReducers({
    user,
    dashboard,
    active,
    global
  }),
  {},
  storeEnhancers
);

export default store;
