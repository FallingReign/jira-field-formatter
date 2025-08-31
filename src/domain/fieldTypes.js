// (Relocated copy of src/fieldTypes.js - Phase 3e structural cleanup)
export const FieldTypes = {
  ISSUE_TYPE: 'issuetype',
  ASSIGNEE: 'assignee',
  REPORTER: 'reporter',
  PRIORITY: 'priority',
  RESOLUTION: 'resolution',
  STATUS: 'status',
  SECURITY_LEVEL: 'securitylevel',
  USER: 'user',
  OPTION: 'option',
  VERSION: 'version',
  COMPONENT: 'component',
  ISSUE_LINK: 'issuelink',
  ISSUE_LINKS: 'issuelinks',
  PROJECT: 'project',
  OPTION_WITH_CHILD: 'option-with-child',
  TIME_TRACKING: 'timetracking',
  ATTACHMENT: 'attachment',
  WATCHES: 'watches',
  SD_SERVICE_LEVEL_AGREEMENT: 'sd-servicelevelagreement',
  SD_APPROVALS: 'sd-approvals',
  SD_CUSTOMER_REQUEST_TYPE: 'sd-customerrequesttype',
  DATE: 'date',
  DATETIME: 'datetime',
  ARRAY: 'array',
  STRING: 'string',
  NUMBER: 'number',
  ANY: 'any'
};

export const ARRAY_ITEM_TYPES = new Set([
  FieldTypes.ISSUE_TYPE,
  FieldTypes.ASSIGNEE,
  FieldTypes.REPORTER,
  FieldTypes.PRIORITY,
  FieldTypes.RESOLUTION,
  FieldTypes.STATUS,
  FieldTypes.SECURITY_LEVEL,
  FieldTypes.USER,
  FieldTypes.OPTION,
  FieldTypes.VERSION,
  FieldTypes.COMPONENT,
  FieldTypes.ISSUE_LINK,
  FieldTypes.ISSUE_LINKS,
  FieldTypes.PROJECT,
  FieldTypes.OPTION_WITH_CHILD,
  FieldTypes.TIME_TRACKING,
  FieldTypes.ATTACHMENT,
  FieldTypes.WATCHES,
  FieldTypes.SD_SERVICE_LEVEL_AGREEMENT,
  FieldTypes.SD_APPROVALS,
  FieldTypes.SD_CUSTOMER_REQUEST_TYPE,
  FieldTypes.DATE,
  FieldTypes.DATETIME,
  FieldTypes.STRING,
  FieldTypes.NUMBER,
  FieldTypes.ANY,
  'checklist-item'
]);

export const NAME_FORMAT_TYPES = new Set([
  FieldTypes.ISSUE_TYPE,
  FieldTypes.ASSIGNEE,
  FieldTypes.REPORTER,
  FieldTypes.PRIORITY,
  FieldTypes.RESOLUTION,
  FieldTypes.STATUS,
  FieldTypes.SECURITY_LEVEL,
  FieldTypes.USER,
  FieldTypes.OPTION,
  FieldTypes.VERSION,
  FieldTypes.COMPONENT,
  FieldTypes.ATTACHMENT,
  FieldTypes.SD_SERVICE_LEVEL_AGREEMENT,
  FieldTypes.SD_APPROVALS,
  FieldTypes.SD_CUSTOMER_REQUEST_TYPE
]);

export const KEY_FORMAT_TYPES = new Set([
  FieldTypes.ISSUE_LINK,
  FieldTypes.ISSUE_LINKS,
  FieldTypes.PROJECT
]);

export const DATE_TIME_TYPES = new Set([
  FieldTypes.DATE,
  FieldTypes.DATETIME
]);

export function isValidFieldType(fieldType) {
  return Object.values(FieldTypes).includes(fieldType);
}

export function isValidArrayFieldType(arrayFieldType) {
  return ARRAY_ITEM_TYPES.has(arrayFieldType);
}

export function getFieldFormat(fieldType) {
  if (NAME_FORMAT_TYPES.has(fieldType)) return 'name';
  if (KEY_FORMAT_TYPES.has(fieldType)) return 'key';
  if (DATE_TIME_TYPES.has(fieldType) || fieldType === FieldTypes.OPTION_WITH_CHILD || fieldType === FieldTypes.TIME_TRACKING) return 'object';
  return 'primitive';
}