import {
  updateProject,
  deleteProject,
} from '../../../src/frontendBeforeActions/projectActions';

import {dashboardState001} from '../../testData/dashboardState001'

import {cloneDeep} from 'lodash';

describe('>>>A C T I O N --- Test project actions', () => {

  it('+++ actionCreator updateProject', () => {
    const projectPayload = {
      payload: {
        request : {
          url: `/projects/5a57825a4cfad13070870dc3`,
          method: 'put',
          data: {
            "project": {
              "title": "my prject 123123",
              "shelfmark": "mss 568456",
              "metadata": {
                "date": "18th century"
              }
            }
          },
          successMessage: "Successfully linked the images",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState = cloneDeep(dashboardState001);
    let expectedState = cloneDeep(dashboardState001);

    expectedState.projects[0].title = "my prject 123123";
    expectedState.projects[0].shelfmark = "mss 568456";
    expectedState.projects[0].metadata.date = "18th century";

    const gotState = updateProject(projectPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator deleteProject delete images', () => {
    const projectPayload = {
      payload: {
        request : {
          url: `/projects/5a57825a4cfad13070870dc3`,
          method: 'delete',
          data: {
            "deleteUnlinkedImages": true
          },
          successMessage: "Successfully linked the images",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState = cloneDeep(dashboardState001);
    let expectedState = cloneDeep(dashboardState001);

    expectedState.projects.splice(0,1);
    expectedState.images.splice(0, 6);

    const gotState = deleteProject(projectPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator deleteProject do not delete images', () => {
    const projectPayload = {
      payload: {
        request : {
          url: `/projects/5a57825a4cfad13070870dc3`,
          method: 'delete',
          data: {
            "deleteUnlinkedImages": false
          },
          successMessage: "Successfully linked the images",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState = cloneDeep(dashboardState001);
    let expectedState = cloneDeep(dashboardState001);

    expectedState.projects.splice(0,1);
    for (let i in expectedState.images) {
      if (expectedState.images[i].projectIDs.includes('5a57825a4cfad13070870dc3')) {
        expectedState.images[i].projectIDs.splice(0,1);
      }
    }

    const gotState = deleteProject(projectPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })
})