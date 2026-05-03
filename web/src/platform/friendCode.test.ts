import { describe, expect, it } from "vitest";
import {
  encodeChallenge,
  decodeChallenge,
  isValidFriendCode,
  MAX_FRIEND_SEED,
} from "./friendCode.js";
import { GAMES } from "../games/registry.js";

describe("friendCode", () => {
  it("round-trips a known game + seed", () => {
    const code = encodeChallenge({ gameId: "klondike", seed: 12345 });
    expect(code).not.toBeNull();
    expect(code).toHaveLength(6);
    const decoded = decodeChallenge(code as string);
    expect(decoded).toEqual({ gameId: "klondike", seed: 12345 });
  });

  it("returns null for unknown game ids", () => {
    expect(encodeChallenge({ gameId: "no-such-game", seed: 1 })).toBeNull();
  });

  it("rejects malformed or checksum-bad codes", () => {
    expect(decodeChallenge("")).toBeNull();
    expect(decodeChallenge("ABC")).toBeNull();
    expect(decodeChallenge("ZZZZZZ")).toBeNull(); // checksum will not match
    expect(decodeChallenge("@@@@@@")).toBeNull(); // bad alphabet
    expect(isValidFriendCode("not a code at all")).toBe(false);
  });

  it("normalises whitespace, casing, and Crockford-confusable chars", () => {
    const code = encodeChallenge({ gameId: GAMES[0]?.id ?? "klondike", seed: 7 });
    expect(code).not.toBeNull();
    const noisy = ` ${(code as string).toLowerCase()} `;
    expect(decodeChallenge(noisy)).toEqual({
      gameId: GAMES[0]?.id ?? "klondike",
      seed: 7,
    });
  });

  it("masks seed to 16 bits and survives the boundary value", () => {
    const code = encodeChallenge({ gameId: "klondike", seed: MAX_FRIEND_SEED });
    expect(code).not.toBeNull();
    const decoded = decodeChallenge(code as string);
    expect(decoded?.seed).toBe(MAX_FRIEND_SEED);
    // A seed >16 bits is silently truncated to its low 16 bits.
    const truncCode = encodeChallenge({ gameId: "klondike", seed: 0x10000 + 42 });
    const truncDecoded = decodeChallenge(truncCode as string);
    expect(truncDecoded?.seed).toBe(42);
  });

  it("round-trips 1000 random (gameId, seed) pairs", () => {
    // Property-style sweep: every supported game with a random 16-bit seed
    // must encode then decode back to the exact same pair.
    const supported = GAMES.filter(
      (g, i): g is NonNullable<typeof g> =>
        i < 0x100 && g != null && typeof g.id === "string",
    );
    expect(supported.length).toBeGreaterThan(0);
    for (let i = 0; i < 1000; i++) {
      const game = supported[Math.floor(Math.random() * supported.length)] as
        (typeof supported)[number];
      const seed = Math.floor(Math.random() * (MAX_FRIEND_SEED + 1));
      const code = encodeChallenge({ gameId: game.id, seed });
      expect(code, `encode failed for ${game.id}/${seed}`).not.toBeNull();
      const decoded = decodeChallenge(code as string);
      expect(decoded, `decode failed for ${code} (${game.id}/${seed})`).toEqual({
        gameId: game.id,
        seed,
      });
    }
  });

  it("treats O/0 and I/L/1 as Crockford confusables when decoding", () => {
    // Sweep seeds until we find a code that contains both a '0' and a '1'
    // so we can substitute every confusable variant in one go.
    let seed = 0;
    let baseCode: string | null = null;
    while (seed <= MAX_FRIEND_SEED) {
      const c = encodeChallenge({ gameId: "klondike", seed });
      if (c && c.includes("0") && c.includes("1")) {
        baseCode = c;
        break;
      }
      seed++;
    }
    expect(baseCode, "expected at least one code containing both 0 and 1").not.toBeNull();
    const expected = { gameId: "klondike", seed };
    expect(decodeChallenge(baseCode as string)).toEqual(expected);
    // Swap every '0' -> 'O' and alternate '1' -> 'I' / 'L' across positions.
    let swapped = "";
    let oneSeen = 0;
    for (const ch of baseCode as string) {
      if (ch === "0") swapped += "O";
      else if (ch === "1") {
        swapped += oneSeen++ % 2 === 0 ? "I" : "L";
      } else swapped += ch;
    }
    expect(swapped).not.toBe(baseCode);
    expect(decodeChallenge(swapped)).toEqual(expected);
    // Lowercase confusables also normalise (decoder uppercases first).
    expect(decodeChallenge(swapped.toLowerCase())).toEqual(expected);
  });

  it("ignores spaces and lowercase characters anywhere in the code", () => {
    const code = encodeChallenge({ gameId: "klondike", seed: 4242 });
    expect(code).not.toBeNull();
    const lowered = (code as string).toLowerCase();
    // Inject a space between every character, plus leading/trailing whitespace.
    const spaced = `  ${lowered.split("").join(" \t ")}\n`;
    expect(decodeChallenge(spaced)).toEqual({ gameId: "klondike", seed: 4242 });
    expect(isValidFriendCode(spaced)).toBe(true);
  });
});
