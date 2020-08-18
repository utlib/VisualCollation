import { initialState } from './initialStates/active';
import { cloneDeep } from 'lodash';

export default function editCollationReducer(state = initialState, action) {
  try {
    if (action.error) {
      action = { type: action.type, payload: action.error.response.data };
    }
  } catch (e) {}

  if (
    !action.type.includes('FRONTEND') &&
    action.type !== 'UPLOAD_IMAGES_SUCCESS_BACKEND'
  )
    state = cloneDeep(state);
  switch (action.type) {
    // MODIFICATIONS
    case 'LOAD_PROJECT_SUCCESS':
      state.project = action.payload.active;
      break;
    case 'LOAD_PROJECT_VIEW_ONLY_SUCCESS':
      state.project = {
        ...action.payload.project,
        ...action.payload,
        Groups: action.payload.groups,
        Leafs: action.payload.leafs,
        Rectos: action.payload.rectos,
        Versos: action.payload.versos,
        Notes: action.payload.notes,
      };
      break;
    case 'CREATE_MANIFEST_SUCCESS':
      state.project = action.payload.active;
      state.imageManager.manageSources.error = '';
      break;
    case 'CREATE_MANIFEST_FAILED':
      state.imageManager.manageSources.error = action.payload.errors;
      break;
    case 'CANCEL_CREATE_MANIFEST_FRONTEND':
      state.imageManager.manageSources.error = '';
      break;
    case 'TOGGLE_VISUALIZATION_DRAWING':
      state.collationManager.visualizations[action.payload.type] =
        action.payload.value;
      break;
    case 'LOGOUT_SUCCESS':
    case 'DELETE_PROFILE_SUCCESS':
    case 'LOAD_PROJECTS_SUCCESS':
      state = initialState;
      break;
    case 'LOAD_PROJECT_FAILED':
    case 'UPLOAD_IMAGES_FAILED':
    case 'FILTER_PROJECT_FAILED':
    case 'EXPORT_FAILED':
      break;
    case 'HIDE_PROJECT_TIP':
      state.project.preferences.showTips = false;
      break;
    case 'CHANGE_VIEW_MODE':
      state.collationManager.viewMode = action.payload;
      break;
    case 'CHANGE_MANAGER_MODE':
      state.managerMode = action.payload;
      break;
    case 'CHANGE_NOTES_TAB':
      state.notesManager.activeTab = action.payload;
      break;
    case 'CHANGE_IMAGES_TAB':
      state.imageManager.activeTab = action.payload;
      break;
    case 'TOGGLE_FILTER_PANEL':
      state.collationManager.filters.filterPanelOpen = action.payload;
      break;
    case 'TOGGLE_SELECTED_OBJECTS':
    case 'UPDATE_CURRENT_SELECTED_OBJECTS':
      state.collationManager.selectedObjects = action.payload;
      break;
    case 'FILTER_PROJECT_SUCCESS':
      state.collationManager.filters = {
        ...state.collationManager.filters,
        ...action.payload,
        active: true,
      };
      state.project.preferences = {
        group: { ...action.payload.visibleAttributes.group },
        leaf: { ...action.payload.visibleAttributes.leaf },
        side: { ...action.payload.visibleAttributes.side },
      };
      delete state.collationManager.filters['visibleAttributes'];
      break;
    case 'RESET_FILTERS':
      state.collationManager.filters = {
        ...initialState.collationManager.filters,
        filterPanelOpen: true,
        queries: action.payload,
      };
      break;
    case 'TOGGLE_FILTER_DISPLAY':
      state.collationManager.filters.hideOthers = !state.collationManager
        .filters.hideOthers;
      break;
    case 'UPDATE_FILTER_QUERY':
      state.collationManager.filters.queries = action.payload;
      break;
    case 'UPDATE_FILTER_SELECTION':
      state.collationManager.filters.selection = action.payload.selection;
      state.collationManager.filters.hideOthers = false;
      state.collationManager.selectedObjects = action.payload.selectedObjects;
      break;
    case 'UNFLASH':
      state.collationManager.flashItems.groups = [];
      state.collationManager.flashItems.leaves = [];
      break;
    case 'EXPORT_SUCCESS':
      state.exportedData =
        action.payload.type === 'xml'
          ? action.payload.data
          : JSON.stringify(action.payload.Export, null, 4);
      state.exportedImages = action.payload.Images.exportedImages;
      break;

    // FRONT-END ACTIONS
    case 'CREATE_NOTETYPE_FRONTEND':
    case 'UPDATE_NOTETYPE_FRONTEND':
    case 'DELETE_NOTETYPE_FRONTEND':
    case 'UPDATE_NOTE_FRONTEND':
    case 'DELETE_NOTE_FRONTEND':
    case 'LINK_NOTE_FRONTEND':
    case 'UNLINK_NOTE_FRONTEND':
    case 'AUTOCONJOIN_LEAFS_FRONTEND':
    case 'CREATE_GROUPS_FRONTEND':
    case 'UPDATE_GROUP_FRONTEND':
    case 'UPDATE_GROUPS_FRONTEND':
    case 'DELETE_GROUP_FRONTEND':
    case 'DELETE_GROUPS_FRONTEND':
    case 'CREATE_LEAVES_FRONTEND':
    case 'UPDATE_LEAF_FRONTEND':
    case 'UPDATE_LEAVES_FRONTEND':
    case 'DELETE_LEAF_FRONTEND':
    case 'DELETE_LEAVES_FRONTEND':
    case 'UPDATE_SIDE_FRONTEND':
    case 'UPDATE_SIDES_FRONTEND':
    case 'UPDATE_MANIFEST_FRONTEND':
    case 'DELETE_MANIFEST_FRONTEND':
    case 'CREATE_NOTE_FRONTEND':
    case 'GENERATE_FOLIO_NUMBERS_FRONTEND':
    case 'GENERATE_PAGE_NUMBERS_FRONTEND':
      state = action.payload.response;
      break;
    case 'UPDATE_PREFERENCES_FRONTEND':
      const showTips =
        action.payload.response.project.preferences.showTips !== undefined
          ? action.payload.response.project.preferences.showTips
          : state.project.preferences.showTips;
      state.project.preferences = {
        showTips,
        group: {
          ...state.project.preferences.group,
          ...action.payload.response.project.preferences.group,
        },
        leaf: {
          ...state.project.preferences.leaf,
          ...action.payload.response.project.preferences.leaf,
        },
        side: {
          ...state.project.preferences.side,
          ...action.payload.response.project.preferences.side,
        },
      };
      break;
    case 'LINK_IMAGES_FRONTEND':
    case 'UNLINK_IMAGES_FRONTEND':
    case 'DELETE_IMAGES_FRONTEND':
    case 'MAP_SIDES_FRONTEND':
    case 'UPLOAD_IMAGES_SUCCESS_BACKEND':
      state = action.payload.response.active;
      break;
    default:
      break;
  }
  return state;
}
