import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, LAYOUT } from "./state.js";
import { isFree } from "../_shared/mahjongEngine.js";

describe("Mahjong Fan Spread", () => {
  it("initial deal: builds tiles for full layout", () => {
    const s = initialState(42);
    expect(s.tiles.length).toBe(LAYOUT.length);
    expect(s.tiles.length).toBeGreaterThanOrEqual(12);
    expect(s.tiles.every((t) => !t.removed)).toBe(true);
    expect(s.removed).toBe(0);
    expect(s.selectedId).toBeNull();
  });

  it("each face appears in pairs (every count is even)", () => {
    const s = initialState(123);
    const counts = new Map<string, number>();
    for (const t of s.tiles) counts.set(t.face, (counts.get(t.face) ?? 0) + 1);
    for (const [, c] of counts) expect(c % 2).toBe(0);
  });

  it("clicking matches and non-matches behaves correctly", () => {
    const s = initialState(7);
    const free = s.tiles.filter((t) => isFree(t, s.tiles));
    expect(free.length).toBeGreaterThanOrEqual(1);
    let a: typeof free[number] | null = null;
    let b: typeof free[number] | null = null;
    for (let i = 0; i < free.length && !b; i++) {
      for (let j = i + 1; j < free.length && !b; j++) {
        if (free[i]!.face === free[j]!.face) { a = free[i]!; b = free[j]!; }
      }
    }
    if (a && b) {
      let cur = reducer(s, { type: "select", id: a.id });
      cur = reducer(cur, { type: "select", id: b.id });
      expect(cur.tiles.find((t) => t.id === a!.id)!.removed).toBe(true);
      expect(cur.removed).toBeGreaterThanOrEqual(2);
    } else {
      const sel = reducer(s, { type: "select", id: free[0]!.id });
      expect(sel.selectedId).toBe(free[0]!.id);
    }
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("won state yields positive score", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true, moves: 50 };
    const t = isTerminal(wonState);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });
});
