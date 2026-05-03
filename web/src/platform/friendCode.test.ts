import { describe, expect, it, vi } from "vitest";
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

  it("returns null when a game's registry index is >= 256 (8-bit dictionary overflow)", async () => {
    // Build a fake registry whose target gameId sits past the 8-bit slot.
    // We re-import friendCode through vi.doMock so the production GAMES
    // array is left untouched for sibling tests.
    vi.resetModules();
    const sentinel = { id: "overflow-sentinel" } as { id: string };
    const fakeGames = new Array(0x100).fill({ id: "filler" });
    fakeGames.push(sentinel); // index 0x100 == 256, just past the limit.
    vi.doMock("../games/registry.js", () => ({ GAMES: fakeGames }));
    const mod = await import("./friendCode.js");
    expect(mod.encodeChallenge({ gameId: "overflow-sentinel", seed: 1 })).toBeNull();
    // A game still inside the 8-bit window should encode successfully.
    fakeGames[0] = { id: "in-range" };
    expect(mod.encodeChallenge({ gameId: "in-range", seed: 1 })).not.toBeNull();
    vi.doUnmock("../games/registry.js");
    vi.resetModules();
  });

  it("isValidFriendCode predicate: valid 6-char alphanumeric / short / garbage", () => {
    // A real, freshly minted code is the canonical valid 6-char alphanumeric.
    const valid = encodeChallenge({ gameId: "klondike", seed: 1 });
    expect(valid).not.toBeNull();
    expect((valid as string).length).toBe(6);
    expect(/^[0-9A-Z]{6}$/.test(valid as string)).toBe(true);
    expect(isValidFriendCode(valid as string)).toBe(true);
    // Anything shorter than 6 chars must be rejected outright.
    expect(isValidFriendCode("")).toBe(false);
    expect(isValidFriendCode("A")).toBe(false);
    expect(isValidFriendCode("ABCDE")).toBe(false);
    // Pure garbage / non-alphabet characters must also be rejected.
    expect(isValidFriendCode("!@#$%^")).toBe(false);
    expect(isValidFriendCode("??????")).toBe(false);
  });

  it("truncates seeds with bits above 16 yet stays deterministic across calls", () => {
    // Two seeds that share their low 16 bits but differ in the high bits
    // must produce the same friend code (deterministic truncation).
    const lowBits = 0xbeef;
    const a = encodeChallenge({ gameId: "klondike", seed: lowBits });
    const b = encodeChallenge({ gameId: "klondike", seed: 0x70000 | lowBits });
    const c = encodeChallenge({ gameId: "klondike", seed: 0x12340000 | lowBits });
    expect(a).not.toBeNull();
    expect(b).toBe(a);
    expect(c).toBe(a);
    // And the round-trip recovers exactly the low 16 bits, not the original.
    const decoded = decodeChallenge(a as string);
    expect(decoded).toEqual({ gameId: "klondike", seed: lowBits });
  });
});
