/**
 * Examples of using the Jira Field Formatter library
 */

import { Fields, Issues } from '../index.js';

console.log('🚀 Jira Field Formatter (Facade) Examples\n');

// Mock minimal schema set to avoid real network calls
const mockDescriptors = [
  { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } },
  { id: 'priority', name: 'Priority', required: false, schema: { type: 'priority' } },
  { id: 'duedate', name: 'Due Date', required: false, schema: { type: 'date' } },
  { id: 'labels', name: 'Labels', required: false, schema: { type: 'array', items: { type: 'string' } } }
];

const mockClient = { get: async () => ({ ok: true, json: async () => ({ values: mockDescriptors }) }) };

console.log('📝 Single Field (Fields.formatValue):');
// Use a numeric issue type ID (e.g., 10200) to bypass issue type name resolution network calls
const ISSUE_TYPE_ID = '10200';
console.log('Issue Type (mocked unknown -> error):', await Fields.formatValue({ fieldNameOrId: 'Issue Type', value: 'Bug', projectKey: 'DEMO', issueType: ISSUE_TYPE_ID, client: mockClient }));
console.log('Priority:', await Fields.formatValue({ fieldNameOrId: 'Priority', value: 'High', projectKey: 'DEMO', issueType: ISSUE_TYPE_ID, client: mockClient }));
console.log('Due Date (Excel 45290):', await Fields.formatValue({ fieldNameOrId: 'Due Date', value: 45290, projectKey: 'DEMO', issueType: ISSUE_TYPE_ID, client: mockClient }));
console.log();

// Bulk formatting using Fields facade
console.log('📦 Bulk Formatting (Fields.formatValues):');
const raw = { Summary: '  Title  ', Labels: 'one,two', Priority: 'High', Unknown: 'x' };
const formatted = await Fields.formatValues({ values: raw, projectKey: 'DEMO', issueType: ISSUE_TYPE_ID, client: mockClient, options: { omitEmpty: true } });
console.log('Formatted fields:', formatted.fields);
console.log('Unknown fields:', formatted.unknown);
console.log();

// Build an issue payload using Issues facade
console.log('🧠 Issue Payload (Issues.buildPayload):');
const payloadResult = await Issues.buildPayload({ projectKey: 'DEMO', issueType: ISSUE_TYPE_ID, values: raw, options: { omitEmpty: true }, client: mockClient });
console.log('Payload:', payloadResult.payload);
console.log('Diagnostics:', payloadResult.diagnostics);
console.log();

console.log('\n✅ Facade examples completed!');
