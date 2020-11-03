import { cloneDeep } from 'lodash';

import {
  updateProject,
  updatePreferences,
  deleteProject,
} from '../../actions/frontend/before/projectActions';

import {
  createTaxonomy,
  updateTaxonomy,
  deleteTaxonomy,
  createTerm,
  updateTerm,
  linkTerm,
  unlinkTerm,
  deleteTerm,
} from '../../actions/frontend/before/termActions';

import {
  createGroups,
  updateGroup,
  updateGroups,
  deleteGroup,
  deleteGroups,
} from '../../actions/frontend/before/groupActions';

import {
  updateSide,
  updateSides,
  mapSides,
} from '../../actions/frontend/before/sideActions';

import {
  autoConjoinLeafs,
  createLeaves,
  updateLeaf,
  updateLeaves,
  deleteLeaf,
  deleteLeaves,
  generatePageNumbers,
  generateFolioNumbers,
} from '../../actions/frontend/before/leafActions';

import {
  linkImages,
  unlinkImages,
  deleteImages,
} from '../../actions/frontend/before/imageActions';

import {
  updateManifest,
  deleteManifest,
} from '../../actions/frontend/before/manifestActions';

const frontendBeforeActionsMiddleware = store => next => action => {
  if (action.type.includes('FRONTEND')) {
    if (
      action.payload.request.successMessage &&
      action.payload.request.successMessage !== '' &&
      !action.isUndo &&
      !action.isRedo
    ) {
      next({
        type: 'SHOW_NOTIFICATION',
        payload: action.payload.request.successMessage,
      });
      setTimeout(() => next({ type: 'HIDE_NOTIFICATION' }), 4000);
    }
  }
  switch (action.type) {
    // Project Actions
    case 'UPDATE_PROJECT_FRONTEND':
      action.payload.response = updateProject(
        action,
        cloneDeep(store.getState().dashboard)
      );
      break;
    case 'UPDATE_PREFERENCES_FRONTEND':
      action.payload.response = updatePreferences(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_PROJECT_FRONTEND':
      action.payload.response = deleteProject(
        action,
        cloneDeep(store.getState().dashboard)
      );
      break;
    // Taxonomy Actions
    case 'CREATE_TAXONOMY_FRONTEND':
      action.payload.response = createTaxonomy(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'UPDATE_TAXONOMY_FRONTEND':
      action.payload.response = updateTaxonomy(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_TAXONOMY_FRONTEND':
      action.payload.response = deleteTaxonomy(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    // Tern Actions
    case 'CREATE_TERM_FRONTEND':
      action.payload.response = createTerm(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'UPDATE_TERM_FRONTEND':
      action.payload.response = updateTerm(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'LINK_TERM_FRONTEND':
      action.payload.response = linkTerm(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'UNLINK_TERM_FRONTEND':
      action.payload.response = unlinkTerm(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_TERM_FRONTEND':
      action.payload.response = deleteTerm(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    // Group Actions
    case 'CREATE_GROUPS_FRONTEND':
      action.payload.response = createGroups(
        action,
        cloneDeep(store.getState().active)
      );
      setTimeout(() => next({ type: 'UNFLASH' }), 5000);
      break;
    case 'UPDATE_GROUP_FRONTEND':
      action.payload.response = updateGroup(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'UPDATE_GROUPS_FRONTEND':
      action.payload.response = updateGroups(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_GROUP_FRONTEND':
      const deletedGroupID = action.payload.request.url.split('/').pop();
      action.payload.response = deleteGroup(
        deletedGroupID,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_GROUPS_FRONTEND':
      const deletedGroupIDs = action.payload.request.data.groups;
      action.payload.response = deleteGroups(
        deletedGroupIDs,
        cloneDeep(store.getState().active)
      );
      break;
    // Leaf Actions
    case 'GENERATE_FOLIO_NUMBERS_FRONTEND':
      action.payload.response = generateFolioNumbers(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'GENERATE_PAGE_NUMBERS_FRONTEND':
      action.payload.response = generatePageNumbers(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'AUTOCONJOIN_LEAFS_FRONTEND':
      let leafIDsToAutoConjoin = action.payload.request.data.leafs;
      action.payload.response = autoConjoinLeafs(
        action,
        cloneDeep(store.getState().active),
        leafIDsToAutoConjoin
      );
      break;
    case 'CREATE_LEAVES_FRONTEND':
      action.payload.response = createLeaves(
        action,
        cloneDeep(store.getState().active)
      );
      setTimeout(() => next({ type: 'UNFLASH' }), 5000);
      break;
    case 'UPDATE_LEAF_FRONTEND':
      action.payload.response = updateLeaf(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'UPDATE_LEAVES_FRONTEND':
      action.payload.response = updateLeaves(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_LEAF_FRONTEND':
      const deletedLeafID = action.payload.request.url.split('/').pop();
      action.payload.response = deleteLeaf(
        deletedLeafID,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_LEAVES_FRONTEND':
      const deletedLeafIDs = action.payload.request.data.leafs;
      action.payload.response = deleteLeaves(
        deletedLeafIDs,
        cloneDeep(store.getState().active)
      );
      break;
    // Side Actions
    case 'UPDATE_SIDE_FRONTEND':
      action.payload.response = updateSide(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'UPDATE_SIDES_FRONTEND':
      action.payload.response = updateSides(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'MAP_SIDES_FRONTEND':
      action.payload.response = mapSides(
        action,
        cloneDeep(store.getState().active),
        cloneDeep(store.getState().dashboard)
      );
      break;
    // Image Actions
    case 'LINK_IMAGES_FRONTEND':
      action.payload.response = linkImages(
        action,
        cloneDeep(store.getState().dashboard),
        cloneDeep(store.getState().active)
      );
      break;
    case 'UNLINK_IMAGES_FRONTEND':
      action.payload.response = unlinkImages(
        action,
        cloneDeep(store.getState().dashboard),
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_IMAGES_FRONTEND':
      action.payload.response = deleteImages(
        action,
        cloneDeep(store.getState().dashboard),
        cloneDeep(store.getState().active)
      );
      break;
    // Manifest Actions
    case 'UPDATE_MANIFEST_FRONTEND':
      action.payload.response = updateManifest(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    case 'DELETE_MANIFEST_FRONTEND':
      action.payload.response = deleteManifest(
        action,
        cloneDeep(store.getState().active)
      );
      break;
    default:
      break;
  }
  next(action);
};

export default frontendBeforeActionsMiddleware;
