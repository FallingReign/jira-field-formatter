/**
 * Time tracking utilities for Jira field formatting
 * Handles time estimation formats like "2w 3d 4h 30m"
 */

/**
 * Parse a time tracking value into Jira format
 * @param {string} value - Time tracking string (e.g., "2w 3d 4h 30m" or "value")
 * @returns {object} Time tracking object for Jira API
 */
export function parseTimeTracking(value) {
  if (!value || typeof value !== 'string') {
    return {};
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return {};
  }

  // Always return the value as originalEstimate
  // Jira accepts various time formats including simple values
  return { originalEstimate: trimmedValue };
}

/**
 * Validate a time tracking string format
 * @param {string} value - Time tracking string to validate
 * @returns {boolean} True if the format is valid
 */
export function isValidTimeTrackingFormat(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Pattern matches: numbers followed by w/d/h/m (weeks/days/hours/minutes)
  const timePattern = /^(\d+[wdhm]\s*)+$/;
  return timePattern.test(value.trim());
}

/**
 * Parse time tracking string into component parts
 * @param {string} value - Time tracking string
 * @returns {object} Object with weeks, days, hours, minutes
 */
export function parseTimeComponents(value) {
  if (!value || typeof value !== 'string') {
    return {};
  }

  const components = {};
  const patterns = {
    weeks: /(\d+)w/,
    days: /(\d+)d/,
    hours: /(\d+)h/,
    minutes: /(\d+)m/
  };

  for (const [unit, pattern] of Object.entries(patterns)) {
    const match = value.match(pattern);
    if (match) {
      components[unit] = parseInt(match[1], 10);
    }
  }

  return components;
}
