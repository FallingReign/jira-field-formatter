// Public Issues facade
import { buildPayload } from './payloadBuilder.js';
import { validatePayload } from './validator.js';
import { createIssue, createIssuesBulk } from './creator.js';

export const Issues = {
  buildPayload,
  validatePayload,
  async create(payload, opts = {}){
    return createIssue({ payload, client: opts.client });
  },
  async createMany(payloads, opts = {}){
    return createIssuesBulk({ payloads, client: opts.client });
  }
};
