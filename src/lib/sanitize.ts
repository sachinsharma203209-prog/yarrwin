const SCRIPT_TAG = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const IFRAME_TAG = /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi;
const OBJECT_TAG = /<object\b[^>]*>[\s\S]*?<\/object>/gi;
const EMBED_TAG = /<embed\b[^>]*>/gi;
const FORM_TAG = /<form\b[^>]*>[\s\S]*?<\/form>/gi;
const EVENT_HANDLER = /\s*on[a-z]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL = /href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;
const DANGEROUS_TAGS = /<\/?(?:applet|base|bgsound|blink|meta|style|link|ilayer|layer|keygen|xss)[^>]*>/gi;

function addNoopenerToLinks(html: string): string {
  return html.replace(/<a\b([^>]*?)>/gi, (match, attrs: string) => {
    if (/\bhref\s*=\s*["']https?:\/\//.test(attrs)) {
      if (/\brel\s*=/.test(attrs)) {
        return match.replace(
          /rel\s*=\s*(?:"([^"]*)"|'([^']*)')/i,
          (_, d1: string, d2: string) => `rel="${[d1 || d2, 'noopener', 'noreferrer'].join(' ')}"`,
        );
      }
      return `<a${attrs} rel="noopener noreferrer">`;
    }
    return match;
  });
}

export function sanitizeHtml(html: string): string {
  let result = html
    .replace(SCRIPT_TAG, '')
    .replace(IFRAME_TAG, '')
    .replace(OBJECT_TAG, '')
    .replace(EMBED_TAG, '')
    .replace(FORM_TAG, '')
    .replace(DANGEROUS_TAGS, '')
    .replace(EVENT_HANDLER, '')
    .replace(JAVASCRIPT_URL, 'href=""');

  result = addNoopenerToLinks(result);
  return result;
}
