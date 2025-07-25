/**
 * Jira Field Formatter Library
 * A standalone Node.js library for formatting field values to be compatible with the Jira REST API
 */

// Main exports
export {
  formatValue,
  getFieldTypeDefinitions,
  validateFieldType,
  getFieldTypeInfo
} from './src/formatter.js';

// Field type constants
export {
  FieldTypes,
  ARRAY_ITEM_TYPES,
  isValidFieldType,
  isValidArrayFieldType,
  getFieldFormat
} from './src/fieldTypes.js';

// Utility functions
export {
  formatDateValue,
  formatDateTimeValue
} from './src/utils/dateUtils.js';

export {
  parseTimeTracking,
  isValidTimeTrackingFormat,
  parseTimeComponents
} from './src/utils/timeUtils.js';

export {
  isEmpty,
  isJiraKey,
  validateFieldTypes,
  sanitizeString,
  parseNumber,
  validateValueForFieldType
} from './src/utils/validationUtils.js';

// Default export for convenience
export { formatValue as default } from './src/formatter.js';
