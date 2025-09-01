// Domain layer exports (post v3.0.0 consolidation)
export { default as Field, mapSchemaToFieldType } from './Field.js';
export {
	FieldTypes,
	ARRAY_ITEM_TYPES,
	NAME_FORMAT_TYPES,
	KEY_FORMAT_TYPES,
	DATE_TIME_TYPES,
	isValidFieldType,
	isValidArrayFieldType,
	getFieldFormat,
	formatFieldValue
} from './Field.js';

// Legacy procedural API removed in v3.0.0: provide explicit throwing stub for clearer migration errors
// Import again for local helper function scope (some bundlers tree-shake otherwise)
import { FieldTypes as _FT, isValidFieldType as _isValidFT, getFieldFormat as _getFormat } from './Field.js';

export function formatValue() {
	throw new Error('formatValue procedural API removed in v3.0.0. Use new FieldFormattingEngine or Field/FieldService methods.');
}

export function getFieldTypeDefinitions() { return _FT; }
export function validateFieldType(fieldType) { return _isValidFT(fieldType); }
export function getFieldTypeInfo(fieldType) {
	if (!_isValidFT(fieldType)) throw new Error(`Invalid field type: ${fieldType}`);
	return {
		fieldType,
		format: _getFormat(fieldType),
		isArray: fieldType === _FT.ARRAY,
		requiresArrayType: fieldType === _FT.ARRAY,
		description: 'See FieldTypes constants for descriptions (deprecated helper removed).'
	};
}
