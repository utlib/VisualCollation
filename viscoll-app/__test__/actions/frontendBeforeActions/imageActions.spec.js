import {
  linkImages,
  unlinkImages,
  deleteImages,
} from '../../../src/frontendBeforeActions/imageActions';

import {projectState001} from '../../testData/projectState001'
import {dashboardState001} from '../../testData/dashboardState001'

import {cloneDeep} from 'lodash';

describe('>>>A C T I O N --- Test image actions', () => {
  // Test linkImagesFromProject and linkImagesFromDashboard
  it('+++ actionCreator linkImages', () => {
    const imagePayload = {
      payload: {
        request : {
          url: `/images/link`,
          method: 'put',
          data: {
            "imageIDs": ['5a5783154cfad16535870e13'],
            "projectIDs": ['5a57825a4cfad13070870dc3'],
          },
          successMessage: "Successfully linked the images",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeDashState = cloneDeep(dashboardState001);
    const beforeState =  cloneDeep(projectState001);
    let expectedDashState = cloneDeep(dashboardState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.manifests.DIYImages.images.push({
      label: '103496018.jpeg',
      url: 'http://localhost:3001/images/5a5783154cfad16535870e13_103496018.jpeg',
      manifestID: 'DIYImages'
    });
    expectedDashState.images[6].projectIDs.push('5a57825a4cfad13070870dc3');

    const gotState = linkImages(imagePayload, beforeDashState, beforeState);
    expect(gotState.active).toEqual(expectedState)
    expect(gotState.dashboard).toEqual(expectedDashState)
  })

  // Test unlinkImagesFromProject and unlinkImagesFromDashboard
  it('+++ actionCreator unlinkImages', () => {
    const imagePayload = {
      payload: {
        request : {
          url: `/images/unlink`,
          method: 'put',
          data: {
            "imageIDs": ['5a5cc9594cfad17bed092f4c', '5a5cc95a4cfad17bed092f4e'],
            "projectIDs": ['5a57825a4cfad13070870dc3'],
          },
          successMessage: "Successfully unlinked the images",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeDashState = cloneDeep(dashboardState001);
    const beforeState =  cloneDeep(projectState001);
    let expectedDashState = cloneDeep(dashboardState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.manifests.DIYImages.images.splice(2,1)
    expectedState.project.manifests.DIYImages.images.splice(3,1)
    expectedState.project.Versos['Verso_5a57825a4cfad13070870dcc'].image = {};

    expectedDashState.images[2].projectIDs.splice(0,1);
    expectedDashState.images[4].projectIDs.splice(0,1);

    const gotState = unlinkImages(imagePayload, beforeDashState, beforeState);
    expect(gotState.active).toEqual(expectedState)
    expect(gotState.dashboard).toEqual(expectedDashState)
  })

  // Test deleteImagesFromDashboard
  it('+++ actionCreator deleteImages', () => {
    const imagePayload = {
      payload: {
        request : {
          url: `/images`,
          method: 'delete',
          data: {
            "imageIDs": ['5a5cc9594cfad17bed092f4c', '5a5cc95a4cfad17bed092f4e'],
          },
          successMessage: "Successfully deleted the images",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeDashState = cloneDeep(dashboardState001);
    const beforeState =  cloneDeep(projectState001);
    let expectedDashState = cloneDeep(dashboardState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.manifests.DIYImages.images.splice(2,1)
    expectedState.project.manifests.DIYImages.images.splice(3,1)
    expectedState.project.Versos['Verso_5a57825a4cfad13070870dcc'].image = {};

    expectedDashState.images.splice(2,1);
    expectedDashState.images.splice(3,1);

    const gotState = deleteImages(imagePayload, beforeDashState, beforeState);

    expect(gotState.active).toEqual(expectedState)
    expect(gotState.dashboard).toEqual(expectedDashState)
  })

})