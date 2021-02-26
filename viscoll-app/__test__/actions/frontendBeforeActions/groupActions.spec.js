import {
  createGroups,
  updateGroup,
  updateGroups,
  deleteGroup,
  deleteGroups,
} from '../../../src/actions/frontend/before/groupActions';

import { projectState001 } from '../../testData/projectState001';

import { cloneDeep } from 'lodash';

describe('>>>A C T I O N --- Test group actions', () => {
  it('+++ actionCreator createGroups', () => {
    const groupPayload = {
      payload: {
        request: {
          url: `/groups`,
          method: 'post',
          data: {
            group: {
              project_id: '5a57825a4cfad13070870dc3',
              title: 'None',
              type: 'Quire',
            },
            additional: {
              conjoin: false,
              groupIDs: ['123123', '456456'],
              leafIDs: ['111', '222'],
              sideIDs: ['11', '22', '33', '44'],
              memberOrder: 3,
              noOfGroups: 2,
              noOfLeafs: 1,
              order: 5,
            },
          },
          successMessage: 'Successfully added the groups',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.Groups['Group_123123'] = {
      id: 'Group_123123',
      type: 'Quire',
      title: 'None',
      tacketed: [],
      sewing: [],
      nestLevel: 1,
      parentID: null,
      terms: [],
      memberIDs: ['Leaf_111'],
      memberType: 'Group',
    };
    expectedState.project.Groups['Group_456456'] = {
      id: 'Group_456456',
      type: 'Quire',
      title: 'None',
      tacketed: [],
      sewing: [],
      nestLevel: 1,
      parentID: null,
      terms: [],
      memberIDs: ['Leaf_222'],
      memberType: 'Group',
    };
    expectedState.project.Leafs['Leaf_111'] = {
      id: 'Leaf_111',
      folio_number: null,
      attached_above: 'None',
      attached_below: 'None',
      conjoined_to: null,
      material: 'None',
      stub: 'No',
      type: 'None',
      memberType: 'Leaf',
      nestLevel: 1,
      terms: [],
      parentID: 'Group_123123',
      rectoID: 'Recto_11',
      versoID: 'Verso_22',
    };
    expectedState.project.Leafs['Leaf_222'] = {
      id: 'Leaf_222',
      folio_number: null,
      attached_above: 'None',
      attached_below: 'None',
      conjoined_to: null,
      material: 'None',
      stub: 'No',
      type: 'None',
      memberType: 'Leaf',
      nestLevel: 1,
      terms: [],
      parentID: 'Group_456456',
      rectoID: 'Recto_33',
      versoID: 'Verso_44',
    };
    expectedState.project.Rectos['Recto_11'] = {
      id: 'Recto_11',
      parentID: 'Leaf_111',
      page_number: null,
      script_direction: 'None',
      texture: 'Hair',
      image: {},
      terms: [],
      memberType: 'Recto',
    };
    expectedState.project.Rectos['Recto_33'] = {
      id: 'Recto_33',
      parentID: 'Leaf_222',
      page_number: null,
      script_direction: 'None',
      texture: 'Hair',
      image: {},
      terms: [],
      memberType: 'Recto',
    };
    expectedState.project.Versos['Verso_22'] = {
      id: 'Verso_22',
      parentID: 'Leaf_111',
      page_number: null,
      script_direction: 'None',
      texture: 'Flesh',
      image: {},
      terms: [],
      memberType: 'Verso',
    };
    expectedState.project.Versos['Verso_44'] = {
      id: 'Verso_44',
      parentID: 'Leaf_222',
      page_number: null,
      script_direction: 'None',
      texture: 'Flesh',
      image: {},
      terms: [],
      memberType: 'Verso',
    };
    expectedState.project.groupIDs.push('Group_123123');
    expectedState.project.groupIDs.push('Group_456456');
    expectedState.project.leafIDs.push('Leaf_111');
    expectedState.project.leafIDs.push('Leaf_222');
    expectedState.project.rectoIDs.push('Recto_11');
    expectedState.project.rectoIDs.push('Recto_33');
    expectedState.project.versoIDs.push('Verso_22');
    expectedState.project.versoIDs.push('Verso_44');
    expectedState.collationManager.flashItems.groups.push('Group_123123');
    expectedState.collationManager.flashItems.groups.push('Group_456456');
    expectedState.collationManager.flashItems.leaves.push('Leaf_111');
    expectedState.collationManager.flashItems.leaves.push('Leaf_222');
    const gotState = createGroups(groupPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator updateGroup', () => {
    const groupPayload = {
      payload: {
        request: {
          url: `/groups/Group_5a57825a4cfad13070870df4`,
          method: 'put',
          data: {
            group: {
              title: 'New title',
              type: 'Booklet',
            },
          },
          successMessage: 'Successfully updated the group',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);
    expectedState.project.Groups['Group_5a57825a4cfad13070870df4'].type =
      'Booklet';
    expectedState.project.Groups['Group_5a57825a4cfad13070870df4'].title =
      'New title';
    const gotState = updateGroup(groupPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator updateGroups', () => {
    const groupPayload = {
      payload: {
        request: {
          url: `/groups`,
          method: 'put',
          data: {
            groups: [
              {
                id: 'Group_5a57825a4cfad13070870df4',
                attributes: {
                  title: 'New title',
                  type: 'Booklet',
                },
              },
              {
                id: 'Group_5a57825a4cfad13070870df5',
                attributes: {
                  title: 'New title 2',
                  type: 'Booklet',
                },
              },
            ],
          },
          successMessage: 'Successfully updated the groups',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);
    expectedState.project.Groups['Group_5a57825a4cfad13070870df4'].type =
      'Booklet';
    expectedState.project.Groups['Group_5a57825a4cfad13070870df4'].title =
      'New title';
    expectedState.project.Groups['Group_5a57825a4cfad13070870df5'].type =
      'Booklet';
    expectedState.project.Groups['Group_5a57825a4cfad13070870df5'].title =
      'New title 2';
    const gotState = updateGroups(groupPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator deleteGroup', () => {
    const groupPayload = {
      payload: {
        request: {
          url: `/groups/Group_5a57825a4cfad13070870df7`,
          method: 'delete',
          successMessage: 'Successfully deleted the groups',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);
    delete expectedState.project.Groups['Group_5a57825a4cfad13070870df7'];
    delete expectedState.project.Leafs['Leaf_5a57825a4cfad13070870dd6'];
    delete expectedState.project.Leafs['Leaf_5a57825a4cfad13070870dd9'];
    delete expectedState.project.Rectos['Recto_5a57825a4cfad13070870dd7'];
    delete expectedState.project.Rectos['Recto_5a57825a4cfad13070870dda'];
    delete expectedState.project.Versos['Verso_5a57825a4cfad13070870dd8'];
    delete expectedState.project.Versos['Verso_5a57825a4cfad13070870ddb'];
    expectedState.project.groupIDs.splice(-1);
    expectedState.project.leafIDs.splice(
      expectedState.project.leafIDs.indexOf('Leaf_5a57825a4cfad13070870dd6'),
      1
    );
    expectedState.project.leafIDs.splice(
      expectedState.project.leafIDs.indexOf('Leaf_5a57825a4cfad13070870dd9'),
      1
    );
    expectedState.project.rectoIDs.splice(
      expectedState.project.rectoIDs.indexOf('Recto_5a57825a4cfad13070870dd7'),
      1
    );
    expectedState.project.rectoIDs.splice(
      expectedState.project.rectoIDs.indexOf('Recto_5a57825a4cfad13070870dda'),
      1
    );
    expectedState.project.versoIDs.splice(
      expectedState.project.versoIDs.indexOf('Verso_5a57825a4cfad13070870dd8'),
      1
    );
    expectedState.project.versoIDs.splice(
      expectedState.project.versoIDs.indexOf('Verso_5a57825a4cfad13070870ddb'),
      1
    );
    expectedState.collationManager.selectedObjects.lastSelected = '';
    expectedState.collationManager.selectedObjects.members = [];
    expectedState.collationManager.selectedObjects.type = '';
    expectedState.project.Groups[
      'Group_5a57825a4cfad13070870df6'
    ].memberIDs.splice(0, 1);
    const gotState = deleteGroup('Group_5a57825a4cfad13070870df7', beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator deleteGroups', () => {
    const groupPayload = {
      payload: {
        request: {
          url: `/groups`,
          method: 'delete',
          data: {
            groups: [
              'Group_5a57825a4cfad13070870df6',
              'Group_5a57825a4cfad13070870df7',
            ],
          },
          successMessage: 'Successfully deleted the groups',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);

    delete expectedState.project.Groups['Group_5a57825a4cfad13070870df6'];
    delete expectedState.project.Leafs['Leaf_5a57825a4cfad13070870ddc'];
    delete expectedState.project.Leafs['Leaf_5a57825a4cfad13070870ddf'];
    delete expectedState.project.Rectos['Recto_5a57825a4cfad13070870ddd'];
    delete expectedState.project.Rectos['Recto_5a57825a4cfad13070870de0'];
    delete expectedState.project.Versos['Verso_5a57825a4cfad13070870dde'];
    delete expectedState.project.Versos['Verso_5a57825a4cfad13070870de1'];

    delete expectedState.project.Groups['Group_5a57825a4cfad13070870df7'];
    delete expectedState.project.Leafs['Leaf_5a57825a4cfad13070870dd6'];
    delete expectedState.project.Leafs['Leaf_5a57825a4cfad13070870dd9'];
    delete expectedState.project.Rectos['Recto_5a57825a4cfad13070870dd7'];
    delete expectedState.project.Rectos['Recto_5a57825a4cfad13070870dda'];
    delete expectedState.project.Versos['Verso_5a57825a4cfad13070870dd8'];
    delete expectedState.project.Versos['Verso_5a57825a4cfad13070870ddb'];
    expectedState.project.groupIDs.splice(
      expectedState.project.groupIDs.indexOf('Group_5a57825a4cfad13070870df6'),
      1
    );
    expectedState.project.groupIDs.splice(
      expectedState.project.groupIDs.indexOf('Group_5a57825a4cfad13070870df7'),
      1
    );
    expectedState.project.leafIDs.splice(
      expectedState.project.leafIDs.indexOf('Leaf_5a57825a4cfad13070870ddc'),
      1
    );
    expectedState.project.leafIDs.splice(
      expectedState.project.leafIDs.indexOf('Leaf_5a57825a4cfad13070870ddf'),
      1
    );
    expectedState.project.leafIDs.splice(
      expectedState.project.leafIDs.indexOf('Leaf_5a57825a4cfad13070870dd6'),
      1
    );
    expectedState.project.leafIDs.splice(
      expectedState.project.leafIDs.indexOf('Leaf_5a57825a4cfad13070870dd9'),
      1
    );
    expectedState.project.rectoIDs.splice(
      expectedState.project.rectoIDs.indexOf('Recto_5a57825a4cfad13070870ddd'),
      1
    );
    expectedState.project.rectoIDs.splice(
      expectedState.project.rectoIDs.indexOf('Recto_5a57825a4cfad13070870de0'),
      1
    );
    expectedState.project.rectoIDs.splice(
      expectedState.project.rectoIDs.indexOf('Recto_5a57825a4cfad13070870dd7'),
      1
    );
    expectedState.project.rectoIDs.splice(
      expectedState.project.rectoIDs.indexOf('Recto_5a57825a4cfad13070870dda'),
      1
    );
    expectedState.project.versoIDs.splice(
      expectedState.project.versoIDs.indexOf('Verso_5a57825a4cfad13070870dde'),
      1
    );
    expectedState.project.versoIDs.splice(
      expectedState.project.versoIDs.indexOf('Verso_5a57825a4cfad13070870de1'),
      1
    );
    expectedState.project.versoIDs.splice(
      expectedState.project.versoIDs.indexOf('Verso_5a57825a4cfad13070870dd8'),
      1
    );
    expectedState.project.versoIDs.splice(
      expectedState.project.versoIDs.indexOf('Verso_5a57825a4cfad13070870ddb'),
      1
    );
    expectedState.collationManager.selectedObjects.lastSelected = '';
    expectedState.collationManager.selectedObjects.members = [];
    expectedState.collationManager.selectedObjects.type = '';
    expectedState.project.Groups[
      'Group_5a57825a4cfad13070870df5'
    ].memberIDs.splice(0, 1);
    const gotState = deleteGroups(
      ['Group_5a57825a4cfad13070870df6', 'Group_5a57825a4cfad13070870df7'],
      beforeState
    );
    expect(gotState).toEqual(expectedState);
  });
});
