import { initialState } from './initialStates/history';

export default function historyReducer(state=initialState, action) {
  switch(action.type) {
    case "UNDO":
    case "PUSH_UNDO":
      state.undo = action.payload;
      break;
    case "REDO":
    case "PUSH_REDO": 
      state.redo = action.payload;
      break;
    case "CLEAR_ACTION_HISTORY":
      state.undo = [];
      state.redo = [];
      break;
    default:
      break;
  }
  return state;
}