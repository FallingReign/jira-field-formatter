/**
 * Examples of using the Jira Field Formatter library
 */

import { formatFieldValue, FieldTypes } from '../index.js';

console.log('🚀 Jira Field Formatter Examples\n');

// Basic field types
console.log('📝 Basic Field Types:');
console.log('Issue Type (constant):', formatFieldValue('Bug', FieldTypes.ISSUE_TYPE));
console.log('Issue Type (string):', formatFieldValue('Bug', 'issuetype'));
console.log('Priority (constant):', formatFieldValue('High', FieldTypes.PRIORITY));
console.log('Priority (string):', formatFieldValue('High', 'priority'));
console.log('Resolution:', formatFieldValue('Done', 'resolution'));
console.log('Status:', formatFieldValue('In Progress', 'status'));
console.log('Security Level:', formatFieldValue('Restricted', 'securitylevel'));
console.log('Project:', formatFieldValue('MYPROJ', 'project'));
console.log('Number:', formatFieldValue('42', 'number'));
console.log('String:', formatFieldValue('Hello World', 'string'));
console.log('Attachment:', formatFieldValue('document.pdf', 'attachment'));
console.log('Issue Links:', formatFieldValue('PROJ-123', 'issuelinks'));
console.log();

// Date handling
console.log('📅 Date Handling:');
console.log('Regular date:', formatFieldValue('2023-12-25', 'date'));
console.log('Excel date (45290):', formatFieldValue(45290, 'date'));
console.log('DateTime:', formatFieldValue('2023-12-25T10:30:00Z', 'datetime'));
console.log();

// Array types
console.log('📋 Array Types:');
console.log('Array of options (constant):', formatFieldValue('Red,Green,Blue', FieldTypes.ARRAY, FieldTypes.OPTION));
console.log('Array of options (string):', formatFieldValue('Red,Green,Blue', 'array', 'option'));
console.log('Array of strings:', formatFieldValue('Item1,Item2,Item3', 'array', 'string'));
console.log('Array of versions:', formatFieldValue('1.0,2.0,3.0', 'array', 'version'));
console.log('Array of priorities:', formatFieldValue('High,Medium,Low', 'array', 'priority'));
console.log('Array of resolutions:', formatFieldValue('Done,Won\'t Fix,Duplicate', 'array', 'resolution'));
console.log();

// Special types
console.log('🔧 Special Types:');
console.log('Cascading select (with child):', formatFieldValue('Hardware -> Laptop', 'option-with-child'));
console.log('Cascading select (no child):', formatFieldValue('Hardware', 'option-with-child'));
console.log('Time tracking:', formatFieldValue('2w 3d 4h 30m', 'timetracking'));
console.log('Watches (single user):', formatFieldValue('john.doe', 'watches'));
console.log('Watches (multiple users):', formatFieldValue('john.doe,jane.smith,admin', 'watches'));
console.log('Watches (empty):', formatFieldValue('', 'watches'));
console.log();

// Service Desk specific fields
console.log('🎫 Service Desk Fields:');
console.log('SLA Agreement:', formatFieldValue('Gold Level SLA', 'sd-servicelevelagreement'));
console.log('Approvals:', formatFieldValue('Manager Approval Required', 'sd-approvals'));
console.log('Customer Request Type:', formatFieldValue('Service Request', 'sd-customerrequesttype'));
console.log();

// Empty values
console.log('🚫 Empty Values:');
console.log('Empty string:', formatFieldValue('', 'string'));
console.log('Null value:', formatFieldValue(null, 'string'));
console.log('Whitespace:', formatFieldValue('   ', 'string'));
console.log();

// Error handling example
console.log('⚠️ Error Handling:');
try {
  formatFieldValue('test', 'invalid-type');
} catch (error) {
  console.log('Error caught:', error.message);
}

try {
  formatFieldValue('test', FieldTypes.ARRAY); // Missing array type
} catch (error) {
  console.log('Error caught:', error.message);
}

console.log('\n✅ Examples completed!');
