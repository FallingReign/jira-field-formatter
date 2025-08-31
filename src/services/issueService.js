// IssueService - orchestrates single-purpose formatting, validation and creation flows
// Phase 3d implementation (additive & backward compatible)

import { FieldService } from './index.js';
import { IssuesApi } from '../api/index.js';

/**
 * FormatResult shape
 * { fields, errors: [{ field, error, input }], warnings: [{ field, warning }], meta }
 */

export default class IssueService {
  constructor({ fieldService, issuesApi, logger } = {}) {
    this.fieldService = fieldService || new FieldService();
    this.issuesApi = issuesApi || new IssuesApi();
    this.logger = logger || console;
  }

  /**
   * Format raw field inputs using schema-driven detection
   */
  async format(rawFields, projectKey, issueTypeId) {
    const start = Date.now();
    const { fields, diagnostics } = await this.fieldService.formatInputPayload(rawFields, projectKey, issueTypeId, this.logger);
    const errors = [];
    const warnings = [];
    // Unknown fields → errors (non-throwing)
    for (const uf of diagnostics.unknownFields || []) {
      errors.push({ field: uf, error: 'Unknown field', input: rawFields ? rawFields[uf] : undefined });
    }
    // Field summaries with reason (non-empty & not unknown) become warnings
    for (const [orig, summary] of Object.entries(diagnostics.fieldSummaries || {})) {
      if (!summary.formatted && summary.reason && summary.reason !== 'unknown') {
        warnings.push({ field: orig, warning: summary.reason });
      }
    }
    return {
      fields,
      errors,
      warnings,
      meta: {
        requestedCount: rawFields ? Object.keys(rawFields).length : 0,
        formattedCount: diagnostics.formattedCount || 0,
        durationMs: Date.now() - start
      }
    };
  }

  /**
   * Validate (already formatted or raw) fields against schemas
   */
  async validate(fields, projectKey, issueTypeId) {
    const result = await this.fieldService.validateInputPayload(fields, projectKey, issueTypeId, this.logger);
    const fieldErrors = [];
    for (const [field, res] of Object.entries(result.fieldResults || {})) {
      if (!res.valid) {
        (res.errors || []).forEach(err => fieldErrors.push({ field, error: err }));
      }
    }
    return {
      valid: result.valid,
      fieldErrors,
      summary: {
        total: Object.keys(result.fieldResults || {}).length,
        failed: fieldErrors.length,
        passed: Object.keys(result.fieldResults || {}).length - fieldErrors.length
      }
    };
  }

  /**
   * Create an issue with an already prepared Jira REST payload.
   * Never throws for application / validation errors; only transport-level throws propagate.
   */
  async create(issuePayload) {
    try {
      const created = await this.issuesApi.createIssue(issuePayload, this.logger);
      return { success: true, key: created.issue_key, id: created.issue_id, link: created.issue_link };
    } catch (e) {
      this.logger.error('Issue creation failed:', e.message);
      return { success: false, errors: [{ message: e.message }] };
    }
  }

  /**
   * Prepare a base Jira issue payload (without creating it) plus formatting diagnostics.
   * Returns { baseIssue, format }
   */
  async prepare({ projectKey, issueTypeId, summary, description, fields = {}, ...rest }) {
    if (!projectKey || !issueTypeId) {
      throw new Error('projectKey and issueTypeId are required for prepare()');
    }
    const format = await this.format(fields, projectKey, issueTypeId);
    const baseIssue = {
      fields: {
        project: { key: projectKey },
        issuetype: { id: issueTypeId },
        ...(summary !== undefined ? { summary } : {}),
        ...(description !== undefined ? { description } : {}),
        ...format.fields
      },
      ...rest
    };
    return { baseIssue, format };
  }
}
