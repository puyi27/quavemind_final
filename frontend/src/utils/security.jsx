import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string using DOMPurify with a strict allowlist.
 * @param {string} html - The raw HTML string to sanitize.
 * @returns {string} - The sanitized HTML string.
 */
export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};

/**
 * A React component that safely renders sanitized HTML.
 */
export const SafeHtml = ({ html, className }) => {
  const sanitized = sanitizeHtml(html);
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }} 
    />
  );
};
