// (Relocated copy of src/formatter.js - Phase 3e structural cleanup)
import { FieldTypes, NAME_FORMAT_TYPES, KEY_FORMAT_TYPES } from './fieldTypes.js';
import { formatDateValue, formatDateTimeValue } from '../utils/dateUtils.js';
import { parseTimeTracking } from '../utils/timeUtils.js';
import { isEmpty, sanitizeString, parseNumber, validateFieldTypes, validateValueForFieldType } from '../utils/validationUtils.js';

let _formatterDeprecationWarned = false;

export function formatValue(value, fieldType, arrayFieldType) {
  if (!_formatterDeprecationWarned && !process.env.JIRA_FF_SUPPRESS_DEPRECATION) {
    _formatterDeprecationWarned = true;
    const msg = 'formatValue procedural API is deprecated: migrate to Field/FieldService/IssueService (will be removed in v3.0.0). Set JIRA_FF_SUPPRESS_DEPRECATION=1 to silence.';
    if (process.emitWarning) {
      process.emitWarning(msg, { code: 'JIRA_FF_DEPRECATED' });
    } else {
      console.warn('[jira-field-formatter] ' + msg);
    }
  }
  const validation = validateFieldTypes(fieldType, arrayFieldType);
  if (!validation.isValid) throw new Error(validation.error);
  if (isEmpty(value)) {
    if (fieldType === FieldTypes.WATCHES || fieldType === 'watches') return { watchers: [] };
    return null;
  }
  const valueValidation = validateValueForFieldType(value, fieldType);
  if (!valueValidation.isValid) throw new Error(valueValidation.error);
  const strValue = sanitizeString(value);
  switch (fieldType) {
    case FieldTypes.ISSUE_TYPE:
    case FieldTypes.ASSIGNEE:
    case FieldTypes.REPORTER:
    case FieldTypes.PRIORITY:
    case FieldTypes.RESOLUTION:
    case FieldTypes.STATUS:
    case FieldTypes.SECURITY_LEVEL:
    case FieldTypes.USER:
    case FieldTypes.OPTION:
    case FieldTypes.VERSION:
    case FieldTypes.COMPONENT:
    case FieldTypes.ATTACHMENT:
    case FieldTypes.SD_SERVICE_LEVEL_AGREEMENT:
    case FieldTypes.SD_APPROVALS:
    case FieldTypes.SD_CUSTOMER_REQUEST_TYPE:
      return { name: strValue };
    case FieldTypes.ISSUE_LINK:
    case FieldTypes.ISSUE_LINKS:
    case FieldTypes.PROJECT:
      return { key: strValue };
    case FieldTypes.OPTION_WITH_CHILD:
      return parseOptionWithChild(strValue);
    case FieldTypes.WATCHES:
      return parseWatches(strValue);
    case FieldTypes.DATE:
      return formatDateValue(value);
    case FieldTypes.DATETIME:
      return formatDateTimeValue(value);
    case FieldTypes.TIME_TRACKING:
      return parseTimeTracking(strValue);
    case FieldTypes.ARRAY:
      return formatArrayValue(strValue, arrayFieldType);
    case FieldTypes.NUMBER:
      return parseNumber(strValue);
    case FieldTypes.STRING:
    case FieldTypes.ANY:
    default:
      return strValue;
  }
}

function formatArrayValue(value, arrayFieldType) {
  if (!arrayFieldType) throw new Error('Array field type is required for array fields');
  if (arrayFieldType === 'checklist-item') {
    try { return JSON.parse(value); } catch (e) { throw new Error(`Invalid JSON format for checklist-item: ${e.message}`); }
  }
  return value.split(',').map(v => v.trim()).filter(v => v !== '').map(item => formatValue(item, arrayFieldType));
}

function parseOptionWithChild(value) {
  const parts = value.split('->').map(v => v.trim());
  if (parts.length > 1) return { value: parts[0], child: { value: parts[1] } };
  return { value: parts[0] };
}

function parseWatches(value) {
  if (!value || value.trim() === '') return { watchers: [] };
  const watchers = value.split(',').map(v => v.trim()).filter(Boolean).map(name => ({ name }));
  return { watchers };
}

export function getFieldTypeDefinitions() { return FieldTypes; }
export function validateFieldType(fieldType) { return Object.values(FieldTypes).includes(fieldType); }
export function getFieldTypeInfo(fieldType) {
  if (!validateFieldType(fieldType)) throw new Error(`Invalid field type: ${fieldType}`);
  return { fieldType, format: internalGetFieldFormat(fieldType), isArray: fieldType === FieldTypes.ARRAY, requiresArrayType: fieldType === FieldTypes.ARRAY, description: getFieldTypeDescription(fieldType) };
}

function internalGetFieldFormat(fieldType) {
  if (NAME_FORMAT_TYPES.has(fieldType)) return 'name';
  if (KEY_FORMAT_TYPES.has(fieldType)) return 'key';
  if ([FieldTypes.DATE, FieldTypes.DATETIME, FieldTypes.OPTION_WITH_CHILD, FieldTypes.TIME_TRACKING].includes(fieldType)) return 'object';
  if (fieldType === FieldTypes.ARRAY) return 'array';
  return 'primitive';
}

function getFieldTypeDescription(fieldType) {
  const descriptions = {
    [FieldTypes.ISSUE_TYPE]: 'Issue type (e.g., "Bug", "Story")',
    [FieldTypes.ASSIGNEE]: 'User assigned to the issue',
    [FieldTypes.REPORTER]: 'User who reported the issue',
    [FieldTypes.PRIORITY]: 'Issue priority (e.g., "High", "Low")',
    [FieldTypes.USER]: 'Generic user field',
    [FieldTypes.OPTION]: 'Single select option',
    [FieldTypes.VERSION]: 'Version field',
    [FieldTypes.COMPONENT]: 'Component field',
    [FieldTypes.ATTACHMENT]: 'File attachment reference',
    [FieldTypes.ISSUE_LINK]: 'Link to another issue',
    [FieldTypes.ISSUE_LINKS]: 'Multiple links to other issues',
    [FieldTypes.PROJECT]: 'Project reference',
    [FieldTypes.OPTION_WITH_CHILD]: 'Cascading select field (Parent -> Child)',
    [FieldTypes.TIME_TRACKING]: 'Time tracking (e.g., "2w 3d 4h 30m")',
    [FieldTypes.DATE]: 'Date field (YYYY-MM-DD)',
    [FieldTypes.DATETIME]: 'DateTime field (ISO format)',
    [FieldTypes.ARRAY]: 'Array of values',
    [FieldTypes.STRING]: 'Text string',
    [FieldTypes.NUMBER]: 'Numeric value',
    [FieldTypes.ANY]: 'Any value type'
  };
  return descriptions[fieldType] || 'Unknown field type';
}