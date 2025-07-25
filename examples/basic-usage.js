/**
 * Examples of using the Jira Field Formatter library
 */

import { formatValue, FieldTypes } from '../index.js';

console.log('🚀 Jira Field Formatter Examples\n');

// Basic field types
console.log('📝 Basic Field Types:');
console.log('Issue Type (constant):', formatValue('Bug', FieldTypes.ISSUE_TYPE));
console.log('Issue Type (string):', formatValue('Bug', 'issuetype'));
console.log('Priority (constant):', formatValue('High', FieldTypes.PRIORITY));
console.log('Priority (string):', formatValue('High', 'priority'));
console.log('Resolution:', formatValue('Done', 'resolution'));
console.log('Status:', formatValue('In Progress', 'status'));
console.log('Security Level:', formatValue('Restricted', 'securitylevel'));
console.log('Project:', formatValue('MYPROJ', 'project'));
console.log('Number:', formatValue('42', 'number'));
console.log('String:', formatValue('Hello World', 'string'));
console.log('Attachment:', formatValue('document.pdf', 'attachment'));
console.log('Issue Links:', formatValue('PROJ-123', 'issuelinks'));
console.log();

// Date handling
console.log('📅 Date Handling:');
console.log('Regular date:', formatValue('2023-12-25', 'date'));
console.log('Excel date (45290):', formatValue(45290, 'date'));
console.log('DateTime:', formatValue('2023-12-25T10:30:00Z', 'datetime'));
console.log();

// Array types
console.log('📋 Array Types:');
console.log('Array of options (constant):', formatValue('Red,Green,Blue', FieldTypes.ARRAY, FieldTypes.OPTION));
console.log('Array of options (string):', formatValue('Red,Green,Blue', 'array', 'option'));
console.log('Array of strings:', formatValue('Item1,Item2,Item3', 'array', 'string'));
console.log('Array of versions:', formatValue('1.0,2.0,3.0', 'array', 'version'));
console.log('Array of priorities:', formatValue('High,Medium,Low', 'array', 'priority'));
console.log('Array of resolutions:', formatValue('Done,Won\'t Fix,Duplicate', 'array', 'resolution'));
console.log();

// Special types
console.log('🔧 Special Types:');
console.log('Cascading select (with child):', formatValue('Hardware -> Laptop', 'option-with-child'));
console.log('Cascading select (no child):', formatValue('Hardware', 'option-with-child'));
console.log('Time tracking:', formatValue('2w 3d 4h 30m', 'timetracking'));
console.log('Watches (single user):', formatValue('john.doe', 'watches'));
console.log('Watches (multiple users):', formatValue('john.doe,jane.smith,admin', 'watches'));
console.log('Watches (empty):', formatValue('', 'watches'));
console.log();

// Service Desk specific fields
console.log('🎫 Service Desk Fields:');
console.log('SLA Agreement:', formatValue('Gold Level SLA', 'sd-servicelevelagreement'));
console.log('Approvals:', formatValue('Manager Approval Required', 'sd-approvals'));
console.log('Customer Request Type:', formatValue('Service Request', 'sd-customerrequesttype'));
console.log();

// Empty values
console.log('🚫 Empty Values:');
console.log('Empty string:', formatValue('', 'string'));
console.log('Null value:', formatValue(null, 'string'));
console.log('Whitespace:', formatValue('   ', 'string'));
console.log();

// Error handling example
console.log('⚠️ Error Handling:');
try {
  formatValue('test', 'invalid-type');
} catch (error) {
  console.log('Error caught:', error.message);
}

try {
  formatValue('test', FieldTypes.ARRAY); // Missing array type
} catch (error) {
  console.log('Error caught:', error.message);
}

console.log('\n✅ Examples completed!');
