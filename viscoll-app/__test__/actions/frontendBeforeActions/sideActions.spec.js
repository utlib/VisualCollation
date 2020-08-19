import {
  updateSide,
  updateSides,
  mapSides,
} from '../../../src/actions/frontend/before/sideActions';

import { projectState001 } from '../../testData/projectState001';
import { dashboardState001 } from '../../testData/dashboardState001';

import { cloneDeep } from 'lodash';

describe('>>>A C T I O N --- Test side actions', () => {
  it('+++ actionCreator updateSide', () => {
    const sidePayload = {
      payload: {
        request: {
          url: `/sides/Recto_5a57825a4cfad13070870dc8`,
          method: 'put',
          data: {
            side: {
              texture: 'Felt',
            },
          },
          successMessage: 'Successfully updated the side',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.Rectos['Recto_5a57825a4cfad13070870dc8'].texture =
      'Felt';

    const gotState = updateSide(sidePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator updateSides', () => {
    const sidePayload = {
      payload: {
        request: {
          url: `/sides`,
          method: 'put',
          data: {
            sides: [
              {
                id: 'Verso_5a57825a4cfad13070870dcc',
                attributes: { script_direction: 'Top-To-Bottom' },
              },
              {
                id: 'Verso_5a57825a4cfad13070870dc9',
                attributes: { script_direction: 'Top-To-Bottom' },
              },
              {
                id: 'Verso_5a57825a4cfad13070870dc6',
                attributes: { script_direction: 'Right-To-Left' },
              },
            ],
          },
          successMessage: 'Successfully updated the side',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);

    expectedState.project.Versos[
      'Verso_5a57825a4cfad13070870dcc'
    ].script_direction = 'Top-To-Bottom';
    expectedState.project.Versos[
      'Verso_5a57825a4cfad13070870dc9'
    ].script_direction = 'Top-To-Bottom';
    expectedState.project.Versos[
      'Verso_5a57825a4cfad13070870dc6'
    ].script_direction = 'Right-To-Left';

    const gotState = updateSides(sidePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });
  it('+++ actionCreator mapSides', () => {
    const sidePayload = {
      payload: {
        request: {
          url: `/sides`,
          method: 'put',
          data: {
            sides: [
              {
                id: 'Recto_5a57825a4cfad13070870ddd',
                attributes: {
                  image: {
                    manifestID: 'DIYImages',
                    label: 'cguk1l0u4aeewdf.jpeg',
                    url:
                      'http://localhost:3001/images/5a5cc9594cfad17bed092f4a_cguk1l0u4aeewdf.jpeg',
                  },
                },
              },
              {
                id: 'Verso_5a57825a4cfad13070870de1',
                attributes: {
                  image: {
                    label: 'Hollar_a_3000_0005',
                    url:
                      'https://iiif.library.utoronto.ca/image/v2/hollar:Hollar_a_3000_0005',
                    manifestID: '5a25b0703b0eb7478b415bd4',
                  },
                },
              },
              {
                id: 'Recto_5a57825a4cfad13070870dc5',
                attributes: {
                  image: {},
                },
              },
              {
                id: 'Verso_5a57825a4cfad13070870dc6',
                attributes: {
                  image: {},
                },
              },
            ],
          },
          successMessage: 'Successfully updated the side',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeDashState = cloneDeep(dashboardState001);
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);
    const expectedDashState = cloneDeep(dashboardState001);

    expectedState.project.Rectos['Recto_5a57825a4cfad13070870ddd'].image = {
      manifestID: 'DIYImages',
      label: 'cguk1l0u4aeewdf.jpeg',
      url:
        'http://localhost:3001/images/5a5cc9594cfad17bed092f4a_cguk1l0u4aeewdf.jpeg',
    };
    expectedState.project.Versos['Verso_5a57825a4cfad13070870de1'].image = {
      label: 'Hollar_a_3000_0005',
      url:
        'https://iiif.library.utoronto.ca/image/v2/hollar:Hollar_a_3000_0005',
      manifestID: '5a25b0703b0eb7478b415bd4',
    };
    expectedState.project.Rectos['Recto_5a57825a4cfad13070870dc5'].image = {};
    expectedState.project.Versos['Verso_5a57825a4cfad13070870dc6'].image = {};

    expectedDashState.images[0].sideIDs.splice(0, 1);
    expectedDashState.images[0].sideIDs.push('Recto_5a57825a4cfad13070870ddd');

    const gotState = mapSides(sidePayload, beforeState, beforeDashState);
    expect(gotState.active).toEqual(expectedState);
    expect(gotState.dashboard).toEqual(expectedDashState);
  });
});
