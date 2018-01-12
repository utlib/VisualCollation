import {cloneDeep} from 'lodash';

import {
  updateProject,
  deleteProject
} from '../frontendBeforeActions/projectActions';

import {
  createNoteType,
  updateNoteType,
  deleteNoteType,
  createNote,
  updateNote,
  linkNote,
  unlinkNote,
  deleteNote
} from '../frontendBeforeActions/noteActions';

import {
  createGroups,
  updateGroup,
  updateGroups,
  deleteGroup,
  deleteGroups
} from '../frontendBeforeActions/groupActions';

import {
  updateSide,
  updateSides,
  mapSides,
  generateFolioNumbers
} from '../frontendBeforeActions/sideActions';

import {
  autoConjoinLeafs,
  createLeaves,
  updateLeaf,
  updateLeaves,
  deleteLeaf,
  deleteLeaves,
} from '../frontendBeforeActions/leafActions';

import {
  linkImages,
  unlinkImages,
  deleteImages
} from '../frontendBeforeActions/imageActions';

import {
  updateManifest,
  deleteManifest
} from '../frontendBeforeActions/manifestActions';


const frontendBeforeActionsMiddleware = store => next => action => {
  if (action.type.includes("FRONTEND")){
    if (action.payload.request.successMessage && action.payload.request.successMessage!==""){
      next({ type: "SHOW_NOTIFICATION", payload: action.payload.request.successMessage });
      setTimeout(()=>next({type: "HIDE_NOTIFICATION"}), 4000);
    }
  }
  switch(action.type) {
    // Project Actions
    case "UPDATE_PROJECT_FRONTEND":
      action.payload = updateProject(action, cloneDeep(store.getState().dashboard))
      break;
    case "DELETE_PROJECT_FRONTEND":
      action.payload = deleteProject(action, cloneDeep(store.getState().dashboard))
      break;
    // NoteType Actions
    case "CREATE_NOTETYPE_FRONTEND":
      action.payload = createNoteType(action, cloneDeep(store.getState().active))
      break;
    case "UPDATE_NOTETYPE_FRONTEND":
      action.payload = updateNoteType(action, cloneDeep(store.getState().active))
      break;
    case "DELETE_NOTETYPE_FRONTEND":
      action.payload = deleteNoteType(action, cloneDeep(store.getState().active))
      break;
    // Note Actions
    case "CREATE_NOTE_FRONTEND":
      action.payload = createNote(action, cloneDeep(store.getState().active))
      break;
    case "UPDATE_NOTE_FRONTEND":
      action.payload = updateNote(action, cloneDeep(store.getState().active))
      break;
    case "LINK_NOTE_FRONTEND":
      action.payload = linkNote(action, cloneDeep(store.getState().active))
      break;
    case "UNLINK_NOTE_FRONTEND":
      action.payload = unlinkNote(action, cloneDeep(store.getState().active))
      break;
    case "DELETE_NOTE_FRONTEND":
      action.payload = deleteNote(action, cloneDeep(store.getState().active))
      break;
    // Group Actions
    case "CREATE_GROUPS_FRONTEND":
      action.payload = createGroups(action, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      setTimeout(()=>next({type: "UNFLASH"}), 5000)
      break;
    case "UPDATE_GROUP_FRONTEND":
      action.payload = updateGroup(action, cloneDeep(store.getState().active))
      break;
    case "UPDATE_GROUPS_FRONTEND":
      action.payload = updateGroups(action, cloneDeep(store.getState().active))
      break;
    case "DELETE_GROUP_FRONTEND":
      const deletedGroupID = action.payload.request.url.split("/").pop()
      action.payload = deleteGroup(deletedGroupID, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    case "DELETE_GROUPS_FRONTEND":
      const deletedGroupIDs = action.payload.request.data.groups
      action.payload = deleteGroups(deletedGroupIDs, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    // Leaf Actions
    case "AUTOCONJOIN_LEAFS_FRONTEND":
      let leafIDsToAutoConjoin = action.payload.request.data.leafs
      action.payload = autoConjoinLeafs(action, cloneDeep(store.getState().active), leafIDsToAutoConjoin)
      break;
    case "CREATE_LEAVES_FRONTEND":
      action.payload = createLeaves(action, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      setTimeout(()=>next({type: "UNFLASH"}), 5000)
      break;
    case "UPDATE_LEAF_FRONTEND":
      action.payload = updateLeaf(action, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    case "UPDATE_LEAVES_FRONTEND":
      action.payload = updateLeaves(action, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    case "DELETE_LEAF_FRONTEND":
      const deletedLeafID = action.payload.request.url.split("/").pop()
      action.payload = deleteLeaf(deletedLeafID, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    case "DELETE_LEAVES_FRONTEND":
      const deletedLeafIDs = action.payload.request.data.leafs
      action.payload = deleteLeaves(deletedLeafIDs, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    // Side Actions
    case "UPDATE_SIDE_FRONTEND":
      action.payload = updateSide(action, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    case "UPDATE_SIDES_FRONTEND":
      action.payload = updateSides(action, cloneDeep(store.getState().active))
      generateFolioNumbers(action.payload)
      break;
    case "MAP_SIDES_FRONTEND":
      action.payload = mapSides(action, cloneDeep(store.getState().active), cloneDeep(store.getState().dashboard))
      break;
    // Image Actions
    case "LINK_IMAGES_FRONTEND":
      action.payload = linkImages(action, cloneDeep(store.getState().dashboard), cloneDeep(store.getState().active))
      break;
    case "UNLINK_IMAGES_FRONTEND":
      action.payload = unlinkImages(action, cloneDeep(store.getState().dashboard), cloneDeep(store.getState().active))
      break;
    case "DELETE_IMAGES_FRONTEND":
      action.payload = deleteImages(action, cloneDeep(store.getState().dashboard), cloneDeep(store.getState().active))
      break;
    // Manifest Actions
    case "UPDATE_MANIFEST_FRONTEND":
      action.payload = updateManifest(action, cloneDeep(store.getState().active))
      break;
    case "DELETE_MANIFEST_FRONTEND":
      action.payload = deleteManifest(action, cloneDeep(store.getState().active))
      break;
    default:
      break;
  }
  next(action);
}


export default frontendBeforeActionsMiddleware;