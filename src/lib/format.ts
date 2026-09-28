// Every Stellar Asset Contract token (native XLM included) uses 7 decimal
// places — fixed by the protocol, not something per-asset to look up.
export const TOKEN_DECIMALS = 7;

// Decimal separator for the active locale, derived without touching the
// raw amount so it can't be a source of precision loss itself.
const DECIMAL_SEPARATOR = (1.1).toLocaleString(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})[1];

/** Formats a raw i128 amount string (as returned by the backend) into a
 * human-readable decimal. Splits the integer/fractional parts on the
 * BigInt directly, so precision is preserved even for values well past
 * Number.MAX_SAFE_INTEGER. */
export function formatAmount(raw: string): string {
  const value = BigInt(raw);
  const isNegative = value < 0n;
  const abs = isNegative ? -value : value;
  const divisor = 10n ** BigInt(TOKEN_DECIMALS);

  const whole = abs / divisor;
  const fraction = abs % divisor;

  const wholeStr = whole.toLocaleString(undefined);
  const fractionStr = fraction.toString().padStart(TOKEN_DECIMALS, '0').replace(/0+$/, '');

  const formatted = fractionStr ? `${wholeStr}${DECIMAL_SEPARATOR}${fractionStr}` : wholeStr;
  return isNegative ? `-${formatted}` : formatted;
}

/** Parses a user-typed decimal amount (e.g. from a text input) into a raw
 * i128 value in the token's base units, or `null` if the input isn't a
 * valid positive amount or has more than TOKEN_DECIMALS decimal places.
 *
 * Works on the digits as strings rather than going through Number(), which
 * silently changes values past ~15 significant digits. */
export function parseAmount(input: string): bigint | null {
  const match = /^(\d*)(?:\.(\d*))?$/.exec(input.trim());
  if (!match) {
    return null;
  }

  const [, whole, fraction = ''] = match;
  if (whole === '' && fraction === '') {
    return null;
  }
  if (fraction.length > TOKEN_DECIMALS) {
    return null;
  }

  const raw = BigInt((whole || '0') + fraction.padEnd(TOKEN_DECIMALS, '0'));
  return raw > 0n ? raw : null;
}

/** Shortens a wallet/contract address to its first and last 4 characters.
 * Returns the original string unchanged if it is too short to truncate
 * without the two halves overlapping (i.e. fewer than 9 characters). */
export function truncateAddress(address: string): string {
  if (address.length < 9) {
    return address;
  }
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
