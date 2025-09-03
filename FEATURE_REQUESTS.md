# Library Feature Requests Backlog

This backlog captures proposed enhancements to the `jira-field-formatter` library to support richer multi-source Jira issue construction while preserving a composable primitive-oriented design. Each item is a user story with binary acceptance criteria.

---

## FR-001 Export `cleanIssuePayload`
**User Story**: As an application developer, I want a canonical `cleanIssuePayload` utility exported from the library so that all consumers remove empty / null / blank values consistently before calling Jira APIs.
**Acceptance Criteria**:
- `cleanIssuePayload` is exported at library root.
- Given an object with empty strings, nulls, empty arrays, empty objects, when passed to the function, then those entries are removed recursively.
- Given a non-empty primitive value, it is preserved.
- Given an array containing removable elements only, it returns an empty array (caller decides whether to drop the field).
- Function is pure (no side effects) and does not mutate the original input.

## FR-002 Add `formatBatch(rawFields, projectKey, issueTypeId)`
**User Story**: As an integrator, I want a single call to format a dictionary of raw field values using schema-driven logic so that I avoid manually iterating and formatting each field.
**Acceptance Criteria**:
- Function accepts `(rawFields, projectKey, issueTypeId)` and returns `{ fields, diagnostics }`.
- `fields` only contains successfully formatted, non-null field entries (key = original Jira field name or customfield id preserved).
- `diagnostics` includes arrays: `unknownFields`, `warnings`, `errors`, and integer `formattedCount`.
- Unknown fields present in `rawFields` appear in `diagnostics.unknownFields`.
- No thrown errors for normal validation issues (they surface in diagnostics instead); thrown only on transport/schema retrieval failure.

## FR-003 Field ID & Name Aliasing in `FieldService`
**User Story**: As a developer ingesting heterogeneous inputs, I want to supply either Jira display field names or `customfield_#####` IDs and have them resolved uniformly so that formatting & validation work regardless of source.
**Acceptance Criteria**:
- When both a schema name (case-insensitive) and its custom field id are provided in raw input, name precedence is documented and deterministic.
- Supplying only the customfield id successfully formats when schema is known.
- Alias mapping is built once per schema fetch and cached under the same TTL.
- Diagnostics reference the originally supplied key.

## FR-004 `getRequiredFields(projectKey, issueTypeId)` API
**User Story**: As an automation developer, I need to obtain the list of required fields for a project + issue type so that I can validate completeness before attempting creation.
**Acceptance Criteria**:
- Returns `{ required: string[] }` where values are canonical field keys (schema names or customfield ids).
- Empty array if none are required per Jira schema.
- Uses existing createmeta caching (no extra network call when cache valid).
- Throws only on transport or auth errors.

## FR-005 Required Field Validation Helper
**User Story**: As a developer, I want a helper that compares provided raw fields with required fields and returns a machine-readable diff so that I can block or warn early.
**Acceptance Criteria**:
- Function `diffRequiredFields(providedKeys, requiredKeys)` returns `{ missing: string[], satisfied: string[] }`.
- Order of arrays is deterministic (sorted ascending case-insensitive).
- Passing all required keys results in `missing.length === 0`.

## FR-006 Multi-Format Ingestion Adapters (CSV / YAML)
**User Story**: As an operator importing issues from diverse sources, I want adapters to parse CSV and YAML inputs into a normalized IssueIntent structure so that downstream formatting is consistent.
**Acceptance Criteria**:
- `parseCsvIssues(csvString, { headerMap?, delimiter? })` returns `IssueIntent[]` or throws on malformed CSV (no partial silent failures).
- `parseYamlIssues(yamlString)` returns `IssueIntent[]` or throws if YAML invalid.
- Normalized IssueIntent shape: `{ projectKey, issueType, summary, description?, reporter?, rawFields: { [key:string]: any } }`.
- Unknown headers (not in headerMap) appear in an `intentDiagnostics.unknownHeaders` array if optional diagnostics flag enabled.
- No dependency added beyond a lightweight, already-approved YAML/CSV parser OR developer approval documented.

## FR-007 Reporter Allowance & Lookup Helper
**User Story**: As a developer, I want a combined helper to check reporter field presence and lookup a user so that I can avoid duplicating the two-step logic—but still optionally skip it.
**Acceptance Criteria**:
- Function `resolveReporter(projectKey, issueTypeId, reporterCandidate)` returns `{ name: string } | null`.
- Returns null if reporterCandidate falsy, field not present, or user not found.
- Performs max one createmeta request per TTL window (uses existing cache).
- Does not throw for user-not-found (only transport/auth errors).

## FR-008 Unified Diagnostics Shape
**User Story**: As a consumer of multiple helpers, I need a consistent diagnostics object so that I can aggregate UI feedback without bespoke adapters.
**Acceptance Criteria**:
- Shared interface: `{ unknownFields?: string[], warnings?: string[], errors?: string[], formattedCount?: number, missingRequired?: string[] }`.
- All new formatting / validation functions return or embed this shape.
- Absence of a category means either `undefined` or empty array—never mixed.

## FR-009 Bulk Issue Preparation (Dry Run)
**User Story**: As an automation engineer running imports, I want to dry-run a batch of IssueIntents to see validation & formatting results before creation so that I can fix errors early.
**Acceptance Criteria**:
- `prepareBatch(intents, projectKey?, issueType?)` returns array of `{ intentIndex, payload?, diagnostics }`.
- No network POSTs executed.
- Aggregate summary returned: `{ total, withErrors, withWarnings }`.
- Creation is not attempted for any item in dry-run mode.

## FR-010 Optional `createIssuesBatch(intents, { stopOnError? })`
**User Story**: As an operator, I want to create multiple issues with controlled failure behavior so that a single bad record doesn’t always halt the batch (configurable).
**Acceptance Criteria**:
- stopOnError=false: continues after failures, returning `{ successes: [...], failures: [...] }`.
- stopOnError=true: stops at first failure and reports index + error.
- Each success item includes `key`, `id`, `link`.
- Each failure item includes `index`, `errorMessage`.
- Network errors produce failure entries, not thrown exceptions unless configuration demands (e.g., `throwOnTransport=true`).

## FR-011 Minimal Issue Type Resolution Helper
**User Story**: As a developer, I need a helper that accepts an issue type identifier (name or id) and returns the id to reduce repetition of resolution logic.
**Acceptance Criteria**:
- `resolveIssueTypeId(projectKey, issueType)` returns a string id when resolution succeeds.
- Returns the original if already numeric-like (all digits) and passes a simple /^
*\d+$/ check.
- Throws with clear message when name cannot be resolved.

## FR-012 Pluggable Logger Interface
**User Story**: As a platform integrator, I want to inject my own logger so that logs integrate with centralized tracing.
**Acceptance Criteria**:
- All new APIs accept an optional `{ logger }` object with `debug|info|warn|error` methods.
- If omitted, defaults to `console`.
- No direct `console.*` calls inside code paths when a custom logger is provided.

## FR-013 Rate Limit & Retry Strategy (Opt-In)
**User Story**: As a developer operating at scale, I want optional exponential backoff for transient 429/5xx Jira responses so that batch operations can self-heal.
**Acceptance Criteria**:
- Disabled by default.
- Config: `{ retries: number, baseDelayMs: number, maxDelayMs: number }`.
- Retries only on 429 or 5xx (excluding 501–505 configurably).
- Final failure returns original error message plus `attempts` count.

## FR-014 Type Definitions (TS Declarations)
**User Story**: As a TypeScript consumer, I want .d.ts typings so that I get compile-time validation and IntelliSense.
**Acceptance Criteria**:
- Distributed `.d.ts` definitions cover all exported public APIs (root index exports + new batch helpers).
- Build produces/exports typings without requiring additional compile step for consumers.
- No `any` types for primary method signatures (IssueIntent, diagnostics, etc.).

## FR-015 Structured Error Classes
**User Story**: As a consumer, I want specific error classes to differentiate auth vs validation vs transport failures so that I can implement targeted handling.
**Acceptance Criteria**:
- Classes: `JiraAuthError`, `JiraValidationError`, `JiraNotFoundError`, `JiraRateLimitError`, `JiraServerError`, `JiraClientError`.
- Each sets `name` and includes `statusCode` where applicable.
- Formatting/validation functions return diagnostics instead of throwing; thrown errors limited to transport/auth/system.

## FR-016 Field Name to Field ID Resolution Service
**User Story**: As a developer processing YAML/JSON inputs, I want to resolve human-readable field names (like "Epic Link", "Fix Version") to their actual Jira field IDs (like "customfield_10014", "fixVersions") so that I can support both display names and field IDs in user input.
**Acceptance Criteria**:
- Function `resolveFieldId(fieldName, projectKey, issueTypeId)` returns the actual field ID/key for a given display name.
- Handles common field name variations: "Fix Version" → "fixVersions", "Component" → "components", "Epic Link" → "customfield_10014".
- Works with both standard fields and custom fields.
- Returns null if field name cannot be resolved.
- Uses existing schema cache for performance.
- Case-insensitive field name matching.

## FR-017 Comprehensive Field Name Mapping
**User Story**: As a developer, I want a mapping service that can handle common field name aliases so that users can input fields using their familiar display names.
**Acceptance Criteria**:
- Pre-defined mapping for common field aliases: "Fix Version/s" ↔ "fixVersions", "Component/s" ↔ "components".
- Support for custom field display name to ID mapping via schema lookup.
- Function `getFieldMapping(projectKey, issueTypeId)` returns a complete name→id mapping for all fields.
- Backwards compatibility: field IDs and existing field keys continue to work unchanged.
- Clear documentation of supported field name aliases.

---

## Prioritization (Suggested Initial Focus)
1. FR-001, FR-002 (Immediate consumer simplification)
2. FR-003, FR-004 (Foundation for full coverage)
3. FR-008, FR-011 (Consistency & dedupe)
4. FR-006 (Multi-format ingestion) after base diagnostics solidified
5. FR-015, FR-012, FR-013 (Operational maturity)
6. FR-010 (Batch create) once preparation pipeline stable
7. FR-014 (Typings) can be parallelized anytime

---

## Glossary
- **IssueIntent**: Normalized, pre-format representation of a requested issue.
- **Diagnostics**: Non-throwing structured feedback on formatting/validation outcomes.

