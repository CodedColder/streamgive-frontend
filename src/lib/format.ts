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

/**
 * Formats a contract transaction's estimated network fee for display
 * before the wallet's signing prompt appears.
 *
 * `feeStroops` is `AssembledTransaction.built.fee` — a decimal string in
 * stroops (the same 7-decimal-place unit as XLM itself, so it can go
 * straight through formatAmount), set once Client.from()'s generated
 * method has simulated the call. It's an estimate, not what gets charged:
 * the network can end up billing a different amount depending on
 * congestion and final resource usage.
 *
 * @returns "≈ 0.0000123 XLM", or null while no estimate is available yet.
 */
export function formatEstimatedFee(feeStroops: string | undefined): string | null {
  if (!feeStroops) {
    return null;
  }
  return `≈ ${formatAmount(feeStroops)} XLM`;
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
