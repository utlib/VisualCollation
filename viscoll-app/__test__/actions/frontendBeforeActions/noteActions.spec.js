import {
  createNoteType,
  updateNoteType,
  deleteNoteType,
  createNote,
  updateNote,
  linkNote,
  unlinkNote,
  deleteNote,
} from '../../../src/actions/frontend/before/termActions';

import { projectState001 } from '../../testData/projectState001';

import { cloneDeep } from 'lodash';

describe('>>>A C T I O N --- Test note actions', () => {
  it('+++ actionCreator createNoteType', () => {
    const noteTypePayload = {
      payload: {
        request: {
          url: `/notes/type`,
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
          url: '/notes/type',
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
    expectedState.project.Notes['5a57825a4cfad13070870dfa'].type = 'Damages';
    let gotState = updateNoteType(noteTypePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator deleteNoteType', () => {
    const noteTypePayload = {
      payload: {
        request: {
          url: '/notes/type',
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
    expectedState.project.Notes['5a57825a4cfad13070870df9'].type = 'Unknown';
    let gotState = deleteNoteType(noteTypePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator createNote', () => {
    const notePayload = {
      payload: {
        request: {
          url: '/notes',
          method: 'post',
          data: {
            note: {
              id: 'f951303fc9bf3c7b9a573a3f',
              project_id: '5951303fc9bf3c7b9a573a3f',
              title: 'Example Note',
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
    expectedState.project.Notes['f951303fc9bf3c7b9a573a3f'] = {
      id: 'f951303fc9bf3c7b9a573a3f',
      title: 'Example Note',
      type: 'asd',
      description: 'example content',
      uri: 'https://www.test.com/',
      show: true,
      objects: { Group: [], Leaf: [], Recto: [], Verso: [] },
    };
    let gotState = createNote(notePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator updateNote', () => {
    const notePayload = {
      payload: {
        request: {
          url: '/notes/5a57825a4cfad13070870df8',
          method: 'put',
          data: {
            note: {
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
    expectedState.project.Notes['5a57825a4cfad13070870df8'].title =
      'Black inks';
    expectedState.project.Notes['5a57825a4cfad13070870df8'].type = 'Ink';
    expectedState.project.Notes['5a57825a4cfad13070870df8'].description =
      'Some lot of black ink over here';
    expectedState.project.Notes['5a57825a4cfad13070870df8'].uri =
      'https://www.test2.com/';
    let gotState = updateNote(notePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator linkNote', () => {
    const notePayload = {
      payload: {
        request: {
          url: '/notes/5a57825a4cfad13070870df8/link',
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
    expectedState.project.Notes['5a57825a4cfad13070870df8'].objects.Group.push(
      'Group_5a57825a4cfad13070870df6'
    );
    expectedState.project.Notes['5a57825a4cfad13070870df8'].objects.Leaf.push(
      'Leaf_5a57825a4cfad13070870dee'
    );
    expectedState.project.Notes['5a57825a4cfad13070870df8'].objects.Verso.push(
      'Verso_5a57825a4cfad13070870dc6'
    );
    expectedState.project.Groups['Group_5a57825a4cfad13070870df6'].notes.push(
      '5a57825a4cfad13070870df8'
    );
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870dee'].notes.push(
      '5a57825a4cfad13070870df8'
    );
    expectedState.project.Versos['Verso_5a57825a4cfad13070870dc6'].notes.push(
      '5a57825a4cfad13070870df8'
    );
    let gotState = linkNote(notePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator unlinkNote', () => {
    const notePayload = {
      payload: {
        request: {
          url: '/notes/5a57825a4cfad13070870df8/unlink',
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
    expectedState.project.Notes[
      '5a57825a4cfad13070870df8'
    ].objects.Group.splice(-1, 1);
    expectedState.project.Notes['5a57825a4cfad13070870df8'].objects.Leaf.splice(
      1,
      1
    );
    expectedState.project.Groups['Group_5a57825a4cfad13070870df5'].notes = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870de8'].notes = [];
    let gotState = unlinkNote(notePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });

  it('+++ actionCreator deleteNote', () => {
    const notePayload = {
      payload: {
        request: {
          url: '/notes/5a57825a4cfad13070870df8',
          method: 'delete',
          successMessage: '',
          errorMessage: '',
        },
      },
    };
    const beforeState = cloneDeep(projectState001);
    let expectedState = cloneDeep(beforeState);
    delete expectedState.project.Notes['5a57825a4cfad13070870df8'];
    expectedState.project.Groups['Group_5a57825a4cfad13070870df4'].notes = [];
    expectedState.project.Groups['Group_5a57825a4cfad13070870df5'].notes = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870de5'].notes = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870de8'].notes = [];
    expectedState.project.Leafs['Leaf_5a57825a4cfad13070870deb'].notes = [];
    let gotState = deleteNote(notePayload, beforeState);
    expect(gotState).toEqual(expectedState);
  });
});
