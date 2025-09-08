import { Issues } from '../src/issues/index.js';

describe('Issues.validatePayload', () => {
  test('invalid when payload missing', async () => {
    const res = await Issues.validatePayload({ payload: null });
    expect(res.valid).toBe(false);
    expect(res.errors[0].code).toBe('INVALID_PAYLOAD');
  });

  test('detects missing project and issuetype', async () => {
    const res = await Issues.validatePayload({ payload: { fields: {} } });
    expect(res.valid).toBe(false);
    expect(res.errors.map(e=>e.code)).toEqual(expect.arrayContaining(['MISSING_PROJECT','MISSING_ISSUETYPE']));
  });

  test('valid minimal payload', async () => {
    const res = await Issues.validatePayload({ payload: { fields: { project: { key: 'PROJ' }, issuetype: { id: '10000' } } } });
    expect(res.valid).toBe(true);
  });
});
