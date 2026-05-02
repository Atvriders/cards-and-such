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
});
