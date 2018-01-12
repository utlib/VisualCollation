export const initialState = {
  project: {
    id: "",
    title: "",
    shelfmark: "",
    uri: "",
    metadata: {
      date: ""
    },
    manifests: {
      "DIYImages": {
        id: "DIYImages",
        name: "Uploaded Images",
        images: [],
      }
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
      showTips: true
    }
  },

  managerMode: "collationManager",
  collationManager: {
    selectedObjects: { 
      type: "", 
      members: [], 
      lastSelected: "" 
    },
    viewMode: "VISUAL",
    visibleAttributes: {
      group: {
        type:false, 
        title:false
      },
      leaf: {
        type:false, 
        material:false, 
        conjoined_leaf_order:false, 
        attached_below:false, 
        attached_above:false, 
        stub:false
      },
      side: {
        folio_number:false, 
        texture:false, 
        script_direction:false, 
        uri:false
      }
    },
    defaultAttributes: {
      leaf: [
        {
          name: 'type',
          displayName: 'Type',
          options: ['None', 'Original', 'Added', 'Missing', 'Hook', 'Endleaf', 'Replaced'],
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
          options: ['None', 'Glued (Partial)', 'Glued (Complete)', 'Glued (Drumming)', 'Other'],
          isDropdown: true,
        },
        {
          name: 'attached_below',
          displayName: 'Attached Below',
          options: ['None', 'Glued (Partial)', 'Glued (Complete)', 'Glued (Drumming)', 'Other'],
          isDropdown: true,
        },
        {
          name: 'stub',
          displayName: 'Stub',
          options: ['None', 'Original', 'Added'],
          isDropdown: true,
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
          name: 'folio_number',
          displayName: 'Folio Number',
        },

        {
          name: 'script_direction',
          displayName: 'Script Direction',
          options: ['None', 'Left-to-Right', 'Right-To-Left', 'Top-To-Bottom'],
          isDropdown: true,
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
      ]
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
          attribute: "",
          attributeIndex: "",
          values: [],
          condition: "",
          conjunction: "",
        }
      ],
      selection: ""
    },
    flashItems: { 
      leaves: [],
      groups: []
    },
    visualizations: {
      tacketed: "",
      sewing: "",
    }
  },
  notesManager: {
    activeTab: "MANAGE",
  },
  imageManager: {
    activeTab: "MANAGE",
    manageSources: {
      error: ""
    }
  },
  exportedData: "",
  exportedImages: ""
};


export default initialState;
