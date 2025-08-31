// Shim wrapper (Phase 3e) re-exporting domain fieldTypes for backward deep imports.
let _fieldTypesShimWarned = false;
function warnOnceFieldTypes() {
  if (_fieldTypesShimWarned || process.env.JIRA_FF_SUPPRESS_DEPRECATION) return;
  _fieldTypesShimWarned = true;
  console.warn('[jira-field-formatter] Deprecated deep import: use root exports or domain/fieldTypes.js (shim retained temporarily)');
}
warnOnceFieldTypes();

export {
  FieldTypes,
  ARRAY_ITEM_TYPES,
  NAME_FORMAT_TYPES,
  KEY_FORMAT_TYPES,
  DATE_TIME_TYPES,
  isValidFieldType,
  isValidArrayFieldType,
  getFieldFormat
} from './domain/fieldTypes.js';
