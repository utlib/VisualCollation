import {
  updateManifest,
  deleteManifest,
} from '../../../src/actions/frontend/before/manifestActions';

import {projectState001} from '../../testData/projectState001';

import {cloneDeep} from 'lodash';

describe('>>>A C T I O N --- Test manifest actions', () => {

  it('+++ actionCreator updateManifest', () => {
    const manifestPayload = {
      payload: {
        request : {
          url: `/projects/5a57825a4cfad13070870dc3/manifests`,
          method: 'put',
          data: {
            "manifest": {
              "id": "5a25b0703b0eb7478b415bd4",
              "name": "new manifest name",
            }
          },
          successMessage: "Successfully updated the manifest",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.manifests["5a25b0703b0eb7478b415bd4"].name = "new manifest name";

    const gotState = updateManifest(manifestPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })

  it('+++ actionCreator deleteManifest', () => {
    const manifestPayload = {
      payload: {
        request : {
          url: `/projects/5a57825a4cfad13070870dc3/manifests`,
          method: 'delete',
          data: {
            "manifest": {
              "id": "5a25b0703b0eb7478b415bd4",
            }
          },
          successMessage: "Successfully deleted the manifest",
          errorMessage: "Ooops! Something went wrong"
        }
      }
    }
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);

    delete expectedState.project.manifests["5a25b0703b0eb7478b415bd4"];
    expectedState.project.Rectos["Recto_5a57825a4cfad13070870dc5"].image = {};
    expectedState.project.Rectos["Recto_5a57825a4cfad13070870dc8"].image = {};
    expectedState.project.Rectos["Recto_5a57825a4cfad13070870dcb"].image = {};
    expectedState.project.Rectos["Recto_5a57825a4cfad13070870dce"].image = {};
    expectedState.project.Rectos["Recto_5a57825a4cfad13070870dd1"].image = {};
    expectedState.project.Rectos["Recto_5a57825a4cfad13070870dd4"].image = {};

    const gotState = deleteManifest(manifestPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  })

})