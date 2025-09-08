import { Screens } from '../../index.js';

describe('LIVE: Screens.getCreate', () => {
  const projectKey = process.env.JIRA_LIVE_PROJECT;
  const issueType = process.env.JIRA_LIVE_ISSUETYPE;
  if(!projectKey || !issueType){
    test.skip('env vars missing', ()=>{});
    return;
  }
  test('returns create screen with fields', async () => {
    const meta = await Screens.getCreate({ projectKey, issueType });
    expect(meta.projectKey).toBe(projectKey);
    expect(Array.isArray(meta.fields)).toBe(true);
  }, 30000);
});
