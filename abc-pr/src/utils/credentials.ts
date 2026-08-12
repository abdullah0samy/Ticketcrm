/**
 * Clean up credentials typed or pasted into the login form.
 *
 * The interface is Arabic and right-to-left. Copying a username or password
 * out of it drags along invisible Unicode direction marks (U+200E/U+200F and
 * the embedding/isolate controls). They cannot be seen in a password field,
 * but the server compares byte-for-byte and rejects the login — so a password
 * that looks exactly right comes back as "wrong username or password".
 *
 * Only invisible formatting characters and surrounding whitespace are removed.
 */
const BIDI_CONTROLS = /[‎‏؜‪-‮⁦-⁩]/g;

export function cleanCredential(value: string): string {
  return value.replace(BIDI_CONTROLS, "").trim();
}
