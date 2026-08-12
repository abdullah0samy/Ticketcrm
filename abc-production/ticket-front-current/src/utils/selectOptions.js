export const department_options = [
  {
    value: 1,
    label: "it",
  },
  {
    value: 2,
    label: "supply chain",
  },
];

export const building_options = [
  {
    value: "building_1",
    label: "building_1",
  },
  {
    value: "building_2",
    label: "building_2",
  },
  {
    value: "stores",
    label: "stores",
  },
];

export const floor_options = {
  building_1: [
    {
      value: "floor_1",
      label: "floor_1",
    },
    {
      value: "laboratory",
      label: "laboratory",
    },
    {
      value: "endoscopy",
      label: "endoscopy",
    },
    {
      value: "or",
      label: "or",
    },
    {
      value: "floor_3",
      label: "floor_3",
    },
    {
      value: "floor_4",
      label: "floor_4",
    },
    {
      value: "floor_5",
      label: "floor_5",
    },
    {
      value: "floor_6",
      label: "floor_6",
    },
    {
      value: "floor_7",
      label: "floor_7",
    },
    {
      value: "ground",
      label: "ground",
    },
    {
      value: "basement",
      label: "basement",
    },
  ],
  building_2: [
    {
      value: "floor_1",
      label: "floor_1",
    },
    {
      value: "floor_2",
      label: "floor_2",
    },
    {
      value: "ground",
      label: "ground",
    },
    {
      value: "admin",
      label: "admin",
    },
  ],
  stores: [
    {
      value: "el_hegaz",
      label: "el-hegaz",
    },
    {
      value: "lebanon_sqaure",
      label: "lebanon-square",
    },
  ],
};

export const chunks_options = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
];

export const size_options = [
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "30", value: "30" },
  { label: "40", value: "40" },
  { label: "50", value: "50" },
];

export const status_options = [
  { label: "complete", value: "complete" },
  { label: "in_progress", value: "in_progress" },
  { label: "on_hold", value: "on_hold" },
];

export const mappingStatusValue = {
  "on hold": "on_hold",
  "in progress": "in_progress",
  "complete": "complete",
  "closed": "closed",
  "قيد الانتظار": "on_hold",
  "قيد التقدم": "in_progress",
  "مغلقه": "closed",
  "مكتملة": "complete",
};
