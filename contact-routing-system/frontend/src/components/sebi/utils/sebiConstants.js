// src/components/sebi/utils/sebiConstants.js

export const CONTACT_PERSONS = ["Zainab", "Zinat", "Payal", "Farid"];

export const EMAIL_FILTER_OPTIONS = {
  ALL: 'all',
  WITH_EMAIL: 'with-email',
  NO_EMAIL: 'no-email'
};

export const CONTACT_STATUS = {
  CONTACTED: 'contacted',
  NOT_CONTACTED: 'not-contacted',
  NO_EMAIL: 'no-email'
};

export const CONTACT_STATUS_COLORS = {
  [CONTACT_STATUS.CONTACTED]: 'green',
  [CONTACT_STATUS.NOT_CONTACTED]: 'blue',
  [CONTACT_STATUS.NO_EMAIL]: 'gray'
};

export const CONTACT_STATUS_TEXT = {
  [CONTACT_STATUS.CONTACTED]: 'Contacted',
  [CONTACT_STATUS.NOT_CONTACTED]: 'Not Contacted',
  [CONTACT_STATUS.NO_EMAIL]: 'No Email'
};

export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 9,
  MAX_VISIBLE_PAGES: 5
};

export const STORAGE_KEYS = {
  CONTACT_STATUS: 'sebiContactStatus',
  CONTACTED_ENTITIES: 'contactedSebiEntities',
  CONTACT_HISTORY: 'sebiContactHistory',
  SELECTED_ENTITIES: 'selectedSebiEntities'
};

export const MODAL_TYPES = {
  ENTITY_DETAIL: 'entity-detail',
  CONTACT_HISTORY: 'contact-history',
  EMAIL_TEMPLATE: 'email-template'
};

export const FILTER_LABELS = {
  [EMAIL_FILTER_OPTIONS.ALL]: 'All Entities',
  [EMAIL_FILTER_OPTIONS.WITH_EMAIL]: '📧 With Email',
  [EMAIL_FILTER_OPTIONS.NO_EMAIL]: '❌ No Email'
};

export const QUICK_FILTER_BUTTONS = [
  {
    key: EMAIL_FILTER_OPTIONS.ALL,
    label: 'All Entities',
    className: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  {
    key: EMAIL_FILTER_OPTIONS.WITH_EMAIL,
    label: '📧 With Email',
    className: 'bg-green-100 text-green-700 border-green-300'
  },
  {
    key: EMAIL_FILTER_OPTIONS.NO_EMAIL,
    label: '❌ No Email',
    className: 'bg-red-100 text-red-700 border-red-300'
  }
];

export const DEFAULT_FILTERS = {
  search: '',
  state: '',
  city: '',
  emailFilter: EMAIL_FILTER_OPTIONS.ALL
};

export const API_ENDPOINTS = {
  ENTITIES: '/api/sebi/entities',
  STATES: '/api/sebi/states',
  CATEGORIES: '/api/sebi/categories',
  ROUTE: '/api/sebi/route',
  TEST: '/api/test',
  HEALTH: '/health'
};

export const ERROR_MESSAGES = {
  LOAD_ENTITIES: 'Failed to load SEBI entities',
  LOAD_STATES: 'Failed to load states',
  SEARCH_FAILED: 'Search failed',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};

export const SUCCESS_MESSAGES = {
  CONTACT_MARKED: 'Contact marked successfully',
  EMAIL_SENT: 'Email sent successfully',
  DATA_SAVED: 'Data saved successfully'
};

export const COMPONENT_CLASSES = {
  CARD_BASE: 'relative group block p-2 h-full w-full',
  CARD_CONTENT: 'relative z-20 bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/30 group-hover:bg-white/80 group-hover:border-white/50 transition-all duration-200 h-full',
  BUTTON_PRIMARY: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105',
  BUTTON_SECONDARY: 'bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors',
  DROPDOWN_CONTAINER: 'absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[140px] overflow-hidden',
  INPUT_FIELD: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
};

export const ANIMATIONS = {
  FADE_IN: 'transition-opacity duration-300',
  SLIDE_DOWN: 'transition-all duration-200 ease-out',
  SCALE_HOVER: 'transform hover:scale-105 transition-transform duration-200'
};

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px'
};

export const Z_INDEX = {
  DROPDOWN: 50,
  MODAL: 60,
  BACKDROP: 40,
  TOAST: 70
};