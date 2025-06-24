export function sanitizeInput(str) {
  return str.replace(/[<>]/g, '');
} 