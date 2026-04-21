import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MemoryMatchState } from "./state.js";

const s8 = { size: "8" as const };
const s6 = { size: "6" as const };
const s12 = { size: "12" as const };
const s18 = { size: "18" as const };

// Helper: build a near-win state with all but the last pair matched
function nearWinState(seed = 42): { state: MemoryMatchState; lastPairIndices: [number, number] } {
  const s = initialState(seed, s8);
  const pairs = 8;
  // Find all unique symbols and match all pairs except the last two cards
  const mutableState = s.state.slice() as ("hidden" | "flipped" | "matched")[];

  // Group indices by symbol
  const bySymbol = new Map<string, number[]>();
  for (let i = 0; i < s.symbols.length; i++) {
    const sym = s.symbols[i]!;
    if (!bySymbol.has(sym)) bySymbol.set(sym, []);
    bySymbol.get(sym)!.push(i);
  }

  const symbolEntries = [...bySymbol.entries()];
  // Match all but the last pair
  let lastPair: [number, number] = [0, 1];
  for (let p = 0; p < symbolEntries.length; p++) {
    const [, indices] = symbolEntries[p]!;
    if (p < symbolEntries.length - 1) {
      mutableState[indices[0]!] = "matched";
      mutableState[indices[1]!] = "matched";
    } else {
      lastPair = [indices[0]!, indices[1]!];
    }
  }

  return {
    state: {
      ...s,
      state: mutableState,
      matched: pairs - 1,
      attempts: pairs - 1,
    },
    lastPairIndices: lastPair,
  };
}

describe("MemoryMatch initialState", () => {
  it("all cells hidden, firstFlipped=null, matched=0, won=false, correct symbol count", () => {
    const s = initialState(42, s8);
    expect(s.state.every((c) => c === "hidden")).toBe(true);
    expect(s.firstFlipped).toBeNull();
    expect(s.matched).toBe(0);
    expect(s.won).toBe(false);
    expect(s.symbols.length).toBe(16); // 8 pairs
    expect(s.attempts).toBe(0);
    expect(s.pendingMismatch).toBeNull();
  });

  it("each symbol appears exactly twice", () => {
    for (const settings of [s6, s8, s12, s18]) {
      const s = initialState(99, settings);
      const counts = new Map<string, number>();
      for (const sym of s.symbols) {
        counts.set(sym, (counts.get(sym) ?? 0) + 1);
      }
      for (const [, count] of counts) {
        expect(count).toBe(2);
      }
      expect(counts.size).toBe(parseInt(settings.size, 10));
    }
  });

  it("grid dimensions are correct for each size", () => {
    expect(initialState(1, s6)).toMatchObject({ rows: 3, cols: 4 });
    expect(initialState(1, s8)).toMatchObject({ rows: 4, cols: 4 });
    expect(initialState(1, s12)).toMatchObject({ rows: 4, cols: 6 });
    expect(initialState(1, s18)).toMatchObject({ rows: 6, cols: 6 });
  });
});

describe("MemoryMatch determinism", () => {
  it("is deterministic under same seed and settings", () => {
    const s1 = initialState(42, s8);
    const s2 = initialState(42, s8);
    expect([...s1.symbols]).toEqual([...s2.symbols]);
    expect([...s1.state]).toEqual([...s2.state]);
  });

  it("produces different layouts for different seeds", () => {
    const s1 = initialState(1, s8);
    const s2 = initialState(2, s8);
    expect([...s1.symbols]).not.toEqual([...s2.symbols]);
  });
});

describe("MemoryMatch flip — first card", () => {
  it("cell becomes flipped and firstFlipped records index", () => {
    const s = initialState(42, s8);
    const s2 = reducer(s, { type: "flip", index: 0 });
    expect(s2.state[0]).toBe("flipped");
    expect(s2.firstFlipped).toBe(0);
  });
});

describe("MemoryMatch flip — second card match", () => {
  it("both become matched, matched++, firstFlipped cleared", () => {
    const s = initialState(42, s8);
    // Find a matching pair
    const bySymbol = new Map<string, number[]>();
    for (let i = 0; i < s.symbols.length; i++) {
      const sym = s.symbols[i]!;
      if (!bySymbol.has(sym)) bySymbol.set(sym, []);
      bySymbol.get(sym)!.push(i);
    }
    const [a, b] = [...bySymbol.values()][0]! as [number, number];

    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });

    expect(cur.state[a]).toBe("matched");
    expect(cur.state[b]).toBe("matched");
    expect(cur.matched).toBe(1);
    expect(cur.firstFlipped).toBeNull();
    expect(cur.pendingMismatch).toBeNull();
  });
});

describe("MemoryMatch flip — second card mismatch", () => {
  it("both remain flipped, pendingMismatch set, attempts++", () => {
    const s = initialState(42, s8);
    // Find a non-matching pair
    let a = -1;
    let b = -1;
    for (let i = 0; i < s.symbols.length && b === -1; i++) {
      for (let j = i + 1; j < s.symbols.length && b === -1; j++) {
        if (s.symbols[i] !== s.symbols[j]) {
          a = i;
          b = j;
        }
      }
    }

    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });

    expect(cur.state[a]).toBe("flipped");
    expect(cur.state[b]).toBe("flipped");
    expect(cur.pendingMismatch).toEqual([a, b]);
    expect(cur.attempts).toBe(1);
    expect(cur.firstFlipped).toBeNull();
  });
});

describe("MemoryMatch dismiss-mismatch", () => {
  it("flips pending pair back to hidden and clears pending", () => {
    const s = initialState(42, s8);
    let a = -1;
    let b = -1;
    for (let i = 0; i < s.symbols.length && b === -1; i++) {
      for (let j = i + 1; j < s.symbols.length && b === -1; j++) {
        if (s.symbols[i] !== s.symbols[j]) {
          a = i;
          b = j;
        }
      }
    }

    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });
    expect(cur.pendingMismatch).not.toBeNull();

    cur = reducer(cur, { type: "dismiss-mismatch" });
    expect(cur.state[a]).toBe("hidden");
    expect(cur.state[b]).toBe("hidden");
    expect(cur.pendingMismatch).toBeNull();
  });
});

describe("MemoryMatch — flip during pendingMismatch", () => {
  it("auto-dismisses old pending and starts a new pair", () => {
    const s = initialState(42, s8);
    let a = -1;
    let b = -1;
    let c = -1;
    for (let i = 0; i < s.symbols.length && b === -1; i++) {
      for (let j = i + 1; j < s.symbols.length && b === -1; j++) {
        if (s.symbols[i] !== s.symbols[j]) {
          a = i;
          b = j;
        }
      }
    }
    // Find a third card that's different from a and b
    for (let i = 0; i < s.symbols.length; i++) {
      if (i !== a && i !== b) { c = i; break; }
    }

    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b }); // mismatch
    expect(cur.pendingMismatch).not.toBeNull();

    cur = reducer(cur, { type: "flip", index: c }); // auto-dismiss, then flip c
    expect(cur.state[a]).toBe("hidden"); // old pending dismissed
    expect(cur.state[b]).toBe("hidden");
    expect(cur.state[c]).toBe("flipped");
    expect(cur.firstFlipped).toBe(c);
    expect(cur.pendingMismatch).toBeNull();
  });
});

describe("MemoryMatch — flipping non-hidden cells is a no-op", () => {
  it("flipping an already-flipped cell does nothing", () => {
    const s = initialState(42, s8);
    let cur = reducer(s, { type: "flip", index: 0 });
    const before = { ...cur };
    cur = reducer(cur, { type: "flip", index: 0 }); // already flipped
    expect(cur.state[0]).toBe("flipped");
    expect(cur.firstFlipped).toBe(before.firstFlipped);
  });

  it("flipping an already-matched cell does nothing", () => {
    const s = initialState(42, s8);
    const bySymbol = new Map<string, number[]>();
    for (let i = 0; i < s.symbols.length; i++) {
      const sym = s.symbols[i]!;
      if (!bySymbol.has(sym)) bySymbol.set(sym, []);
      bySymbol.get(sym)!.push(i);
    }
    const [a, b] = [...bySymbol.values()][0]! as [number, number];
    let cur = reducer(s, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b }); // matched
    expect(cur.state[a]).toBe("matched");

    const before = cur.matched;
    cur = reducer(cur, { type: "flip", index: a }); // try to flip matched
    expect(cur.matched).toBe(before);
    expect(cur.state[a]).toBe("matched");
  });
});

describe("MemoryMatch — winning", () => {
  it("won becomes true when all pairs are matched", () => {
    const { state: near, lastPairIndices: [a, b] } = nearWinState(42);
    let cur = reducer(near, { type: "flip", index: a });
    cur = reducer(cur, { type: "flip", index: b });
    expect(cur.won).toBe(true);
    expect(cur.matched).toBe(8);
  });
});

describe("MemoryMatch isTerminal", () => {
  it("returns null when game is not won", () => {
    const s = initialState(42, s8);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won, perfect play gives pairs*200", () => {
    const s = initialState(42, s8);
    const wonState: MemoryMatchState = { ...s, won: true, attempts: 8, matched: 8 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    // perfect: pairs*200 - (8-8)*20 = 1600
    expect(result?.score).toBe(1600);
  });

  it("score decreases with mismatches", () => {
    const s = initialState(42, s8);
    const wonState: MemoryMatchState = { ...s, won: true, attempts: 12, matched: 8 };
    const result = isTerminal(wonState);
    // 8*200 - (12-8)*20 = 1600 - 80 = 1520
    expect(result?.score).toBe(1520);
  });

  it("score has minimum floor of 100", () => {
    const s = initialState(42, s8);
    const wonState: MemoryMatchState = { ...s, won: true, attempts: 999, matched: 8 };
    const result = isTerminal(wonState);
    expect(result?.score).toBe(100);
  });
});
