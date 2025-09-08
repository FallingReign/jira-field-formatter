/**
 * LIVE TESTS (optional): Run with REAL Jira if env vars + LIVE_JIRA_TESTS=true.
 * Skipped by default to avoid network + side effects.
 */
import { Fields } from '../../index.js';

describe('LIVE: Jira integration smoke', () => {
  test('global fields list returns > 0 fields', async () => {
    const list = await Fields.getAll();
    expect(list.length).toBeGreaterThan(0);
  }, 20000);
});
