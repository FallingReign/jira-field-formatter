// Schema Investigation Script
// This script fetches real Jira schema data to understand field type structures

import { FieldsApi, JiraApiClient } from './src/api/index.js';

console.log('=== Jira Schema Investigation ===\n');

// Configuration - you'll need to set these
const JIRA_CONFIG = {
  baseUrl: process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net',
  email: process.env.JIRA_EMAIL || 'your-email@domain.com',
  token: process.env.JIRA_TOKEN || 'your-api-token',
  projectKey: process.env.JIRA_PROJECT || 'ZUL',
  issueType: process.env.JIRA_ISSUE_TYPE || 'Task'
};

// Fields we want to investigate
const FIELDS_OF_INTEREST = [
  'fixVersions',
  'labels', 
  'components',
  'versions',
  'summary',
  'description',
  'priority',
  'assignee'
];

async function investigateFieldSchemas() {
  try {
    console.log('📡 Connecting to Jira...');
    console.log(`   Base URL: ${JIRA_CONFIG.baseUrl}`);
    console.log(`   Project: ${JIRA_CONFIG.projectKey}`);
    console.log(`   Issue Type: ${JIRA_CONFIG.issueType}\n`);

    // Create API clients
    const jiraClient = new JiraApiClient(JIRA_CONFIG.baseUrl, JIRA_CONFIG.email, JIRA_CONFIG.token);
    const fieldsApi = new FieldsApi(jiraClient);

    // Get all field schemas for the issue type
    console.log('🔍 Fetching all field schemas...');
    const allSchemas = await fieldsApi.getAllFieldSchemas(
      JIRA_CONFIG.projectKey, 
      JIRA_CONFIG.issueType,
      console
    );

    if (!allSchemas || allSchemas.length === 0) {
      console.log('❌ No schemas found. Check your configuration.');
      return;
    }

    console.log(`✅ Found ${allSchemas.length} field schemas\n`);

    // Filter and display schemas for fields of interest
    console.log('📋 FIELD SCHEMAS OF INTEREST:');
    console.log('=' .repeat(60));

    for (const fieldName of FIELDS_OF_INTEREST) {
      const schema = findFieldByName(allSchemas, fieldName);
      
      if (schema) {
        console.log(`\n🔧 FIELD: ${schema.name} (${schema.key})`);
        console.log('   Schema Structure:');
        console.log('   ' + JSON.stringify(schema.schema, null, 2).replace(/\n/g, '\n   '));
        console.log('   Required:', schema.required || false);
        
        // Analyze what our current mapper would do
        try {
          analyzeCurrentMapping(schema);
        } catch (e) {
          console.log(`   ❌ Current mapper fails: ${e.message}`);
        }
      } else {
        console.log(`\n❌ FIELD NOT FOUND: ${fieldName}`);
      }
    }

    // Display some custom fields for reference
    console.log('\n\n📋 SAMPLE CUSTOM FIELDS:');
    console.log('=' .repeat(60));
    
    const customFields = allSchemas
      .filter(s => s.key && s.key.startsWith('customfield_'))
      .slice(0, 3);

    for (const field of customFields) {
      console.log(`\n🔧 CUSTOM FIELD: ${field.name} (${field.key})`);
      console.log('   Schema:');
      console.log('   ' + JSON.stringify(field.schema, null, 2).replace(/\n/g, '\n   '));
    }

    console.log('\n\n🎯 ANALYSIS SUMMARY:');
    console.log('=' .repeat(60));
    console.log('Use the schema structures above to enhance the SchemaParser.');
    console.log('Focus on the differences between:');
    console.log('- Single value fields vs arrays');
    console.log('- String arrays vs object arrays');
    console.log('- Version fields vs generic options');

  } catch (error) {
    console.error('❌ Error investigating schemas:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Tips:');
      console.log('- Check your JIRA_EMAIL and JIRA_TOKEN environment variables');
      console.log('- Ensure the API token has proper permissions');
    }
    
    if (error.message.includes('404')) {
      console.log('\n💡 Tips:');
      console.log('- Check your JIRA_PROJECT and JIRA_ISSUE_TYPE environment variables');
      console.log('- Ensure the project key and issue type exist');
    }
  }
}

function findFieldByName(schemas, targetName) {
  const normalized = targetName.toLowerCase();
  return schemas.find(schema => 
    (schema.name && schema.name.toLowerCase() === normalized) ||
    (schema.key && schema.key.toLowerCase() === normalized)
  );
}

function analyzeCurrentMapping(fieldSchema) {
  // Import the current mapping function
  import('./src/domain/Field.js').then(({ mapSchemaToFieldType }) => {
    try {
      const result = mapSchemaToFieldType(fieldSchema);
      console.log(`   ✅ Current mapping: ${result.fieldType}${result.arrayItemType ? ` (array of ${result.arrayItemType})` : ''}`);
    } catch (e) {
      console.log(`   ❌ Current mapper fails: ${e.message}`);
    }
  });
}

// Usage instructions
if (process.argv.length < 3) {
  console.log('📖 USAGE:');
  console.log('Set environment variables and run:');
  console.log('');
  console.log('export JIRA_BASE_URL="https://your-domain.atlassian.net"');
  console.log('export JIRA_EMAIL="your-email@domain.com"');
  console.log('export JIRA_TOKEN="your-api-token"');
  console.log('export JIRA_PROJECT="ZUL"');
  console.log('export JIRA_ISSUE_TYPE="Task"');
  console.log('');
  console.log('node investigate-schemas.js');
  console.log('');
  console.log('Or run with inline environment variables:');
  console.log('JIRA_BASE_URL=... JIRA_EMAIL=... JIRA_TOKEN=... node investigate-schemas.js');
}

// Run the investigation
investigateFieldSchemas();
