import {
  getLeafMembers,
} from '../../../src/frontendBeforeActions/helperActions';

import {projectState001} from '../../testData/projectState001';

import {cloneDeep} from 'lodash';

describe('>>>A C T I O N --- Test helper actions', () => {

  it('+++ actionCreator getLeafMembers', () => {
    // Test getLeafMembers of 2nd group (Group_5a57825a4cfad13070870df5)
    const memberIDs = [
      'Group_5a57825a4cfad13070870df6',
      'Leaf_5a57825a4cfad13070870de2',
      'Leaf_5a57825a4cfad13070870de5',
      'Leaf_5a57825a4cfad13070870de8',
      'Leaf_5a57825a4cfad13070870deb',
      'Leaf_5a57825a4cfad13070870dee',
      'Leaf_5a57825a4cfad13070870df1'
    ];
    const leafIDs = [];
    const projectState =  cloneDeep(projectState001);
    const expectedLeafIDs = [
      'Leaf_5a57825a4cfad13070870dd6',
      'Leaf_5a57825a4cfad13070870dd9',
      'Leaf_5a57825a4cfad13070870ddc',
      'Leaf_5a57825a4cfad13070870ddf',
      'Leaf_5a57825a4cfad13070870de2',
      'Leaf_5a57825a4cfad13070870de5',
      'Leaf_5a57825a4cfad13070870de8',
      'Leaf_5a57825a4cfad13070870deb',
      'Leaf_5a57825a4cfad13070870dee',
      'Leaf_5a57825a4cfad13070870df1',
    ]
    getLeafMembers(memberIDs, projectState, leafIDs);
    expect(leafIDs).toEqual(expectedLeafIDs);
  })
  it('+++ actionCreator getLeafMembers', () => {
    // Test getLeafMembers of an empty group
    const memberIDs = [];
    const leafIDs = [];
    const projectState =  cloneDeep(projectState001);
    const expectedLeafIDs = []
    getLeafMembers(memberIDs, projectState, leafIDs);
    expect(leafIDs).toEqual(expectedLeafIDs);
  })
})