import FieldsApi from '../src/api/fields.js';

// Mock logger for tests
const mockLogger = { 
  info: () => {}, 
  error: () => {}, 
  warn: () => {}, 
  debug: () => {} 
};

// Mock JiraApiClient
const createMockClient = () => ({
  get: () => Promise.resolve({ ok: false, text: () => Promise.resolve('Mock not configured') })
});

describe('FieldsApi Issue Type Resolution', () => {
  let fieldsApi;
  let originalClient;

  beforeEach(() => {
    fieldsApi = new FieldsApi();
    originalClient = fieldsApi.client;
    fieldsApi.client = createMockClient();
    // Clear cache between tests
    fieldsApi.issueTypeCache.clear();
    fieldsApi.cacheTimestamp.clear();
  });

  afterEach(() => {
    fieldsApi.client = originalClient;
  });

  describe('resolveIssueTypeId', () => {
    test('should return ID directly for numeric input', async () => {
      const result = await fieldsApi.resolveIssueTypeId('10200', 'TEST', mockLogger);
      expect(result).toBe('10200');
      // No API call should be made for numeric input
    });

    test('should resolve issue type name to ID', async () => {
      fieldsApi.client.get = async () => ({
        ok: true,
        json: () => Promise.resolve({
          key: 'TEST',
          issueTypes: [
            { id: '10200', name: 'Task' },
            { id: '10203', name: 'Bug' },
            { id: '10000', name: 'Epic' }
          ]
        })
      });

      const result = await fieldsApi.resolveIssueTypeId('Task', 'TEST', mockLogger);
      expect(result).toBe('10200');
    });

    test('should resolve case-insensitive issue type names', async () => {
      fieldsApi.client.get = async () => ({
        ok: true,
        json: () => Promise.resolve({
          issueTypes: [{ id: '10200', name: 'Task' }]
        })
      });

      const result = await fieldsApi.resolveIssueTypeId('task', 'TEST', mockLogger);
      expect(result).toBe('10200');
    });

    test('should cache issue type mappings', async () => {
      let callCount = 0;
      fieldsApi.client.get = async () => {
        callCount++;
        return {
          ok: true,
          json: () => Promise.resolve({
            issueTypes: [
              { id: '10200', name: 'Task' },
              { id: '10203', name: 'Bug' }
            ]
          })
        };
      };

      // First call - should hit API
      await fieldsApi.resolveIssueTypeId('Task', 'TEST', mockLogger);
      expect(callCount).toBe(1);

      // Second call - should use cache
      const result = await fieldsApi.resolveIssueTypeId('Bug', 'TEST', mockLogger);
      expect(result).toBe('10203');
      expect(callCount).toBe(1); // Still only 1 call
    });

    test('should throw error for unknown issue type', async () => {
      fieldsApi.client.get = async () => ({
        ok: true,
        json: () => Promise.resolve({
          issueTypes: [{ id: '10200', name: 'Task' }]
        })
      });

      await expect(
        fieldsApi.resolveIssueTypeId('NonExistent', 'TEST', mockLogger)
      ).rejects.toThrow(/Issue type 'NonExistent' not found in project 'TEST'/);
    });

    test('should handle API errors gracefully', async () => {
      let errorLogged = false;
      const testLogger = {
        ...mockLogger,
        error: (msg, details) => {
          if (msg === '_getIssueTypes error:') {
            errorLogged = true;
          }
        }
      };

      fieldsApi.client.get = async () => ({
        ok: false,
        text: () => Promise.resolve('API Error')
      });

      await expect(
        fieldsApi.resolveIssueTypeId('Task', 'TEST', testLogger)
      ).rejects.toThrow(/Issue type 'Task' not found in project 'TEST'/);

      expect(errorLogged).toBe(true);
    });
  });

  describe('getFieldSchema with issue type resolution', () => {
    test('should resolve issue type name before getting field schema', async () => {
      let apiCalls = [];
      fieldsApi.client.get = async (endpoint) => {
        apiCalls.push(endpoint);
        
        if (endpoint === 'project/TEST') {
          return {
            ok: true,
            json: () => Promise.resolve({
              issueTypes: [{ id: '10200', name: 'Task' }]
            })
          };
        }
        
        if (endpoint === 'issue/createmeta/TEST/issuetypes/10200?maxResults=1000') {
          return {
            ok: true,
            json: () => Promise.resolve({
              values: [{
                name: 'Summary',
                fieldId: 'summary',
                schema: { type: 'string' },
                required: true
              }]
            })
          };
        }
        
        return { ok: false, text: () => Promise.resolve('Not found') };
      };

      const result = await fieldsApi.getFieldSchema('Summary', 'TEST', 'Task', mockLogger);
      
      expect(result).toEqual({
        name: 'Summary',
        fieldId: 'summary',
        schema: { type: 'string' },
        required: true
      });
      
      expect(apiCalls).toContain('project/TEST');
      expect(apiCalls).toContain('issue/createmeta/TEST/issuetypes/10200?maxResults=1000');
    });

    test('should work with numeric issue type ID', async () => {
      let apiCalls = [];
      fieldsApi.client.get = async (endpoint) => {
        apiCalls.push(endpoint);
        
        return {
          ok: true,
          json: () => Promise.resolve({
            values: [{
              name: 'Summary',
              fieldId: 'summary',
              schema: { type: 'string' },
              required: true
            }]
          })
        };
      };

      const result = await fieldsApi.getFieldSchema('Summary', 'TEST', '10200', mockLogger);
      
      expect(result).toEqual({
        name: 'Summary',
        fieldId: 'summary',
        schema: { type: 'string' },
        required: true
      });
      
      // Should only call field schema API (no issue type resolution)
      expect(apiCalls.length).toBe(1);
      expect(apiCalls[0]).toBe('issue/createmeta/TEST/issuetypes/10200?maxResults=1000');
    });
  });

  describe('getAllFieldSchemas with issue type resolution', () => {
    test('should resolve issue type name before getting all field schemas', async () => {
      let apiCalls = [];
      fieldsApi.client.get = async (endpoint) => {
        apiCalls.push(endpoint);
        
        if (endpoint === 'project/TEST') {
          return {
            ok: true,
            json: () => Promise.resolve({
              issueTypes: [{ id: '10200', name: 'Task' }]
            })
          };
        }
        
        return {
          ok: true,
          json: () => Promise.resolve({
            values: [
              { name: 'Summary', fieldId: 'summary' },
              { name: 'Priority', fieldId: 'priority' }
            ]
          })
        };
      };

      const result = await fieldsApi.getAllFieldSchemas('TEST', 'Task', mockLogger);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Summary');
      expect(result[1].name).toBe('Priority');
      
      expect(apiCalls).toContain('project/TEST');
      expect(apiCalls).toContain('issue/createmeta/TEST/issuetypes/10200?maxResults=1000');
    });
  });
});
