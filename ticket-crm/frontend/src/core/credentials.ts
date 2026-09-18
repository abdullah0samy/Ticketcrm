/**
 * Strips invisible direction marks and stray whitespace
 * from Arabic / RTL copy-paste.
 */
export function cleanCredential(val: string): string {
  return (val || '')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
    .trim();
}
