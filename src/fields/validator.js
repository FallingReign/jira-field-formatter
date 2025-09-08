// INTERNAL: field-level validation
export function validateFieldValue(descriptor, value){
  const issues = [];
  if(descriptor.required && (value === null || value === undefined || value === '')){
    issues.push({ code: 'REQUIRED', message: 'Value required' });
  }
  // Add type specific checks later
  return issues;
}

export function validateValues({ descriptors, inputValues }){
  const errors = [];
  const missingRequired = [];
  for(const d of descriptors){
    const candidate = Object.prototype.hasOwnProperty.call(inputValues, d.id)
      ? inputValues[d.id]
      : inputValues[d.name];
    const errs = validateFieldValue(d, candidate);
    errs.forEach(e => errors.push({ field: d.id, ...e }));
    if(d.required && (candidate === undefined || candidate === null || candidate === '')){
      missingRequired.push(d.id);
    }
  }
  return { errors, missingRequired, valid: errors.length === 0 && missingRequired.length === 0 };
}
