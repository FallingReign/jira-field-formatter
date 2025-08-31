// Shim wrapper (Phase 3e) re-exporting domain formatter for backward deep imports.
// Will be removed in a future minor/major once consumers migrate.
let _shimWarned = false;
function warnOnce() {
  if (_shimWarned || process.env.JIRA_FF_SUPPRESS_DEPRECATION) return;
  _shimWarned = true;
  console.warn('[jira-field-formatter] Deprecated deep import: use root exports or domain/formatter.js (shim retained temporarily)');
}
warnOnce();

export {
  formatValue,
  getFieldTypeDefinitions,
  validateFieldType,
  getFieldTypeInfo
} from './domain/formatter.js';

export { formatValue as default } from './domain/formatter.js';
