// FieldService - orchestrates schema retrieval, caching, Field construction, and bulk formatting/validation
// Phase 3c implementation (additive & backward compatible)

import FieldsApi from '../api/fields.js';
import { Field } from '../domain/index.js';

const DEFAULT_TTL_SECONDS = 300;

export default class FieldService {
  constructor({ ttlSeconds } = {}) {
    this.fieldsApi = new FieldsApi();
    const envTTL = parseInt(process.env.JIRA_SCHEMA_CACHE_TTL, 10);
    this.ttlSeconds = ttlSeconds || (Number.isFinite(envTTL) && envTTL > 0 ? envTTL : DEFAULT_TTL_SECONDS);
    this.schemaCache = new Map(); // key => { timestamp, schemas }
  }

  getCacheKey(projectKey, issueTypeId) {
    return `${projectKey}:${issueTypeId}`;
  }

  isCacheValid(entry) {
    if (!entry) return false;
    const age = (Date.now() - entry.timestamp) / 1000;
    return age < this.ttlSeconds;
  }

  async fetchSchemas(projectKey, issueTypeId, logger = console, { forceRefresh = false } = {}) {
    const key = this.getCacheKey(projectKey, issueTypeId);
    const existing = this.schemaCache.get(key);
    if (!forceRefresh && this.isCacheValid(existing)) {
      return existing.schemas;
    }
    let schemas = [];
    try {
      schemas = await this.fieldsApi.getAllFieldSchemas(projectKey, issueTypeId, logger);
    } catch (e) {
      logger.error('fetchSchemas error:', e);
    }
    this.schemaCache.set(key, { timestamp: Date.now(), schemas });
    return schemas;
  }

  async buildFields(projectKey, issueTypeId, logger = console, options = {}) {
    const schemas = await this.fetchSchemas(projectKey, issueTypeId, logger, options);
    const fieldsMap = new Map();
    for (const schema of schemas) {
      if (!schema || !schema.name) continue;
      const lower = schema.name.toLowerCase();
      const required = !!schema.required;
      fieldsMap.set(lower, new Field({ key: lower, name: schema.name, required, schema }));
    }
    return { fieldsMap, rawSchemas: schemas };
  }

  async formatInputPayload(rawInput, projectKey, issueTypeId, logger = console) {
    const { fieldsMap } = await this.buildFields(projectKey, issueTypeId, logger);
    const formatted = {};
    const diagnostics = {
      unknownFields: [],
      formattedCount: 0,
      skippedCount: 0,
      fieldSummaries: {}
    };
    for (const [key, value] of Object.entries(rawInput || {})) {
      const lower = key.toLowerCase();
      const field = fieldsMap.get(lower);
      if (!field) {
        diagnostics.unknownFields.push(key);
        diagnostics.fieldSummaries[key] = { formatted: false, reason: 'unknown' };
        diagnostics.skippedCount++;
        continue;
      }
      try {
        const output = field.format(value);
        if (output !== null && output !== undefined) {
          formatted[field.name] = output;
          diagnostics.formattedCount++;
          diagnostics.fieldSummaries[key] = { formatted: true };
        } else {
          diagnostics.fieldSummaries[key] = { formatted: false, reason: 'empty' };
          diagnostics.skippedCount++;
        }
      } catch (e) {
        diagnostics.fieldSummaries[key] = { formatted: false, reason: e.message };
        diagnostics.skippedCount++;
        logger.error(`Error formatting field ${key}:`, e.message);
      }
    }
    return { fields: formatted, diagnostics };
  }

  async validateInputPayload(rawInput, projectKey, issueTypeId, logger = console) {
    const { fieldsMap } = await this.buildFields(projectKey, issueTypeId, logger);
    const fieldResults = {};
    let overallValid = true;
    const errors = [];
    for (const [key, value] of Object.entries(rawInput || {})) {
      const lower = key.toLowerCase();
      const field = fieldsMap.get(lower);
      if (!field) {
        fieldResults[key] = { valid: false, errors: ['Unknown field'] };
        overallValid = false;
        errors.push(`Unknown field: ${key}`);
        continue;
      }
      const result = field.validate(value);
      fieldResults[key] = result;
      if (!result.valid) {
        overallValid = false;
        errors.push(...result.errors.map(er => `${key}: ${er}`));
      }
    }
    // Also check for required fields missing from input
    for (const [lower, field] of fieldsMap.entries()) {
      if (field.required && !(Object.keys(rawInput || {}).some(k => k.toLowerCase() === lower))) {
        overallValid = false;
        const name = field.name;
        fieldResults[name] = fieldResults[name] || { valid: false, errors: ['Missing required field'] };
        if (!errors.includes(`${name}: Missing required field`)) {
          errors.push(`${name}: Missing required field`);
        }
      }
    }
    return { valid: overallValid, fieldResults, errors };
  }

  async autoDetectAndFormat(rawInput, projectKey, issueTypeId, logger = console) {
    const validation = await this.validateInputPayload(rawInput, projectKey, issueTypeId, logger);
    const { fields } = await this.formatInputPayload(rawInput, projectKey, issueTypeId, logger);
    return { validation, fields };
  }
}
