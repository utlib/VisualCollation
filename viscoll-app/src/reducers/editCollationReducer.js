import { initialState } from './initialStates/active';

export default function editCollationReducer(state=initialState, action) {
  try {
    if (action.error) {
      if (action.error.status===0) return initialState;
      action = {type: action.type, payload: action.error.response.data} 
    }
  } catch (e) { }
  switch(action.type) {
    // MODIFICATIONS
    case "LOAD_PROJECT_SUCCESS":
    case "ADD_LEAF(S)_SUCCESS":
    case "ADD_GROUP(S)_SUCCESS":
    case "UPDATE_GROUP_SUCCESS":
    case "UPDATE_GROUPS_SUCCESS":
    case "UPDATE_LEAF_SUCCESS":
    case "UPDATE_LEAFS_SUCCESS":
    case "UPDATE_SIDE_SUCCESS":
    case "UPDATE_SIDES_SUCCESS":
    case "CREATE_NOTE_SUCCESS":
    case "UPDATE_NOTE_SUCCESS":
    case "DELETE_NOTE_SUCCESS":
    case "LINK_NOTE_SUCCESS":
    case "UNLINK_NOTE_SUCCESS":
    case "CREATE_NOTETYPE_SUCCESS":
    case "UPDATE_NOTETYPE_SUCCESS":
    case "DELETE_NOTETYPE_SUCCESS":
    case "UPDATE_MANIFEST_SUCCESS":
    case "DELETE_MANIFEST_SUCCESS":
    case "MAP_SIDES_SUCCESS":
      state = {
        ...state,
        project: action.payload
      };
      break;
    case "CREATE_MANIFEST_SUCCESS":
      state = {
        ...state, 
        project: action.payload,
        imageManager: {
          ...state.imageManager,
          manageSources: {
            ...state.imageManager.manageSources,
            error: ""
          }
        }
      }
      break;
    case "DELETE_LEAF_SUCCESS":
    case "DELETE_LEAFS_SUCCESS":
    case "DELETE_GROUP_SUCCESS":
    case "DELETE_GROUPS_SUCCESS":
      state = {
        ...state,
        project: action.payload,
        collationManager: {
          ...state.collationManager, 
          selectedObjects: initialState.collationManager.selectedObjects
        }
      };
      break;
    case "TOGGLE_TACKET": 
      state = {
        ...state,
        collationManager: {
          ...state.collationManager,
          visualizations: {
            ...state.collationManager.visualizations,
            tacketing: action.payload,
          }
        }
      }
      break;
    case "CREATE_MANIFEST_FAILED":
      state = {
        ...state,
         imageManager: {
          ...state.imageManager,
          manageSources: {
            ...state.imageManager.manageSources,
            error: action.payload.errors
          }
        }
      }
      break;
    case "CANCEL_CREATE_MANIFEST":
      state = {
        ...state,
         imageManager: {
          ...state.imageManager,
          manageSources: {
            ...state.imageManager.manageSources,
            error: ""
          }
        }
      }
      break;
    case "LOGOUT_SUCCESS":
    case "DELETE_PROFILE_SUCCESS":
    case "LOAD_PROJECTS_SUCCESS":
      state = initialState;
      break;
    case "LOAD_PROJECT_FAILED":
    case "LOAD_NOTES_FAILED":
    case "UPDATE_GROUP_FAILED":
    case "UPDATE_GROUPS_FAILED":
    case "UPDATE_SIDE_FAILED":
    case "UPDATE_SIDES_FAILED":
    case "UPDATE_LEAF_FAILED":
    case "UPDATE_LEAFS_FAILED":
    case "ADD_LEAF(S)_FAILED":
    case "ADD_GROUP(S)_FAILED":
    case "DELETE_LEAF_FAILED":
    case "DELETE_LEAFS_FAILED":
    case "DELETE_GROUP_FAILED":
    case "DELETE_GROUPS_FAILED":
    case "DELETE_NOTE_FAILED":
    case "FILTER_PROJECT_FAILED":
    case "UPDATE_FILTER_QUERY_FAILED":
    case "UPDATE_FILTER_SELECTION_FAILED":
    case "CREATE_NOTE_FAILED":
    case "UPDATE_NOTE_FAILED":
    case "CREATE_NOTETYPE_FAILED":
    case "UPDATE_NOTETYPE_FAILED":
    case "DELETE_NOTETYPE_FAILED":
    case "EXPORT_FAILED":
    case "UPDATE_MANIFEST_FAILED":
    case "DELETE_MANIFEST_FAILED":
    case "MAP_SIDES_FAILED":
      break;

    // INTERACTIONS
    case "persist/REHYDRATE":
      state = {...state, ...action.payload.active}
      break;
    case "CHANGE_VIEW_MODE":
      state = {
        ...state, 
        collationManager: {
          ...state.collationManager,
          viewMode: action.payload 
        }
      }
      break;
    case "CHANGE_MANAGER_MODE":
      state = {...state, managerMode: action.payload }
      break;
    case "CHANGE_NOTES_TAB":
      state = {
        ...state, 
        notesManager: {
          ...state.notesManager,
          activeTab: action.payload 
        }
      }
      break;
    case "CHANGE_IMAGES_TAB":
      state = {
        ...state, 
        imageManager: {
          ...state.imageManager,
          activeTab: action.payload 
        }
      }
      break;
    case "TOGGLE_FILTER_PANEL":
      state = {
        ...state, 
        collationManager: {
          ...state.collationManager,
          filters: {
            ...state.collationManager.filters, 
            filterPanelOpen: action.payload
          }
        }
      }
      break;
    case "TOGGLE_SELECTED_OBJECTS":
    case "UPDATE_CURRENT_SELECTED_OBJECTS":
    state = {
        ...state,
        collationManager: {
          ...state.collationManager, 
          selectedObjects: action.payload
        }
      }
      break;
    case "TOGGLE_VISIBILITY":
      state = {
        ...state,
        collationManager: {
          ...state.collationManager, 
          visibleAttributes: {
            ...state.collationManager.visibleAttributes,
            [action.payload.memberType]: {
              ...state.collationManager.visibleAttributes[action.payload.memberType],
              [action.payload.attributeName]: action.payload.newValue
            }
          }
        }
      }
      break;
    case "FILTER_PROJECT_SUCCESS":
      state = {
        ...state, 
        collationManager: {
          ...state.collationManager, 
          filters: {
            ...state.collationManager.filters, 
            ...action.payload, 
            active: true
          },
          visibleAttributes: action.payload.visibleAttributes
        }
      }
      delete state["collationManager"]["filters"]["visibleAttributes"];
      break;
    case "RESET_FILTERS":
      state = {
        ...state, 
        collationManager: {
          ...state.collationManager, 
          filters: {
            ...initialState.collationManager.filters,
            filterPanelOpen: true, 
            queries: action.payload
          },
          selectedObjects: initialState.collationManager.selectedObjects
        }
      }
      break;
    case "TOGGLE_FILTER_DISPLAY":
      state = {
        ...state, 
        collationManager: {
          ...state.collationManager,
          filters: {
            ...state.collationManager.filters, 
            hideOthers: !state.collationManager.filters.hideOthers
          }
        }
        
      }
      break;
    case "UPDATE_FILTER_QUERY":
      state = {
        ...state,
        collationManager: {
          ...state.collationManager,
          filters: {
            ...state.collationManager.filters, 
            queries: action.payload
          }
        }
      }
      break;
    case "UPDATE_FILTER_SELECTION":
      state = {
        ...state, 
        collationManager: {
          ...state.collationManager,
          filters: {
            ...state.collationManager.filters, 
            selection: action.payload.selection, 
            hideOthers: false
          },
          selectedObjects: action.payload.selectedObjects,
        }
      }
      break;
    case "FLASH_LEAVES":
      state = {
        ...state,
        collationManager: {
          ...state.collationManager,
          flashItems: {
            ...state.collationManager.flashItems,
            leaves: action.payload
          }
        }
      }
      break;
    case "FLASH_GROUPS":
      state = {
        ...state,
        collationManager: {
          ...state.collationManager,
          flashItems: {
            ...state.collationManager.flashItems,
            groups: action.payload
          }
        }
      }
      break;
    case "UNFLASH":
      state = {
        ...state,
        collationManager: {
          ...state.collationManager,
          flashItems: {
            groups: [],
            leaves: []
          }
        }
      }
      break;
    case "EXPORT_SUCCESS":
      let exportedData = action.payload;
      console.log()
      if (action.payload.type==="xml"){
        exportedData = action.payload.data;
      } else if (action.payload.type==="formula") {
        exportedData = action.payload.data;
      } else {
        exportedData = JSON.stringify(exportedData, null, 4);
      }
      state = {
        ...state,
        exportedData
      }
      break;
    default:
      break;
  }
  return state;
}

