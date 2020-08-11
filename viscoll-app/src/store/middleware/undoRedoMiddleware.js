import { cloneDeep } from 'lodash';

import {
  undoCreateLeaves,
  undoUpdateLeaf,
  undoUpdateLeaves,
  undoDeleteLeaf,
  undoDeleteLeaves,
  undoAutoconjoin,
  undoFolioNumbers,
  undoPageNumbers,
} from '../../actions/undoRedo/leafHelper';

import {
  undoUpdateGroups,
  undoUpdateGroup,
  undoCreateGroups,
  undoDeleteGroup,
  undoDeleteGroups,
} from '../../actions/undoRedo/groupHelper';

import {
  undoUpdateSide,
  undoUpdateSides,
} from '../../actions/undoRedo/sideHelper';

import {
  undoLinkImages,
  undoUnlinkImages,
} from '../../actions/undoRedo/imageHelper';

import {
  undoUpdateManifest,
  undoDeleteManifest,
} from '../../actions/undoRedo/manifestHelper';

import {
  undoCreateNoteType,
  undoUpdateNoteType,
  undoDeleteNoteType,
  undoLinkNote,
  undoUnlinkNote,
  undoDeleteNote,
} from '../../actions/undoRedo/noteHelper';

const undoRedoMiddleware = store => next => action => {
  async function sequentialDispatch(requests) {
    if (requests[0].types[0].includes('DELETE')) {
      // Only dispatch the first request (a delete request)
      // since subsequent requests will be invalid due to the first request
      store.dispatch(requests[0]);
    } else {
      if (requests.length > 1) {
        // Add loading screen if there are multiple requests
        requests.splice(0, 0, {
          type: 'UPDATE_LOADING_COUNT',
          payload: requests.length,
        });
        requests.splice(0, 0, { type: 'SHOW_LOADING' });
      }
      for (const request of requests) {
        await store.dispatch(request);
      }
    }
  }
  let historyAction = '';
  const d = new Date();
  const id = d.getTime();
  switch (action.type) {
    case 'UNDO':
      let newUndoStack = cloneDeep(store.getState().history.undo);
      let undoActionList = newUndoStack.pop();
      action.payload = newUndoStack;
      if (undoActionList) {
        undoActionList = undoActionList.map(request => {
          request.isUndo = true;
          request.urID = id;
          return request;
        });
        sequentialDispatch(undoActionList);
      }
      break;
    case 'REDO':
      let newRedoStack = cloneDeep(store.getState().history.redo);
      let redoActionList = newRedoStack.pop();
      action.payload = newRedoStack;
      if (redoActionList) {
        redoActionList = redoActionList.map(request => {
          request.isRedo = true;
          request.urID = id;
          return request;
        });
        sequentialDispatch(redoActionList);
      }
      break;
    case 'UPDATE_LEAF_FRONTEND':
      historyAction = undoUpdateLeaf(action, store.getState().active);
      break;
    case 'UPDATE_LEAVES_FRONTEND':
      historyAction = undoUpdateLeaves(action, store.getState().active);
      break;
    case 'DELETE_LEAF_FRONTEND':
      historyAction = undoDeleteLeaf(action, store.getState().active);
      break;
    case 'DELETE_LEAVES_FRONTEND':
      historyAction = undoDeleteLeaves(action, store.getState().active);
      break;
    case 'CREATE_LEAVES_FRONTEND':
      historyAction = undoCreateLeaves(action, store.getState().active);
      break;
    case 'AUTOCONJOIN_LEAFS_FRONTEND':
      historyAction = undoAutoconjoin(action, store.getState().active);
      break;
    case 'GENERATE_FOLIO_NUMBERS_FRONTEND':
      historyAction = undoFolioNumbers(action, store.getState().active);
      break;
    case 'GENERATE_PAGE_NUMBERS_FRONTEND':
      historyAction = undoPageNumbers(action, store.getState().active);
      break;
    case 'UPDATE_GROUPS_FRONTEND':
      historyAction = undoUpdateGroups(action, store.getState().active);
      break;
    case 'UPDATE_GROUP_FRONTEND':
      historyAction = undoUpdateGroup(action, store.getState().active);
      break;
    case 'CREATE_GROUPS_FRONTEND':
      historyAction = undoCreateGroups(action, store.getState().active);
      break;
    case 'DELETE_GROUP_FRONTEND':
      historyAction = undoDeleteGroup(action, store.getState().active);
      break;
    case 'DELETE_GROUPS_FRONTEND':
      historyAction = undoDeleteGroups(action, store.getState().active);
      break;
    case 'UPDATE_SIDE_FRONTEND':
      historyAction = undoUpdateSide(action, store.getState().active);
      break;
    case 'UPDATE_SIDES_FRONTEND':
      historyAction = undoUpdateSides(action, store.getState().active);
      break;
    case 'MAP_SIDES_FRONTEND':
      historyAction = undoUpdateSides(action, store.getState().active);
      break;
    case 'LINK_IMAGES_FRONTEND':
      historyAction = undoLinkImages(action);
      break;
    case 'UNLINK_IMAGES_FRONTEND':
      historyAction = undoUnlinkImages(action);
      break;
    case 'UPDATE_MANIFEST_FRONTEND':
      historyAction = undoUpdateManifest(action, store.getState().active);
      break;
    case 'DELETE_MANIFEST_FRONTEND':
      historyAction = undoDeleteManifest(action, store.getState().active);
      break;
    case 'UPDATE_NOTETYPE_FRONTEND':
      historyAction = undoUpdateNoteType(action, store.getState().active);
      break;
    case 'CREATE_NOTETYPE_FRONTEND':
      historyAction = undoCreateNoteType(action, store.getState().active);
      break;
    case 'DELETE_NOTETYPE_FRONTEND':
      historyAction = undoDeleteNoteType(action, store.getState().active);
      break;
    case 'LINK_NOTE_FRONTEND':
      historyAction = undoLinkNote(action, store.getState().active);
      break;
    case 'UNLINK_NOTE_FRONTEND':
      historyAction = undoUnlinkNote(action, store.getState().active);
      break;
    case 'DELETE_NOTE_FRONTEND':
      historyAction = undoDeleteNote(action, store.getState().active);
      break;
    default:
      break;
  }
  if (action.isUndoable) {
    let updatedStack;
    if (action.isUndo) {
      // Grab redo stack and add new action
      updatedStack = cloneDeep(store.getState().history.redo);
      if (updatedStack.length > 0) {
        let lastRedoGroup = updatedStack[updatedStack.length - 1];
        if (action.urID && lastRedoGroup[0].urID === action.urID) {
          let updatedGroup = updatedStack.pop();
          updatedStack.push(updatedGroup.concat(historyAction));
        } else {
          historyAction = historyAction.map(request => {
            request.urID = action.urID;
            return request;
          });
          updatedStack.push(historyAction);
        }
      } else {
        historyAction = historyAction.map(request => {
          request.urID = action.urID;
          return request;
        });
        updatedStack.push(historyAction);
      }
    } else {
      // Action is normal or a redo
      // Grab undo stack and add new action
      updatedStack = cloneDeep(store.getState().history.undo);
      if (updatedStack.length > 0) {
        let lastUndoGroup = updatedStack[updatedStack.length - 1];
        if (action.urID && lastUndoGroup[0].urID === action.urID) {
          let updatedGroup = updatedStack.pop();
          updatedStack.push(updatedGroup.concat(historyAction));
        } else {
          historyAction = historyAction.map(request => {
            request.urID = action.urID;
            return request;
          });
          updatedStack.push(historyAction);
        }
      } else {
        historyAction = historyAction.map(request => {
          request.urID = action.urID;
          return request;
        });
        updatedStack.push(historyAction);
      }
    }
    // Cut stack to only have 10 history actions
    let cutCount = 0;
    if (updatedStack.length > 10) {
      cutCount = updatedStack.length - 10;
    }
    updatedStack.splice(0, cutCount);
    if (action.isUndo) {
      next({ type: 'PUSH_REDO', payload: updatedStack });
    } else {
      next({ type: 'PUSH_UNDO', payload: updatedStack });
    }
  }
  next(action);
};

export default undoRedoMiddleware;
