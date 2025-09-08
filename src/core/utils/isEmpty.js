export function isEmpty(v){
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
}
