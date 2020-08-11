export const initialState = {
  project: {
    id: '',
    title: '',
    shelfmark: '',
    uri: '',
    notationStyle: {
      name: 'notationStyle',
      displayName: 'Notation Style',
      options: ['r-v', 'recto-verso', 'a-b'],
      isDropdown: true,
    },
    metadata: {
      date: '',
    },
    manifests: {
      DIYImages: {
        id: 'DIYImages',
        name: 'Uploaded Images',
        images: [],
      },
    },
    groupIDs: [],
    leafIDs: [],
    rectoIDs: [],
    versoIDs: [],
    Groups: {},
    Leafs: {},
    Rectos: {},
    Versos: {},
    noteTypes: [],
    Notes: {},
    preferences: {
      showTips: true,
    },
  },

  managerMode: 'collationManager',
  collationManager: {
    selectedObjects: {
      type: '',
      members: [],
      lastSelected: '',
    },
    viewMode: 'VISUAL',
    defaultAttributes: {
      leaf: [
        {
          name: 'type',
          displayName: 'Type',
          options: [
            'None',
            'Original',
            'Added',
            'Missing',
            'Hook',
            'Endleaf',
            'Replaced',
          ],
          isDropdown: true,
        },
        {
          name: 'material',
          displayName: 'Material',
          options: ['None', 'Parchment', 'Paper', 'Other'],
          isDropdown: true,
        },
        {
          name: 'conjoined_to',
          displayName: 'Conjoined To',
          isDropdown: true,
        },
        {
          name: 'attached_above',
          displayName: 'Attached Above',
          options: [
            'None',
            'Glued (Partial)',
            'Glued (Complete)',
            'Glued (Drumming)',
            'Other',
          ],
          isDropdown: true,
        },
        {
          name: 'attached_below',
          displayName: 'Attached Below',
          options: [
            'None',
            'Glued (Partial)',
            'Glued (Complete)',
            'Glued (Drumming)',
            'Other',
          ],
          isDropdown: true,
        },
        {
          name: 'stub',
          displayName: 'Stub',
          options: ['None', 'Original', 'Added'],
          isDropdown: true,
        },
        {
          name: 'folio_number',
          displayName: 'Folio Number',
        },
      ],
      group: [
        {
          name: 'type',
          displayName: 'Type',
          options: ['Quire', 'Booklet'],
          isDropdown: true,
        },
        {
          name: 'title',
          displayName: 'Title',
        },
      ],
      side: [
        {
          name: 'texture',
          displayName: 'Texture',
          options: ['None', 'Hair', 'Flesh', 'Felt', 'Wire'],
          isDropdown: true,
        },
        {
          name: 'script_direction',
          displayName: 'Script Direction',
          options: ['None', 'Left-to-Right', 'Right-To-Left', 'Top-To-Bottom'],
          isDropdown: true,
        },
        {
          name: 'page_number',
          displayName: 'Page Number',
        },
        {
          name: 'uri',
          displayName: 'URI',
        },
      ],
      note: [
        {
          name: 'title',
          displayName: 'Title',
        },
        {
          name: 'type',
          displayName: 'Type',
          isDropdown: true,
        },
        {
          name: 'description',
          displayName: 'Description',
        },
        {
          name: 'uri',
          displayName: 'URI',
        },
      ],
    },
    filters: {
      filterPanelOpen: false,
      Groups: [],
      Leafs: [],
      Sides: [],
      Notes: [],
      GroupsOfMatchingLeafs: [],
      LeafsOfMatchingSides: [],
      GroupsOfMatchingSides: [],
      GroupsOfMatchingNotes: [],
      LeafsOfMatchingNotes: [],
      SidesOfMatchingNotes: [],
      active: false,
      hideOthers: false,
      queries: [
        {
          type: null,
          attribute: '',
          attributeIndex: '',
          values: [],
          condition: '',
          conjunction: '',
        },
      ],
      selection: '',
    },
    flashItems: {
      leaves: [],
      groups: [],
    },
    visualizations: {
      tacketed: '',
      sewing: '',
    },
  },
  notesManager: {
    activeTab: 'MANAGE',
  },
  imageManager: {
    activeTab: 'MANAGE',
    manageSources: {
      error: '',
    },
  },
  exportedData: '',
  exportedImages: '',
};

export default initialState;
