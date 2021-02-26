/* This has the following structure
Group 1
  Leaf 1
  Leaf 2
Group 2
  Group 3
    Leaf 3
    Group 4
      Leaf 4
  Leaf 5
*/


export const side0_leaf1 = {
  id: "side0_leaf1_id",
  member_type: "Side",
  leaf_id: "leaf1_id",
  order: 0,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side1_leaf1 = {
  id: "side1_leaf1_id",
  member_type: "Side",
  leaf_id: "leaf1_id",
  order: 1,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side0_leaf2 = {
  id: "side0_leaf2_id",
  member_type: "Side",
  leaf_id: "leaf2_id",
  order: 0,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}


export const side1_leaf2 = {
  id: "side1_leaf2_id",
  member_type: "Side",
  leaf_id: "leaf2_id",
  order: 1,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side0_leaf3 = {
  id: "side0_leaf3_id",
  member_type: "Side",
  leaf_id: "leaf3_id",
  order: 0,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side1_leaf3 = {
  id: "side1_leaf3_id",
  member_type: "Side",
  leaf_id: "leaf3_id",
  order: 1,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side0_leaf4 = {
  id: "side0_leaf4_id",
  member_type: "Side",
  leaf_id: "leaf4_id",
  order: 0,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side1_leaf4 = {
  id: "side1_leaf4_id",
  member_type: "Side",
  leaf_id: "leaf4_id",
  order: 1,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side0_leaf5 = {
  id: "side0_leaf5_id",
  member_type: "Side",
  leaf_id: "leaf5_id",
  order: 0,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}

export const side1_leaf5 = {
  id: "side1_leaf5_id",
  member_type: "Side",
  leaf_id: "leaf5_id",
  order: 1,
  folio_number: "None",
  texture: "None",
  uri: "None",
  script_direction: "None",
  terms: []
}


export const leaf1 = {
  id: "leaf1_id",
  member_type: "Leaf",
  member_order: 1,
  order: 1,
  material: "Paper",
  type: "None",
  conjoined_to: "555",
  attached_to: {
    aboveID: "",
    aboveMethod: "",
    belowID: "",
    belowMethod: ""
  },
  stub: "No",
  terms: [],
  sides: [
    side0_leaf1,
    side1_leaf1
  ]
}

export const leaf2 = {
  id: "leaf2_id",
  member_type: "Leaf",
  member_order: 2,
  order: 2,
  material: "Paper",
  type: "None",
  conjoined_to: "555",
  attached_to: {
    aboveID: "",
    aboveMethod: "",
    belowID: "",
    belowMethod: ""
  },
  stub: "No",
  terms: [],
  sides: [
    side0_leaf2,
    side1_leaf2
  ]
}

export const leaf3 = {
  id: "leaf3_id",
  member_type: "Leaf",
  member_order: 1,
  order: 3,
  material: "None",
  type: "None",
  conjoined_to: "555",
  attached_to: {
    aboveID: "",
    aboveMethod: "",
    belowID: "",
    belowMethod: ""
  },
  stub: "No",
  terms: [],
  sides: [
    side0_leaf3,
    side1_leaf3
  ]
}

export const leaf4 = {
  id: "leaf4_id",
  member_type: "Leaf",
  member_order: 1,
  order: 4,
  material: "None",
  type: "None",
  conjoined_to: "555",
  attached_to: {
    aboveID: "",
    aboveMethod: "",
    belowID: "",
    belowMethod: ""
  },
  stub: "No",
  terms: [],
  sides: [
    side0_leaf4,
    side1_leaf4
  ]
}

export const leaf5 = {
  id: "leaf5_id",
  member_type: "Leaf",
  member_order: 2,
  order: 5,
  material: "None",
  type: "None",
  conjoined_to: "555",
  attached_to: {
    aboveID: "",
    aboveMethod: "",
    belowID: "",
    belowMethod: ""
  },
  stub: "No",
  terms: [],
  sides: [
    side0_leaf5,
    side1_leaf5
  ]
}

export const group1 = {
  id: "group1_id",
  member_type: "Group",
  member_order: 1,
  order: 1,
  title: "Default",
  type: "Quire",
  terms: [],
  members: [
    leaf1,
    leaf2
  ]
}


export const group4 = {
  id: "group4_id",
  member_type: "Group",
  member_order: 2,
  order: 4,
  title: "Default",
  type: "Quire",
  terms: [],
  members: [
    leaf4
  ]
}

export const group3 = {
  id: "group3_id",
  member_type: "Group",
  member_order: 1,
  order: 3,
  title: "Default",
  type: "Quire",
  terms: [],
  members: [
    leaf3,
    group4
  ]
}

export const group2 = {
  id: "group2_id",
  member_type: "Group",
  member_order: 2,
  order: 2,
  title: "Default",
  type: "Quire",
  terms: [],
  members: [
    group3,
    leaf5
  ]
}



export const members = [
  group1,
  group2
]

