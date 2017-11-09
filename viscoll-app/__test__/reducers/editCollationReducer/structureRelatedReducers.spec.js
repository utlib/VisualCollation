import editCollationReducer from '../../../src/reducers/editCollationReducer';
import { initialState } from '../../../src/reducers/initialStates/active';


describe('>>>R E D U C E R --- Test Collation Structure Related Actions',()=>{
  it('+++ reducer for ADD_LEAF(S)_SUCCESS', () => {
    let action = {
      type: "ADD_LEAF(S)_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for ADD_GROUP(S)_SUCCESS', () => {
    let action = {
      type: "ADD_GROUP(S)_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for UPDATE_GROUP_SUCCESS', () => {
    let action = {
      type: "UPDATE_GROUP_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for UPDATE_GROUPS_SUCCESS', () => {
    let action = {
      type: "UPDATE_GROUPS_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for UPDATE_LEAF_SUCCESS', () => {
    let action = {
      type: "UPDATE_LEAF_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for UPDATE_LEAFS_SUCCESS', () => {
    let action = {
      type: "UPDATE_LEAFS_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for UPDATE_SIDE_SUCCESS', () => {
    let action = {
      type: "UPDATE_SIDE_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for UPDATE_SIDES_SUCCESS', () => {
    let action = {
      type: "UPDATE_SIDES_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for DELETE_LEAF_SUCCESS', () => {
    let action = {
      type: "DELETE_LEAF_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for DELETE_LEAFS_SUCCESS', () => {
    let action = {
      type: "DELETE_LEAFS_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for DELETE_GROUP_SUCCESS', () => {
    let action = {
      type: "DELETE_GROUP_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for DELETE_GROUPS_SUCCESS', () => {
    let action = {
      type: "DELETE_GROUPS_SUCCESS",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState, 
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });

  // Failing Actions
  it('+++ reducer for UPDATE_GROUP_FAILED', () => {
    let action = {
      type: "UPDATE_GROUP_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for UPDATE_GROUPS_FAILED', () => {
    let action = {
      type: "UPDATE_GROUPS_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for UPDATE_SIDE_FAILED', () => {
    let action = {
      type: "UPDATE_SIDE_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for UPDATE_SIDES_FAILED', () => {
    let action = {
      type: "UPDATE_SIDES_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for UPDATE_LEAF_FAILED', () => {
    let action = {
      type: "UPDATE_LEAF_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for UPDATE_LEAFS_FAILED', () => {
    let action = {
      type: "UPDATE_LEAFS_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for ADD_LEAF(S)_FAILED', () => {
    let action = {
      type: "ADD_LEAF_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for ADD_GROUP(S)_FAILED', () => {
    let action = {
      type: "ADD_GROUP_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for DELETE_LEAF_FAILED', () => {
    let action = {
      type: "DELETE_LEAF_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for DELETE_LEAFS_FAILED', () => {
    let action = {
      type: "DELETE_LEAFS_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for DELETE_GROUP_FAILED', () => {
    let action = {
      type: "DELETE_GROUP_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for DELETE_GROUPS_FAILED', () => {
    let action = {
      type: "DELETE_GROUPS_FAILED",
      payload: "the full project structure this leaf belongs to"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
  it('+++ reducer for LOAD_PROJECT_SUCCESS', () => {
    let action = {
      type: "LOAD_PROJECT_SUCCESS",
      payload: "project object"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...state,
      project: action.payload,
      notes: action.payload.notes,
      noteTypes: action.payload.noteTypes
    })
  });
  it('+++ reducer for LOAD_PROJECT_FAILED', () => {
    let action = {
      type: "LOAD_PROJECT_FAILED",
      payload: "project object"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState
    })
  });
  it('+++ reducer for persist/REHYDRATE', () => {
    let action = {
      type: "persist/REHYDRATE",
      payload: {active: "saved state"}
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      ...action.payload.active
    })
  });
  it('+++ reducer for axios error config', () => {
    let action = {
      type: "LOAD_PROJECT_FAILED",
      error: "some error"
    };
    let state = editCollationReducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
    })
  });
});
