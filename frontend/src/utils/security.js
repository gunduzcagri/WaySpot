export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, char => map[char]);
}

export function isValidUrl(url) {
  if (typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    const allowedSchemes = ['http:', 'https:', 'mailto:'];
    return allowedSchemes.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}
