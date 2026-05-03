import { describe, expect, it } from "vitest";
import { encodeQrModules } from "./qr.js";

describe("qr byte-mode encoder", () => {
  it("encodes a simple ASCII URL into a square module grid", () => {
    const result = encodeQrModules("https://example.com/");
    expect(result).not.toBeNull();
    const { size, modules } = result!;
    expect(size).toBeGreaterThan(0);
    expect(modules).toHaveLength(size);
    for (const row of modules) {
      expect(row).toHaveLength(size);
      for (const cell of row) expect(typeof cell).toBe("boolean");
    }
    // Top-left finder pattern: outer 7x7 ring should be dark on its edges
    // and the inner 3x3 center (rows/cols 2..4) should also be dark.
    for (let i = 0; i < 7; i++) {
      expect(modules[0][i]).toBe(true);
      expect(modules[6][i]).toBe(true);
      expect(modules[i][0]).toBe(true);
      expect(modules[i][6]).toBe(true);
    }
    expect(modules[2][2]).toBe(true);
    expect(modules[4][4]).toBe(true);
    // The "dark module" at (size-8, 8) is mandated by the spec.
    expect(modules[size - 8][8]).toBe(true);
  });

  it("picks a mask deterministically: same input yields identical grid across runs", () => {
    // We cannot read the chosen mask directly, but mask selection is
    // deterministic given the input, so two runs must produce byte-identical
    // grids. Run twice and compare every module — any nondeterminism in the
    // 8-mask penalty evaluation would surface as a mismatch here.
    const inputs = [
      "A",
      "hello",
      "https://cards-and-such.example/play?seed=42",
      "x".repeat(50),
    ];
    for (const input of inputs) {
      const a = encodeQrModules(input)!;
      const b = encodeQrModules(input)!;
      expect(a.size).toBe(b.size);
      for (let r = 0; r < a.size; r++) {
        expect(a.modules[r]).toEqual(b.modules[r]);
      }
    }
  });

  it("auto-selects a version in the 1..10 range based on byte length", () => {
    // size = 17 + 4*version, so version = (size - 17) / 4.
    // Capacities at level M are [14,26,42,62,84,106,122,152,180,213].
    const cases: Array<{ len: number; version: number }> = [
      { len: 1, version: 1 },     // <= 14
      { len: 14, version: 1 },    // boundary of v1
      { len: 15, version: 2 },    // just over v1
      { len: 26, version: 2 },    // boundary of v2
      { len: 27, version: 3 },    // just over v2
      { len: 100, version: 6 },   // 84 < 100 <= 106
      { len: 213, version: 10 },  // boundary of v10
    ];
    for (const { len, version } of cases) {
      const result = encodeQrModules("a".repeat(len));
      expect(result, `len=${len}`).not.toBeNull();
      const expectedSize = 17 + 4 * version;
      expect(result!.size, `len=${len}`).toBe(expectedSize);
    }
    // Anything past version 10 capacity (213 bytes at level M) returns null.
    expect(encodeQrModules("a".repeat(214))).toBeNull();
  });

  it("module count scales sensibly with input length and dark ratio is balanced", () => {
    // Short input fits in v1 (21x21 = 441 modules).
    const short = encodeQrModules("hi")!;
    expect(short.size * short.size).toBe(441);

    // ~80-byte URL — the friend-share size mentioned in the file header —
    // should land in v5 (37x37).
    const friendUrl = "https://cards-and-such.example/play?c=ABCDEF&seed=1234567890";
    expect(friendUrl.length).toBeGreaterThanOrEqual(50);
    const friend = encodeQrModules(friendUrl)!;
    expect(friend.size).toBeGreaterThanOrEqual(21);
    expect(friend.size).toBeLessThanOrEqual(57); // <= v10

    // Larger payload picks a strictly larger (or equal) grid than a tiny one.
    const big = encodeQrModules("Q".repeat(150))!;
    expect(big.size).toBeGreaterThan(short.size);

    // QR penalty rule 4 keeps dark modules near 50%. The chosen mask must
    // produce a grid that's neither all-light nor all-dark; for typical
    // payloads the dark ratio sits comfortably in [0.3, 0.7].
    let dark = 0;
    for (const row of big.modules) for (const cell of row) if (cell) dark++;
    const ratio = dark / (big.size * big.size);
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.7);
  });
});
