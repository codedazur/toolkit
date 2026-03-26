export const INVALID_EMAIL = "[INVALID_EMAIL]";

/**
 * Masks an email address for logging.
 * Returns a loud token if the input is missing or malformed.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) {
    return INVALID_EMAIL;
  }

  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return INVALID_EMAIL;
  }

  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }

  const prefix = localPart.substring(0, 2);
  const suffix = localPart.substring(localPart.length - 1);

  return `${prefix}***${suffix}@${domain}`;
}
