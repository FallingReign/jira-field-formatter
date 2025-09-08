import { Issues } from '../../index.js';

describe('LIVE: Issues.buildPayload smoke', () => {
  const projectKey = process.env.JIRA_LIVE_PROJECT;
  const issueType = process.env.JIRA_LIVE_ISSUETYPE; // name or id
  if(!projectKey || !issueType){
    test.skip('env vars missing', ()=>{});
    return;
  }
  test('builds payload without errors', async () => {
    const { payload } = await Issues.buildPayload({ projectKey, issueType, values: { Summary: 'Live test issue' }, options: { omitEmpty: true } });
    expect(payload.fields.project.key).toBe(projectKey);
  }, 30000);
});
