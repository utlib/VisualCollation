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
    Taxonomies: [],
    Terms: {},
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
            'Sewn',
            'Pasted',
            'Tipped',
            'Drummed',
            'Stitched',
            'Other',
          ],
          isDropdown: true,
        },
        {
          name: 'attached_below',
          displayName: 'Attached Below',
          options: [
            'None',
            'Sewn',
            'Pasted',
            'Tipped',
            'Drummed',
            'Stitched',
            'Other',
          ],
          isDropdown: true,
        },
        {
          name: 'stub',
          displayName: 'Stub',
          options: ['No', 'Yes'],
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
      term: [
        {
          name: 'title',
          displayName: 'Title',
        },
        {
          name: 'taxonomy',
          displayName: 'Taxonomy',
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
      Terms: [],
      GroupsOfMatchingLeafs: [],
      LeafsOfMatchingSides: [],
      GroupsOfMatchingSides: [],
      GroupsOfMatchingTerms: [],
      LeafsOfMatchingTerms: [],
      SidesOfMatchingTerms: [],
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
  termsManager: {
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
