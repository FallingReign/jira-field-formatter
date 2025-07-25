/**
 * Tests for date and datetime utilities
 */

import { formatDateValue, formatDateTimeValue } from '../src/utils/dateUtils.js';

describe('formatDateValue', () => {
  test('should return null for empty values', () => {
    expect(formatDateValue(null)).toBeNull();
    expect(formatDateValue(undefined)).toBeNull();
    expect(formatDateValue('')).toBeNull();
  });

  test('should format valid date string', () => {
    expect(formatDateValue('2023-12-25')).toBe('2023-12-25');
  });

  test('should format JavaScript Date object', () => {
    const date = new Date('2023-12-25');
    expect(formatDateValue(date.toISOString())).toBe('2023-12-25');
  });

  test('should convert Excel date serial number (as number)', () => {
    // Excel serial number for 2023-12-25 (approximately 45290)
    const excelDate = 45290;
    const result = formatDateValue(excelDate);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should convert Excel date serial number (as string)', () => {
    const excelDate = '45290';
    const result = formatDateValue(excelDate);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should handle Excel date with decimal (time portion)', () => {
    const excelDate = 45290.5; // Date with time
    const result = formatDateValue(excelDate);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should return null for invalid date', () => {
    expect(formatDateValue('invalid-date')).toBeNull();
  });

  test('should return null for unreasonable year', () => {
    expect(formatDateValue('1800-01-01')).toBeNull();
    expect(formatDateValue('2300-01-01')).toBeNull();
  });

  test('should handle various date formats', () => {
    // Note: Date parsing can vary by locale, so we test that it returns a valid date format
    const result1 = formatDateValue('12/25/2023');
    expect(result1).toMatch(/\d{4}-\d{2}-\d{2}/);
    
    const result2 = formatDateValue('December 25, 2023');
    expect(result2).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe('formatDateTimeValue', () => {
  test('should return null for empty values', () => {
    expect(formatDateTimeValue(null)).toBeNull();
    expect(formatDateTimeValue(undefined)).toBeNull();
    expect(formatDateTimeValue('')).toBeNull();
  });

  test('should format valid ISO datetime string', () => {
    const datetime = '2023-12-25T10:30:00.000Z';
    expect(formatDateTimeValue(datetime)).toBe(datetime);
  });

  test('should convert Excel datetime serial number', () => {
    const excelDateTime = 45290.5; // Date with time
    const result = formatDateTimeValue(excelDateTime);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should format JavaScript Date object', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    const result = formatDateTimeValue(date.toISOString());
    expect(result).toBe('2023-12-25T10:30:00.000Z');
  });

  test('should return null for invalid datetime', () => {
    expect(formatDateTimeValue('invalid-datetime')).toBeNull();
  });

  test('should return null for unreasonable year', () => {
    expect(formatDateTimeValue('1800-01-01T00:00:00Z')).toBeNull();
    expect(formatDateTimeValue('2300-01-01T00:00:00Z')).toBeNull();
  });

  test('should handle partial ISO format', () => {
    const result = formatDateTimeValue('2023-12-25T10:30:00');
    expect(result).toMatch(/2023-12-25T10:30:00/);
  });
});
