import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { autoRehydrate } from 'redux-persist'
import user from "../reducers/userReducer";
import dashboard from "../reducers/dashboardReducer";
import active from "../reducers/editCollationReducer";
import global from "../reducers/globalReducer";
import history from "../reducers/historyReducer";
import axiosMiddleware from 'redux-axios-middleware';
import { client, clientOptions } from './axiosConfig';
import frontendBeforeActionsMiddleware from './middleware/frontendBeforeActionsMiddleware';
import frontendAfterActionsMiddleware from './middleware/frontendAfterActionsMiddleware';
import undoRedoMiddleware from "./middleware/undoRedoMiddleware";

let storeEnhancers;
if (process.env.NODE_ENV === 'development') {
  storeEnhancers = compose(
    applyMiddleware(
      axiosMiddleware(client, clientOptions),
      undoRedoMiddleware,
      frontendBeforeActionsMiddleware,
      frontendAfterActionsMiddleware,
    ),
    autoRehydrate(),
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
} else {
  storeEnhancers = compose(
    applyMiddleware(
      axiosMiddleware(client, clientOptions),
      undoRedoMiddleware,
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
    global,
    history
  }),
  {},
  storeEnhancers
);

export default store;
