import { describe, it, expect } from "vitest";
import { hashSettings } from "./hashSettings";

describe("hashSettings", () => {
  it("is deterministic and returns an 8-character lowercase hex string", () => {
    const a = hashSettings({ difficulty: "easy", players: 4, foo: true });
    const b = hashSettings({ difficulty: "easy", players: 4, foo: true });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}$/);
  });

  it("is insensitive to key insertion order", () => {
    const a = hashSettings({ a: 1, b: 2, c: 3 });
    const b = hashSettings({ c: 3, b: 2, a: 1 });
    const c = hashSettings({ b: 2, a: 1, c: 3 });
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("produces different hashes for different values and handles edge cases", () => {
    const empty = hashSettings({});
    const one = hashSettings({ x: 1 });
    const two = hashSettings({ x: 2 });
    const nested = hashSettings({ x: { y: 1 } });

    expect(empty).toMatch(/^[0-9a-f]{8}$/);
    expect(one).not.toBe(two);
    expect(one).not.toBe(empty);
    expect(nested).not.toBe(one);
  });
});
