import {
  createLeaves,
  updateLeaf,
  updateLeaves,
  deleteLeaf,
  deleteLeaves,
  autoConjoinLeafs,
} from '../../../src/frontendBeforeActions/leafActions';

import {state001} from '../../testData/state001'

import {cloneDeep} from 'lodash';

describe('>>>A C T I O N --- Test leaf actions', () => {
  it('+++ actionCreator createLeaves', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs`,
          method: 'post',
          data: {
            "leaf": {
              project_id: "5a57825a4cfad13070870dc3",
              parentID: "Group_5a57825a4cfad13070870df5",
            },
            "additional": {
              conjoin: false,
              leafIDs: ["111"],
              sideIDs: ["11", "22"],
              memberOrder: 8,
              noOfLeafs: 1,
              order: 17,
            }
          },
          successMessage: "Successfully added the leaves" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);
    expectedState.project.Groups["Group_5a57825a4cfad13070870df5"].memberIDs.push("Leaf_111");
    expectedState.project.Leafs["Leaf_111"] = {
      id: 'Leaf_111',
      attached_above: 'None',
      attached_below: 'None',
      attachment_method: 'None',
      conjoined_to: null,
      material: 'None',
      stub: 'None',
      type: 'None',
      memberType: 'Leaf',
      nestLevel: 1,
      notes: [],
      parentID: "Group_5a57825a4cfad13070870df5",
      rectoID: "Recto_11",
      versoID: "Verso_22",
    }
    expectedState.project.Rectos["Recto_11"] = {
      id: "Recto_11",
      parentID: "Leaf_111",
      folio_number: null,
      generated_folio_number: null,
      script_direction: 'None',
      texture: 'Hair',
      image: {},
      notes: [],
      memberType: 'Recto',
    }
    expectedState.project.Versos["Verso_22"] = {
      id: "Verso_22",
      parentID: "Leaf_111",
      folio_number: null,
      generated_folio_number: null,
      script_direction: 'None',
      texture: 'Flesh',
      image: {},
      notes: [],
      memberType: 'Verso',
    }
    expectedState.project.leafIDs.push("Leaf_111");
    expectedState.project.rectoIDs.push("Recto_11");
    expectedState.project.versoIDs.push("Verso_22");
    expectedState.collationManager.flashItems.leaves.push("Leaf_111");
    const gotState = createLeaves(leafPayload, beforeState);
    expect(gotState).toEqual(expectedState)
  })

  it('+++ actionCreator updateLeaf', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs/Leaf_5a57825a4cfad13070870dc4`,
          method: 'post',
          data: {
            "leaf": {
              material: "Parchment",
            }
          },
          successMessage: "Successfully updated the leaf" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc4"].material = "Parchment";
    const gotState = updateLeaf(leafPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })
  it('+++ actionCreator updateLeaves', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs`,
          method: 'post',
          data: {
            project_id: "5a57825a4cfad13070870dc3",
            leafs: [
              {
                id: "Leaf_5a57825a4cfad13070870dc4",
                attributes: {
                  material: "Parchment",
                  type: "Added"
                }
              },
              {
                id: "Leaf_5a57825a4cfad13070870dc7",
                attributes: {
                  material: "Parchment",
                  type: "Added"
                }
              },
            ]
          },
          successMessage: "Successfully updated the leaves" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc4"].material = "Parchment";
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc7"].material = "Parchment";
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc4"].type = "Added";
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc7"].type = "Added";
    const gotState = updateLeaves(leafPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator deleteLeaf', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs/Leaf_5a57825a4cfad13070870dc4`,
          method: 'delete',
          successMessage: "Successfully deleted the leaf" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);

    delete expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc4"];
    delete expectedState.project.Rectos["Recto_5a57825a4cfad13070870dc5"];
    delete expectedState.project.Versos["Verso_5a57825a4cfad13070870dc6"];
    
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dd3"].conjoined_to = null;
    expectedState.project.Groups["Group_5a57825a4cfad13070870df4"].memberIDs.splice(0,1);
    expectedState.project.Notes["5a57825a4cfad13070870df9"].objects.Leaf.splice(0,1);
    expectedState.project.Notes["5a57825a4cfad13070870df9"].objects.Verso.splice(0,1);
    expectedState.project.Notes["5a57825a4cfad13070870dfa"].objects.Verso.splice(0,1);
    expectedState.project.leafIDs.splice(0,1);
    expectedState.project.rectoIDs.splice(0,1);
    expectedState.project.versoIDs.splice(0,1);
    
    expectedState.collationManager.selectedObjects.lastSelected = "";
    expectedState.collationManager.selectedObjects.members = [];
    expectedState.collationManager.selectedObjects.type = "";

    const gotState = deleteLeaf("Leaf_5a57825a4cfad13070870dc4", beforeState);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator deleteLeaves', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs`,
          method: 'delete',
          data: {
            leafs: [
              "Leaf_5a57825a4cfad13070870dc4",
              "Leaf_5a57825a4cfad13070870df1"
            ]
          },
          successMessage: "Successfully deleted the leaves" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);

    // Delete first leaf
    delete expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc4"];
    delete expectedState.project.Rectos["Recto_5a57825a4cfad13070870dc5"];
    delete expectedState.project.Versos["Verso_5a57825a4cfad13070870dc6"];
    
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dd3"].conjoined_to = null;
    expectedState.project.Groups["Group_5a57825a4cfad13070870df4"].memberIDs.splice(0,1);
    expectedState.project.Notes["5a57825a4cfad13070870df9"].objects.Leaf.splice(0,1);
    expectedState.project.Notes["5a57825a4cfad13070870df9"].objects.Verso.splice(0,1);
    expectedState.project.Notes["5a57825a4cfad13070870dfa"].objects.Verso.splice(0,1);
    expectedState.project.leafIDs.splice(0,1);
    expectedState.project.rectoIDs.splice(0,1);
    expectedState.project.versoIDs.splice(0,1);

    // Delete second leaf
    delete expectedState.project.Leafs["Leaf_5a57825a4cfad13070870df1"];
    delete expectedState.project.Rectos["Recto_5a57825a4cfad13070870df2"];
    delete expectedState.project.Versos["Verso_5a57825a4cfad13070870df3"];
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870de2"].conjoined_to = null;
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dee"].attached_below = "None";
    
    expectedState.project.Groups["Group_5a57825a4cfad13070870df5"].memberIDs.splice(-1,1);
    expectedState.project.leafIDs.splice(-1,1);
    expectedState.project.rectoIDs.splice(-1,1);
    expectedState.project.versoIDs.splice(-1,1);

    expectedState.collationManager.selectedObjects.lastSelected = "";
    expectedState.collationManager.selectedObjects.members = [];
    expectedState.collationManager.selectedObjects.type = "";

    const gotState = deleteLeaves(["Leaf_5a57825a4cfad13070870dc4", "Leaf_5a57825a4cfad13070870df1"], beforeState);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator autoConjoinLeafs', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs/conjoin`,
          method: 'put',
          data: {
            leafs: [
              "Leaf_5a57825a4cfad13070870dd9",
              "Leaf_5a57825a4cfad13070870dd6"
            ]
          },
          successMessage: "Successfully conjoined the leaves" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);

    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dd9"].conjoined_to = "Leaf_5a57825a4cfad13070870dd6";
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dd6"].conjoined_to = "Leaf_5a57825a4cfad13070870dd9";

    const gotState = autoConjoinLeafs(leafPayload, beforeState, ["Leaf_5a57825a4cfad13070870dd9","Leaf_5a57825a4cfad13070870dd6"]);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator autoConjoinLeafs for odd number of leaves', () => {
    const leafPayload = {
      payload: {
        request : {
          url: `/leafs/conjoin`,
          method: 'put',
          data: {
            leafs: [
              'Leaf_5a57825a4cfad13070870dc4',
              'Leaf_5a57825a4cfad13070870dc7',
              'Leaf_5a57825a4cfad13070870dca',
            ]
          },
          successMessage: "Successfully conjoined the leaves" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState =  cloneDeep(state001);
    let expectedState = cloneDeep(state001);

    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc4"].conjoined_to = "Leaf_5a57825a4cfad13070870dca";
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dd3"].conjoined_to = null;
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dc7"].conjoined_to = null;
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dd0"].conjoined_to = null;
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dca"].conjoined_to = "Leaf_5a57825a4cfad13070870dc4";
    expectedState.project.Leafs["Leaf_5a57825a4cfad13070870dcd"].conjoined_to = null;
    
    const gotState = autoConjoinLeafs(leafPayload, beforeState, ["Leaf_5a57825a4cfad13070870dc4","Leaf_5a57825a4cfad13070870dc7","Leaf_5a57825a4cfad13070870dca"]);
    expect(gotState).toEqual(expectedState);
  })

})