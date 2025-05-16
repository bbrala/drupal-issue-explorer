export const ISSUE_STATUSES = {
  1: 'Active',
  13: 'Needs work',
  8: 'Needs review',
  14: 'Reviewed & tested by the community',
  15: 'Patch (to be ported)',
  2: 'Fixed',
  4: 'Postponed',
  16: 'Postponed (maintainer needs more info)',
  3: 'Closed (duplicate)',
  17: 'Closed (outdated)',
  5: 'Closed (won\'t fix)',
  6: 'Closed (works as designed)',
  18: 'Closed (cannot reproduce)',
  7: 'Closed (fixed)',
};

export const ISSUE_STATUSES_SHORT = {
  1: 'Active',
  13: 'NW',
  8: 'NR',
  14: 'RTBC',
  15: 'Patch',
  2: 'Fixed',
  4: 'PP',
  16: 'PP (MNMI)',
  3: 'Closed (dupe)',
  17: 'Closed (outdated)',
  5: 'Closed (WF)',
  6: 'Closed (WAD)',
  18: 'Closed (CR)',
  7: 'Closed (fixed)',
};

export const ISSUE_STATUSES_ORDER = [
  1,
  13,
  8,
  14,
  15,
  2,
  4,
  16,
  3,
  17,
  5,
  6,
  18,
  7,
];

export const CLOSED_OPACITY = '25';
export const HIDDEN_OPACITY = '11';
export const LINK_OPACITY = '50';


export const ISSUE_STATUS_COLORS = {
  1: '#ccc',
  2: '#a8ff98',
  3: '#b5c4fe' + CLOSED_OPACITY,
  4: '#b5c4fe',
  5: '#b5c4fe' + CLOSED_OPACITY,
  6: '#b5c4fe' + CLOSED_OPACITY,
  7: '#fc8596' + CLOSED_OPACITY,
  8: '#ffcf73',
  13: '#ffdccd',
  14: '#bcffb3',
  15: '#bcffb3',
  16: '#b5c4fe',
  17: '#b5c4fe' + CLOSED_OPACITY,
  18: '#fc8596' + CLOSED_OPACITY
};

export const ISSUE_STATUS_COLORS_RAW = {
  1: '#ccc',
  2: '#a8ff98',
  3: '#b5c4fe',
  4: '#b5c4fe',
  5: '#b5c4fe',
  6: '#b5c4fe',
  7: '#fc8596',
  8: '#ffcf73',
  13: '#ffdccd',
  14: '#bcffb3',
  15: '#bcffb3',
  16: '#b5c4fe',
  17: '#b5c4fe',
  18: '#fc8596'
};

export const LINK_COLOURS = {
  'RELATED': '#f34663',
  'MENTIONED': '#2041ef',
  'CHILD': '#18ba18',
  'PARENT': '#9e00ec',
}

export const PROJECTS = {
  '3060': 'Core',
  '3437806': 'XB',
  '3466979': 'Cms'
}
