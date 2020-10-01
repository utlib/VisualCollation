import {
  createNoteType,
  updateNoteType,
  deleteNoteType,
  createTerm,
  updateTerm,
  linkTerm,
  unlinkTerm,
  deleteTerm,
} from '../../../src/actions/frontend/before/termActions';

import { projectState001 } from '../../testData/projectState001';

import { cloneDeep } from 'lodash';

describe('>>>A C T I O N --- Test term actions', () => {
  it('+++ actionCreator createNoteType', () => {
    const noteTypePayload = {
      payload: {
        request: {
          url: `/terms/type`,
          method: 'post',
          data: {
            noteType: {
              project_id: '5951303fc9bf3c7b9a573a3f',
              type: 'Watermark',
            },
          },
          successMessage: 'Successfully created the note type',
          errorMessage: 'Ooops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    const createNoteTypeAction = createNoteType(noteTypePayload, beforeState);
    let afterState = cloneDeep(projectState001);
    afterState.project.noteTypes.push('Watermark');
    expect(createNoteTypeAction).toEqual(afterState);
  });

  it('+++ actionCreator updateNoteType', () => {
    const noteTypePayload = {
      payload: {
        request: {
          url: '/terms/type',
          method: 'put',
          data: {
            noteType: {
              project_id: '5951303fc9bf3c7b9a573a3f',
              old_type: 'Damage',
              type: 'Damages',
            },
          },
          successMessage: 'Successfully updated the note type',
          errorMessage: 'Oops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);
    expectedState.project.noteTypes[3] = 'Damages';
    expectedState.project.Terms['5a57825a4cfad13070870dfa'].type = 'Damages';
    let gotState = updateNoteType(noteTypePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator deleteNoteType', () => {
    const noteTypePayload = {
      payload: {
        request: {
          url: '/terms/type',
          method: 'delete',
          data: {
            noteType: {
              project_id: '5951303fc9bf3c7b9a573a3f',
              type: 'Hand',
            },
          },
          successMessage: 'Successfully deleted the note type',
          errorMessage: 'Oops! Something went wrong',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(projectState001);
    expectedState.project.noteTypes = ['Unknown', 'Ink', 'Damage'];
    expectedState.project.Terms['5a57825a4cfad13070870df9'].type = 'Unknown';
    let gotState = deleteNoteType(noteTypePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator createTerm', () => {
    const termPayload = {
      payload: {
        request: {
          url: '/terms',
          method: 'post',
          data: {
            term: {
              id: 'f951303fc9bf3c7b9a573a3f',
              project_id: '5951303fc9bf3c7b9a573a3f',
              title: 'Example Term',
              type: 'asd',
              description: 'example content',
              uri: 'https://www.test.com/',
              show: true,
            },
          },
          successMessage: '',
          errorMessage: '',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(beforeState);
    expectedState.project.Terms['f951303fc9bf3c7b9a573a3f'] = {
      id: 'f951303fc9bf3c7b9a573a3f',
      title: 'Example Term',
      type: 'asd',
      description: 'example content',
      uri: 'https://www.test.com/',
      show: true,
      objects: { Group: [], Leaf: [], Recto: [], Verso: [] },
    };
    let gotState = createTerm(termPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator updateTerm', () => {
    const termPayload = {
      payload: {
        request: {
          url: '/terms/5a57825a4cfad13070870df8',
          method: 'put',
          data: {
            term: {
              description: 'Some lot of black ink over here',
              title: 'Black inks',
              type: 'Ink',
              uri: 'https://www.test2.com/',
            },
          },
          successMessage: '',
          errorMessage: '',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(beforeState);
    expectedState.project.Terms['5a57825a4cfad13070870df8'].title =
      'Black inks';
    expectedState.project.Terms['5a57825a4cfad13070870df8'].type = 'Ink';
    expectedState.project.Terms['5a57825a4cfad13070870df8'].description =
      'Some lot of black ink over here';
    expectedState.project.Terms['5a57825a4cfad13070870df8'].uri =
      'https://www.test2.com/';
    let gotState = updateTerm(termPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator linkTerm', () => {
    const termPayload = {
      payload: {
        request: {
          url: '/terms/5a57825a4cfad13070870df8/link',
          method: 'put',
          data: {
            objects: [
              {
                type: 'Verso',
                id: 'Verso_5a57825a4cfad13070870dc6',
              },
              {
                type: 'Leaf',
                id: 'Leaf_5a57825a4cfad13070870dee',
              },
              {
                type: 'Group',
                id: 'Group_5a57825a4cfad13070870df6',
              },
            ],
          },
          successMessage: '',
          errorMessage: '',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(beforeState);
    expectedState.project.Terms['5a57825a4cfad13070870df8'].objects.Group.push(
      'Group_5a57825a4cfad13070870df6'
    );
    expectedState.project.Terms['5a57825a4cfad13070870df8'].objects.Leaf.push(
      'Leaf_5a57825a4cfad13070870dee'
    );
    expectedState.project.Terms['5a57825a4cfad13070870df8'].objects.Verso.push(
      'Verso_5a57825a4cfad13070870dc6'
    );
    expectedState.project.Groups['Group_5a57825a4cfad13070870df6'].terms.push(
      '5a57825a4cfad13070870df8'
    );
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870dee'].terms.push(
      '5a57825a4cfad13070870df8'
    );
    expectedState.project.Versos['Verso_5a57825a4cfad13070870dc6'].terms.push(
      '5a57825a4cfad13070870df8'
    );
    let gotState = linkTerm(termPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator unlinkTerm', () => {
    const termPayload = {
      payload: {
        request: {
          url: '/terms/5a57825a4cfad13070870df8/unlink',
          method: 'put',
          data: {
            objects: [
              {
                type: 'Group',
                id: 'Group_5a57825a4cfad13070870df5',
              },
              {
                type: 'Leaf',
                id: 'Leaf_5a57825a4cfad13070870de8',
              },
            ],
          },
          successMessage: '',
          errorMessage: '',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(beforeState);
    expectedState.project.Terms[
      '5a57825a4cfad13070870df8'
    ].objects.Group.splice(-1, 1);
    expectedState.project.Terms['5a57825a4cfad13070870df8'].objects.Leaf.splice(
      1,
      1
    );
    expectedState.project.Groups['Group_5a57825a4cfad13070870df5'].terms = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870de8'].terms = [];
    let gotState = unlinkTerm(termPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator deleteTerm', () => {
    const termPayload = {
      payload: {
        request: {
          url: '/terms/5a57825a4cfad13070870df8',
          method: 'delete',
          successMessage: '',
          errorMessage: '',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(beforeState);
    delete expectedState.project.Terms['5a57825a4cfad13070870df8'];
    expectedState.project.Groups['Group_5a57825a4cfad13070870df4'].terms = [];
    expectedState.project.Groups['Group_5a57825a4cfad13070870df5'].terms = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870de5'].terms = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870de8'].terms = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870deb'].terms = [];
    let gotState = deleteTerm(termPayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });
});
