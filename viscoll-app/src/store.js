import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import {autoRehydrate} from 'redux-persist'
import user from "./reducers/userReducer";
import projects from "./reducers/projectReducer";
import active from "./reducers/editCollationReducer";
import global from "./reducers/globalReducer";
import axiosMiddleware from 'redux-axios-middleware';
import { client, clientOptions } from './axiosConfig';

let storeEnhancers;
if (process.env.NODE_ENV === 'development'){
  storeEnhancers =  compose(
                      applyMiddleware(
                        axiosMiddleware(client, clientOptions)
                      ),
                      autoRehydrate(),
                      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
                    )
} else {
  storeEnhancers =  compose(
                      applyMiddleware(
                        axiosMiddleware(client, clientOptions)
                      ),
                      autoRehydrate()                    
                    )
}

const store = createStore(
  combineReducers({
    user,
    projects,
    active,
    global
  }),
  {},
  storeEnhancers
);

export default store;
