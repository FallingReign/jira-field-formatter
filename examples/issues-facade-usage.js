// Example: Using the new Issues facade (no legacy services)
import { Fields, Issues } from '../index.js';

async function run() {
    // Mock minimal create screen field descriptors via a faux HTTP client
    const mockDescriptors = [
      { id: 'summary', name: 'Summary', required: true, schema: { type: 'string' } },
      { id: 'labels', name: 'Labels', required: false, schema: { type: 'array', items: { type: 'string' } } }
    ];
    const mockClient = { get: async () => ({ ok: true, json: async () => ({ values: mockDescriptors }) }) };

  const input = { Summary: '  A sample issue  ', Labels: 'one, two', Unknown: 'x' };
  const projectKey = 'DEMO';
  const issueType = '10200'; // use numeric ID to avoid name->id resolution network call

  const formatted = await Fields.formatValues({ values: input, projectKey, issueType, client: mockClient, options: { omitEmpty: true } });
  console.log('Formatted values:', formatted);

  const payload = await Issues.buildPayload({ projectKey, issueType, values: input, options: { omitEmpty: true }, client: mockClient });
  console.log('Issue payload:', payload.payload);
}

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});