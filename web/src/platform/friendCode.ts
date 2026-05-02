/**
 * 6-character "friend code" encoding for game+seed challenges.
 *
 * Layout — 30 bits packed into 6 base32 chars (5 bits each):
 *
 *   [ 8-bit game-dictionary index ]
 *   [ 16-bit bounded seed         ]
 *   [ 4-bit XOR-nibble checksum   ]
 *   [ 2-bit zero padding          ]
 *
 * The "rotating dictionary" is the GAMES registry order: each game's
 * stable `id` string is hashed (here: looked up by index) to a 0..255
 * slot. Two games can theoretically collide once we cross 256 games —
 * `encodeChallenge` returns null in that case so callers can fall back
 * to a full URL share.
 *
 * Seeds are bounded to 16 bits (0..65535) for compactness; PlayPage
 * accepts any 31-bit seed but a friend-code session deliberately uses
 * the low 16 bits so the same hand reproduces deterministically on the
 * other end. Callers should pass `seed & 0xffff` if they want exact
 * round-trip semantics.
 *
 * The alphabet is Crockford-style base32 (no I, L, O, U) so a typed
 * code is hard to misread aloud or scrawl on a napkin.
 */
import { GAMES } from "../games/registry.js";

/** Crockford-ish base32 alphabet — 32 unambiguous symbols. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Reverse lookup map for `decodeChallenge`. Built once at module load. */
const ALPHABET_INDEX: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_INDEX[ALPHABET[i] as string] = i;
}

/** Maximum bounded seed value (16 bits). */
export const MAX_FRIEND_SEED = 0xffff;

/** Maximum addressable games in the dictionary (8 bits). */
export const MAX_FRIEND_GAMES = 0x100;

export interface ChallengeInput {
  gameId: string;
  seed: number;
}

export interface ChallengeOutput {
  gameId: string;
  seed: number;
}

/**
 * 4-bit XOR-nibble checksum over the lower 24 bits of `payload`. Each
 * nibble is xor'd in turn so a single-character typo flips at least one
 * bit in the checksum nibble with high probability.
 */
function nibbleChecksum(payload: number): number {
  let c = 0;
  let p = payload >>> 0;
  for (let i = 0; i < 6; i++) {
    c ^= p & 0xf;
    p >>>= 4;
  }
  return c & 0xf;
}

/**
 * Map a gameId to its 0..255 dictionary index. Returns -1 if the id is
 * unknown or the game registry has grown past 256 entries (callers fall
 * back to URL sharing in that case).
 */
function gameIdToIndex(gameId: string): number {
  const idx = GAMES.findIndex((g) => g != null && g.id === gameId);
  if (idx < 0) return -1;
  if (idx >= MAX_FRIEND_GAMES) return -1;
  return idx;
}

/**
 * Encode a {gameId, seed} challenge into a 6-character base32 code.
 *
 * Returns `null` when the gameId isn't in the registry (or its index
 * exceeds the 8-bit dictionary slot). Seed is masked to 16 bits — a
 * caller passing a >16-bit seed will get a deterministic but truncated
 * round-trip; this is intentional for compactness.
 */
export function encodeChallenge(input: ChallengeInput): string | null {
  const idx = gameIdToIndex(input.gameId);
  if (idx < 0) return null;
  const seed = (input.seed >>> 0) & MAX_FRIEND_SEED;
  // Pack 8 + 16 = 24 bits of payload, then xor-checksum into 4 bits.
  const payload = ((idx & 0xff) << 16) | seed;
  const checksum = nibbleChecksum(payload);
  // Final 30-bit value = payload << 6 | checksum << 2 | 0 padding.
  // 30 bits fit comfortably in JS number (safe up to 2^53).
  const packed = (payload * 64) + (checksum << 2);
  // Emit 6 chars MSB-first, 5 bits per char.
  let out = "";
  for (let shift = 25; shift >= 0; shift -= 5) {
    const five = (packed >>> shift) & 0x1f;
    out += ALPHABET[five] as string;
  }
  return out;
}

/**
 * Decode a 6-character friend code back to its {gameId, seed} pair.
 *
 * Returns `null` for malformed input, unknown alphabet characters, a
 * checksum mismatch, or a dictionary slot that no longer maps to a
 * registered game (e.g., if the GAMES order changed between encode and
 * decode — a known caveat of the index-based dictionary).
 *
 * Decoding is forgiving about whitespace, casing, and the visually
 * confusable characters Crockford traditionally normalises (I→1, L→1,
 * O→0). U is left unmapped so a stray "U" still surfaces as an error.
 */
export function decodeChallenge(code: string): ChallengeOutput | null {
  if (typeof code !== "string") return null;
  // Normalise: strip whitespace, uppercase, swap Crockford-confusable chars.
  let cleaned = code.replace(/\s+/g, "").toUpperCase();
  cleaned = cleaned.replace(/I/g, "1").replace(/L/g, "1").replace(/O/g, "0");
  if (cleaned.length !== 6) return null;
  let packed = 0;
  for (let i = 0; i < 6; i++) {
    const ch = cleaned[i] as string;
    const v = ALPHABET_INDEX[ch];
    if (v === undefined) return null;
    packed = packed * 32 + v;
  }
  // Lower 2 bits are padding (must be zero for a well-formed encode).
  if ((packed & 0x3) !== 0) return null;
  const checksum = (packed >>> 2) & 0xf;
  const payload = Math.floor(packed / 64);
  if (nibbleChecksum(payload) !== checksum) return null;
  const seed = payload & MAX_FRIEND_SEED;
  const idx = (payload >>> 16) & 0xff;
  const game = GAMES[idx];
  if (!game || typeof game.id !== "string") return null;
  return { gameId: game.id, seed };
}

/**
 * Convenience: round-trip a candidate string and return whether it
 * decodes cleanly. Useful for live form-validation in the AppShell
 * "Have a code?" modal.
 */
export function isValidFriendCode(code: string): boolean {
  return decodeChallenge(code) !== null;
}
