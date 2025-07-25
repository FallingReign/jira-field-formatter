/**
 * Validation utilities for Jira field formatting
 */

import { isValidFieldType, isValidArrayFieldType } from '../fieldTypes.js';

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
