/**
 * Example: Issue Type Resolution
 * 
 * This example demonstrates the new issue type name resolution functionality
 * that allows you to use natural issue type names instead of cryptic IDs.
 */

import { FieldsApi, resolveIssueTypeId } from '../index.js';

// Mock for demonstration (replace with real credentials in .env)
const mockFieldsApi = () => {
  const api = new FieldsApi();
  
  // Mock the project endpoint to return sample issue types
  api.client.get = async (endpoint) => {
    if (endpoint.startsWith('project/')) {
      return {
        ok: true,
        json: () => Promise.resolve({
          key: 'DEMO',
          issueTypes: [
            { id: '10200', name: 'Task' },
            { id: '10203', name: 'Bug' },
            { id: '10000', name: 'Epic' },
            { id: '10204', name: 'Sub-task' }
          ]
        })
      };
    }
    
    // Mock field schema response
    return {
      ok: true,
      json: () => Promise.resolve({
        values: [
          {
            name: 'Summary',
            fieldId: 'summary',
            schema: { type: 'string' },
            required: true
          },
          {
            name: 'Priority',
            fieldId: 'priority',
            schema: { type: 'priority' },
            required: false
          },
          {
            name: 'Department',
            fieldId: 'customfield_10302',
            schema: { type: 'option-with-child' },
            required: false
          }
        ]
      })
    };
  };
  
  return api;
};

async function demonstrateIssueTypeResolution() {
  console.log('🏷️  Issue Type Resolution Example');
  console.log('=================================\n');
  
  const fieldsApi = mockFieldsApi();
  const projectKey = 'DEMO';
  
  try {
    console.log('1️⃣  Direct Issue Type Resolution:');
    console.log('-----------------------------------');
    
    // Convert issue type names to IDs
    const taskId = await fieldsApi.resolveIssueTypeId('Task', projectKey);
    const bugId = await fieldsApi.resolveIssueTypeId('Bug', projectKey);
    const epicId = await fieldsApi.resolveIssueTypeId('Epic', projectKey);
    
    console.log(`✅ Task → ${taskId}`);
    console.log(`✅ Bug → ${bugId}`);
    console.log(`✅ Epic → ${epicId}`);
    
    // Numeric IDs pass through unchanged
    const passthrough = await fieldsApi.resolveIssueTypeId('10200', projectKey);
    console.log(`✅ 10200 → ${passthrough} (passthrough)`);
    
    console.log('\n2️⃣  Field Schema Retrieval with Issue Type Names:');
    console.log('--------------------------------------------------');
    
    // Get field schema using issue type name
    const summarySchema = await fieldsApi.getFieldSchema('Summary', projectKey, 'Task');
    console.log(`✅ Summary field for Task:`);
    console.log(`   Field ID: ${summarySchema.fieldId}`);
    console.log(`   Type: ${summarySchema.schema.type}`);
    console.log(`   Required: ${summarySchema.required}`);
    
    // Get all fields for an issue type using name
    const bugFields = await fieldsApi.getAllFieldSchemas(projectKey, 'Bug');
    console.log(`\n✅ Bug issue type has ${bugFields.length} available fields:`);
    bugFields.forEach(field => {
      console.log(`   - ${field.name} (${field.fieldId})`);
    });
    
    console.log('\n3️⃣  Backward Compatibility:');
    console.log('----------------------------');
    
    // Using numeric IDs still works (no extra API calls)
    const legacyFields = await fieldsApi.getAllFieldSchemas(projectKey, '10203');
    console.log(`✅ Using ID '10203' directly: ${legacyFields.length} fields found`);
    
    console.log('\n4️⃣  Error Handling:');
    console.log('-------------------');
    
    try {
      await fieldsApi.resolveIssueTypeId('NonExistent', projectKey);
    } catch (error) {
      console.log(`✅ Proper error handling: ${error.message.split('.')[0]}`);
    }
    
    console.log('\n🎉 Benefits:');
    console.log('============');
    console.log('✅ More readable code using natural issue type names');
    console.log('✅ Cached mappings improve performance (5-minute TTL)');
    console.log('✅ Backward compatible with existing numeric ID usage');
    console.log('✅ Clear error messages when issue types don\'t exist');
    console.log('✅ Works across all field-related API methods');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
demonstrateIssueTypeResolution().catch(console.error);
