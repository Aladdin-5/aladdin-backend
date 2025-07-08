export function parseArrayString(str) { 
  const content = str.slice(1, -1);
  
  return content.split(',').map(item => {
    return item.trim().replace(/^['"]|['"]$/g, '');
  }).filter(item => item.length > 0);
}

export function parseBoolean(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;
  }
  return Boolean(value);
}