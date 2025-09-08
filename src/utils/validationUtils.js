/**
 * Validation utilities for Jira field formatting
 */

// Using domain-owned field type taxonomy (v3.0.0 consolidated in Field.js)
// Legacy domain Field removed; lightweight internal validators retained

function isValidFieldType(fieldType){
  // Accept broad primitive + known jira value wrappers for backward compatibility where used internally
  const allowed = new Set(['string','number','date','datetime','array','option','user','project','priority','issuetype','option-with-child','timeTracking','any']);
  return allowed.has(fieldType);
}

function isValidArrayFieldType(t){
  return isValidFieldType(t); // relaxed – arrays may contain any base type we recognize
}

/**
 * Check if a value is empty (null, undefined, or empty string)
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is empty
 */
export function isEmpty(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/**
 * Check if a value is a valid Jira key format (e.g., "PROJ-123")
 * @param {string} value - The value to check
 * @returns {boolean} True if the value matches Jira key format
 */
export function isJiraKey(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return /^[A-Z]+-\d+$/.test(value);
}

/**
 * Check if a value is already properly formatted for its field type
 * This helps determine if we should leave a value alone (power user case) 
 * or format it (casual user case)
 * @param {any} value - The value to check
 * @param {string} fieldType - The expected Jira field type
 * @returns {boolean} True if already properly formatted
 */
export function isAlreadyFormatted(value, fieldType) {
  if (isEmpty(value)) return false;
  
  // Handle both FieldTypes constants and string field types
  const normalizedType = typeof fieldType === 'string' ? fieldType.toLowerCase() : fieldType;
  
  switch (normalizedType) {
    case 'option-with-child':
      // Cascading fields should be objects with 'value' or 'id' property
      return typeof value === 'object' && value !== null && 
             ('value' in value || 'id' in value);
             
    case 'priority':
    case 'issuetype':
    case 'user':
    case 'assignee':
    case 'reporter':
    case 'resolution':
    case 'status':
    case 'securitylevel':
    case 'option':
    case 'version':
    case 'component':
    case 'attachment':
      // These fields should be objects with 'name' or 'id' property
      return typeof value === 'object' && value !== null && 
             ('name' in value || 'id' in value);
             
    case 'project':
    case 'issuelink':
    case 'issuelinks':
      // These fields should be objects with 'key' or 'id' property
      return typeof value === 'object' && value !== null && 
             ('key' in value || 'id' in value);
             
    case 'array':
      // Arrays should already be arrays
      return Array.isArray(value);
      
    case 'date':
      // Check for YYYY-MM-DD format
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
      
    case 'datetime':
      // Check for ISO datetime format
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
      
    case 'timetracking':
      // Time tracking should be an object with originalEstimate/remainingEstimate
      return typeof value === 'object' && value !== null &&
             ('originalEstimate' in value || 'remainingEstimate' in value);
             
    case 'watches':
      // Watches should be an object with watchers array
      return typeof value === 'object' && value !== null && 'watchers' in value;
      
    case 'string':
    case 'number':
    case 'any':
    default:
      // These types accept primitive values, so they're always "formatted"
      // We return true to avoid unnecessary formatting
      return true;
  }
}

/**
 * Validate field type and array field type combination
 * @param {string} fieldType - The primary field type
 * @param {string} [arrayFieldType] - The array field type (if fieldType is 'array')
 * @returns {object} Validation result with isValid and error message
 */
export function validateFieldTypes(fieldType, arrayFieldType) {
  if (!isValidFieldType(fieldType)) {
    return {
      isValid: false,
      error: `Invalid field type: ${fieldType}`
    };
  }

  if (fieldType === 'array') {
    if (!arrayFieldType) {
      return {
        isValid: false,
        error: 'Array field type is required when fieldType is "array"'
      };
    }
    if (!isValidArrayFieldType(arrayFieldType)) {
      return {
        isValid: false,
        error: `Invalid array field type: ${arrayFieldType}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitize string input by trimming whitespace
 * @param {any} value - The value to sanitize
 * @returns {string} Sanitized string value
 */
export function sanitizeString(value) {
  return String(value).trim();
}

/**
 * Parse and validate a numeric value
 * @param {any} value - The value to parse
 * @returns {number|null} Parsed number or null if invalid
 */
export function parseNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Validate that a value can be converted to the expected field type
 * @param {any} value - The value to validate
 * @param {string} fieldType - The expected field type
 * @returns {object} Validation result with isValid and error message
 */
export function validateValueForFieldType(value, fieldType) {
  // Empty values are generally acceptable (will be converted to null)
  if (isEmpty(value)) {
    return { isValid: true };
  }

  switch (fieldType) {
    case 'number':
      // For numbers, we'll let the formatter handle validation
      // and return null for invalid numbers instead of throwing
      break;

    case 'date':
    case 'datetime':
      // We'll let the date formatting functions handle validation
      break;

    case 'array':
      // Arrays can accept various formats, validation happens in the formatter
      break;

    default:
      // Most other types accept string values
      break;
  }

  return { isValid: true };
}
