/**
 * Jira Field Type Definitions
 * Comprehensive list of all supported Jira field types and their configurations
 */

/**
 * Primary field types supported by Jira
 */
export const FieldTypes = {
  // Object reference types (use { name: value } format)
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

  // Key reference types (use { key: value } format)
  ISSUE_LINK: 'issuelink',
  ISSUE_LINKS: 'issuelinks', // Multiple issue links
  PROJECT: 'project',

  // Special object types
  OPTION_WITH_CHILD: 'option-with-child', // Cascading select fields
  TIME_TRACKING: 'timetracking',
  ATTACHMENT: 'attachment',
  WATCHES: 'watches', // Watchers object
  
  // Service Desk specific fields
  SD_SERVICE_LEVEL_AGREEMENT: 'sd-servicelevelagreement',
  SD_APPROVALS: 'sd-approvals',
  SD_CUSTOMER_REQUEST_TYPE: 'sd-customerrequesttype',

  // Date/time types
  DATE: 'date',
  DATETIME: 'datetime',

  // Array types
  ARRAY: 'array',

  // Primitive types
  STRING: 'string',
  NUMBER: 'number',
  ANY: 'any'
};

/**
 * Field types that can be used as array items
 * These are the same as FieldTypes except 'array' (no nested arrays)
 */
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
  // Special array-only types
  'checklist-item'
]);

/**
 * Field types that use { name: value } format
 */
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

/**
 * Field types that use { key: value } format
 */
export const KEY_FORMAT_TYPES = new Set([
  FieldTypes.ISSUE_LINK,
  FieldTypes.ISSUE_LINKS,
  FieldTypes.PROJECT
]);

/**
 * Date/time field types
 */
export const DATE_TIME_TYPES = new Set([
  FieldTypes.DATE,
  FieldTypes.DATETIME
]);

/**
 * Check if a field type is valid
 * @param {string} fieldType - The field type to validate
 * @returns {boolean} True if the field type is valid
 */
export function isValidFieldType(fieldType) {
  return Object.values(FieldTypes).includes(fieldType);
}

/**
 * Check if an array field type is valid
 * @param {string} arrayFieldType - The array field type to validate
 * @returns {boolean} True if the array field type is valid
 */
export function isValidArrayFieldType(arrayFieldType) {
  return ARRAY_ITEM_TYPES.has(arrayFieldType);
}

/**
 * Get the expected format for a field type
 * @param {string} fieldType - The field type
 * @returns {string} The expected format ('name', 'key', 'object', 'primitive')
 */
export function getFieldFormat(fieldType) {
  if (NAME_FORMAT_TYPES.has(fieldType)) {
    return 'name';
  }
  if (KEY_FORMAT_TYPES.has(fieldType)) {
    return 'key';
  }
  if (DATE_TIME_TYPES.has(fieldType) || fieldType === FieldTypes.OPTION_WITH_CHILD || fieldType === FieldTypes.TIME_TRACKING) {
    return 'object';
  }
  return 'primitive';
}
