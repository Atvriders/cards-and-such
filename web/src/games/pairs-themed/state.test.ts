import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, THEMES } from "./state.js";
import type { PairsThemedState } from "./state.js";

const defaultSettings = { theme: "animals" as const, size: "16" as const };

describe("PairsThemed — initialState", () => {
  it("creates correct grid size for each size setting", () => {
    expect(initialState(1, { theme: "animals", size: "12" })).toMatchObject({ rows: 3, cols: 4 });
    expect(initialState(1, { theme: "animals", size: "16" })).toMatchObject({ rows: 4, cols: 4 });
    expect(initialState(1, { theme: "animals", size: "24" })).toMatchObject({ rows: 4, cols: 6 });
    expect(initialState(1, { theme: "animals", size: "36" })).toMatchObject({ rows: 6, cols: 6 });
  });

  it("each symbol appears exactly twice in grid", () => {
    for (const size of ["12", "16", "24", "36"] as const) {
      const s = initialState(42, { theme: "flags", size });
      const counts = new Map<string, number>();
      for (const sym of s.symbols) counts.set(sym, (counts.get(sym) ?? 0) + 1);
      for (const [, count] of counts) expect(count).toBe(2);
      expect(counts.size).toBe(parseInt(size, 10));
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.symbols).toEqual(s2.symbols);
  });

  it("all themes have enough symbols for largest size (36)", () => {
    for (const theme of Object.keys(THEMES) as (keyof typeof THEMES)[]) {
      expect(THEMES[theme].length).toBeGreaterThanOrEqual(36);
    }
  });
});

describe("PairsThemed — flip mechanics", () => {
  it("flipping hidden cell changes state to flipped", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "flip", index: 0 });
    expect(s2.state[0]).toBe("flipped");
    expect(s2.firstFlipped).toBe(0);
  });

  it("matching pair sets both to matched", () => {
    const s = initialState(42, defaultSettings);
    const bySymbol = new Map<string, number[]>();
    s.symbols.forEach((sym, i) => {
      if (!bySymbol.has(sym)) bySymbol.set(sym, []);
      bySymbol.get(sym)!.push(i);
    });
    const [a, b] = [...bySymbol.values()][0]! as [number, number];
    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });
    expect(cur.state[a]).toBe("matched");
    expect(cur.state[b]).toBe("matched");
    expect(cur.matched).toBe(1);
  });

  it("non-matching pair sets pendingMismatch", () => {
    const s = initialState(42, defaultSettings);
    let a = -1, b = -1;
    for (let i = 0; i < s.symbols.length && b === -1; i++) {
      for (let j = i + 1; j < s.symbols.length && b === -1; j++) {
        if (s.symbols[i] !== s.symbols[j]) { a = i; b = j; }
      }
    }
    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });
    expect(cur.pendingMismatch).toEqual([a, b]);
  });

  it("dismiss-mismatch resets both to hidden", () => {
    const s = initialState(42, defaultSettings);
    let a = -1, b = -1;
    for (let i = 0; i < s.symbols.length && b === -1; i++) {
      for (let j = i + 1; j < s.symbols.length && b === -1; j++) {
        if (s.symbols[i] !== s.symbols[j]) { a = i; b = j; }
      }
    }
    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });
    cur = reducer(cur, { type: "dismiss-mismatch" });
    expect(cur.state[a]).toBe("hidden");
    expect(cur.state[b]).toBe("hidden");
    expect(cur.pendingMismatch).toBeNull();
  });

  it("isTerminal returns score on win", () => {
    const s = initialState(42, { theme: "animals", size: "12" });
    const won: PairsThemedState = { ...s, won: true, attempts: 12, matched: 12 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(12 * 200); // perfect play
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });
});
