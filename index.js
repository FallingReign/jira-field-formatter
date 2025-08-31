/**
 * Jira Field Formatter Library
 * A standalone Node.js library for formatting field values to be compatible with the Jira REST API
 */

// Main exports (domain-owned implementations consolidated in Phase 3e/3f)
export {
  formatValue,
  getFieldTypeDefinitions,
  validateFieldType,
  getFieldTypeInfo,
  FieldTypes,
  ARRAY_ITEM_TYPES,
  isValidFieldType,
  isValidArrayFieldType,
  getFieldFormat
} from './src/domain/index.js';

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
  isAlreadyFormatted,
  validateFieldTypes,
  sanitizeString,
  parseNumber,
  validateValueForFieldType
} from './src/utils/validationUtils.js';

// Jira API functions (refactored in Phase 3a)
export {
  JiraApiClient,
  UsersApi,
  IssuesApi,
  FieldsApi
} from './src/api/index.js';

// Domain exports (Phase 3b)
export {
  Field,
  mapSchemaToFieldType
} from './src/domain/index.js';

// Service layer exports (Phase 3c)
export {
  FieldService
} from './src/services/index.js';

// Issue orchestration (Phase 3d)
export {
  IssueService,
  formatIssueFields,
  validateIssueFields,
  createIssue
} from './src/services/index.js';

// Removed deprecated JiraApi & JiraHttpClient in v2.0.0 (use JiraApiClient + specific APIs)

// Default export for convenience
export { formatValue as default } from './src/domain/index.js';
