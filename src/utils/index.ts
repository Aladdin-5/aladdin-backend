export function parseArrayString(str) { 
  const content = str.slice(1, -1);
  
  return content.split(',').map(item => {
    return item.trim().replace(/^['"]|['"]$/g, '');
  }).filter(item => item.length > 0);
}