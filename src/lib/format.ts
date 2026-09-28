// Every Stellar Asset Contract token (native XLM included) uses 7 decimal
// places — fixed by the protocol, not something per-asset to look up.
export const TOKEN_DECIMALS = 7;

/** Formats a raw i128 amount string (as returned by the backend) into a
 * human-readable decimal. Safe for typical donation-sized amounts; not
 * intended for values anywhere near Number.MAX_SAFE_INTEGER. */
export function formatAmount(raw: string): string {
  return (Number(BigInt(raw)) / 10 ** TOKEN_DECIMALS).toLocaleString(undefined, {
    maximumFractionDigits: 7,
  });
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

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/**
 * Estimates how long a stream's remaining balance will last at its current
 * rate, as a human-readable string (e.g. "~3 days remaining").
 *
 * `balance` and `rate` are both raw i128 strings at the same token scale
 * (see TOKEN_DECIMALS), so dividing one by the other cancels the scale out
 * and yields a plain number of seconds — no decimal conversion needed.
 *
 * @param balance - The stream's remaining raw balance.
 * @param rate - The stream's raw per-second rate.
 * @returns "Fully drained" once the balance is zero, "" if the rate is zero
 * (nothing to divide by — a stream that isn't actually draining), or an
 * "~N unit(s) remaining" estimate otherwise.
 */
export function formatRemainingDuration(balance: string, rate: string): string {
  const balanceRaw = BigInt(balance);
  if (balanceRaw <= 0n) {
    return 'Fully drained';
  }

  const rateRaw = BigInt(rate);
  if (rateRaw <= 0n) {
    return '';
  }

  const totalSeconds = Number(balanceRaw / rateRaw);

  if (totalSeconds < SECONDS_PER_MINUTE) {
    return `~${pluralize(totalSeconds, 'second')} remaining`;
  }
  if (totalSeconds < SECONDS_PER_HOUR) {
    return `~${pluralize(Math.floor(totalSeconds / SECONDS_PER_MINUTE), 'minute')} remaining`;
  }
  if (totalSeconds < SECONDS_PER_DAY) {
    return `~${pluralize(Math.floor(totalSeconds / SECONDS_PER_HOUR), 'hour')} remaining`;
  }
  return `~${pluralize(Math.floor(totalSeconds / SECONDS_PER_DAY), 'day')} remaining`;
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
