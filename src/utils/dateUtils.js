/**
 * Date and DateTime utilities for Jira field formatting
 * Handles Excel date serial numbers and various date formats
 */

/**
 * Excel epoch date (January 1, 1900)
 */
const EXCEL_EPOCH = new Date(Date.UTC(1900, 0, 1));
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Reasonable date range for validation
 */
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;

/**
 * Check if a value is an Excel date serial number
 * @param {any} value - The value to check
 * @returns {number|null} The numeric value if it's a valid Excel date, null otherwise
 */
function getExcelDateNumber(value) {
  let numericValue = null;

  // Check if it's a numeric string
  if (typeof value === 'string' && /^\d+(\.\d*)?$/.test(value.trim())) {
    numericValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numericValue = value;
  }

  // Validate range for Excel dates (roughly 1900-2200)
  if (numericValue !== null && numericValue >= 1 && numericValue <= 110000) {
    return numericValue;
  }

  return null;
}

/**
 * Convert Excel date serial number to JavaScript Date
 * @param {number} excelDate - Excel date serial number
 * @returns {Date} JavaScript Date object
 */
function excelDateToJSDate(excelDate) {
  // Excel incorrectly treats 1900 as a leap year, so adjust for dates after February 28, 1900
  const adjustedValue = excelDate > 60 ? excelDate - 1 : excelDate;
  return new Date(EXCEL_EPOCH.getTime() + (adjustedValue - 1) * MILLISECONDS_PER_DAY);
}

/**
 * Validate that a year is within reasonable bounds
 * @param {number} year - The year to validate
 * @returns {boolean} True if the year is valid
 */
function isValidYear(year) {
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

/**
 * Format a date value to YYYY-MM-DD format for Jira
 * @param {any} dateValue - The date value to format
 * @returns {string|null} Formatted date string or null if invalid
 */
export function formatDateValue(dateValue) {
  // Handle null/undefined/empty values
  if (dateValue === null || dateValue === undefined || dateValue === "") {
    return null;
  }

  // Check for Excel date serial number
  const excelDate = getExcelDateNumber(dateValue);
  if (excelDate !== null) {
    console.log(`Detected Excel date serial number: ${excelDate}`);
    const date = excelDateToJSDate(excelDate);
    console.log(`Converted Excel date ${excelDate} to ${date.toISOString()}`);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // Check if it's already in YYYY-MM-DD format
  const dateStr = String(dateValue).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Still validate the year even for correctly formatted dates
    const year = parseInt(dateStr.substring(0, 4));
    if (!isValidYear(year)) {
      console.warn(`Date resulted in unreasonable year: ${year}`);
      return null;
    }
    return dateStr;
  }

  // Try to parse as a regular date string
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date format: ${dateStr}`);
    return null;
  }

  // Validate the year
  const year = date.getFullYear();
  if (!isValidYear(year)) {
    console.warn(`Date resulted in unreasonable year: ${year}`);
    return null;
  }

  return date.toISOString().split('T')[0];
}

/**
 * Format a datetime value to ISO format for Jira
 * @param {any} dateTimeValue - The datetime value to format
 * @returns {string|null} Formatted datetime string or null if invalid
 */
export function formatDateTimeValue(dateTimeValue) {
  // Handle null/undefined/empty values
  if (dateTimeValue === null || dateTimeValue === undefined || dateTimeValue === "") {
    return null;
  }

  // Check for Excel date serial number
  const excelDate = getExcelDateNumber(dateTimeValue);
  if (excelDate !== null) {
    console.log(`Detected Excel datetime serial number: ${excelDate}`);
    const date = excelDateToJSDate(excelDate);
    console.log(`Converted Excel datetime ${excelDate} to ${date.toISOString()}`);
    return date.toISOString();
  }

  // Check if it's already in ISO format
  const dateTimeStr = String(dateTimeValue).trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateTimeStr)) {
    // Still validate the year even for correctly formatted datetimes
    const year = parseInt(dateTimeStr.substring(0, 4));
    if (!isValidYear(year)) {
      console.warn(`Datetime resulted in unreasonable year: ${year}`);
      return null;
    }
    return dateTimeStr;
  }

  // Try to parse as a regular datetime string
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid datetime format: ${dateTimeStr}`);
    return null;
  }

  // Validate the year
  const year = date.getFullYear();
  if (!isValidYear(year)) {
    console.warn(`Datetime resulted in unreasonable year: ${year}`);
    return null;
  }

  return date.toISOString();
}
