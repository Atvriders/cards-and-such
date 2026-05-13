import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  areAdjacent,
  isValidPath,
  pathToWord,
  wordScore,
  canTrace,
  isValidWord,
  BOGGLE_DICE_1992,
  DICTIONARY,
} from "./state.js";

const defaults = { duration: "180" as const };

describe("boggle-full constants", () => {
  it("has 16 standard Boggle dice", () => {
    expect(BOGGLE_DICE_1992.length).toBe(16);
    for (const d of BOGGLE_DICE_1992) expect(d.length).toBe(6);
  });

  it("embedded dictionary has plenty of common words", () => {
    expect(DICTIONARY.size).toBeGreaterThan(2000);
    expect(DICTIONARY.has("CAT")).toBe(true);
    expect(DICTIONARY.has("HOUSE")).toBe(true);
    expect(DICTIONARY.has("ZZZZZZ")).toBe(false);
  });

  it("isValidWord is case-insensitive", () => {
    expect(isValidWord("cat")).toBe(true);
    expect(isValidWord("Cat")).toBe(true);
    expect(isValidWord("CAT")).toBe(true);
  });
});

describe("boggle-full initialState", () => {
  it("produces a 16-letter grid with uppercase letters", () => {
    const s = initialState(7, defaults);
    expect(s.grid.length).toBe(16);
    for (const c of s.grid) expect(/^[A-Z]$/.test(c)).toBe(true);
  });

  it("is deterministic for the same seed and settings", () => {
    const a = initialState(123, defaults);
    const b = initialState(123, defaults);
    expect(a.grid).toEqual(b.grid);
    expect(a.timeLeft).toBe(b.timeLeft);
    expect(a.cpuScore).toBe(b.cpuScore);
    expect(a.cpuWords).toEqual(b.cpuWords);
  });

  it("differs across seeds (at least sometimes)", () => {
    const a = initialState(1, defaults);
    const b = initialState(2, defaults);
    expect(a.grid).not.toEqual(b.grid);
  });

  it("starts with empty state and CPU pre-solved", () => {
    const s = initialState(42, defaults);
    expect(s.currentPath).toEqual([]);
    expect(s.foundWords).toEqual([]);
    expect(s.playerScore).toBe(0);
    expect(s.done).toBe(false);
    expect(s.cpuScore).toBeGreaterThanOrEqual(0);
    expect(s.cpuWords.length).toBeGreaterThanOrEqual(0);
  });

  it("honours the 90/180/300 duration setting", () => {
    expect(initialState(1, { duration: "90" }).timeLeft).toBe(90);
    expect(initialState(1, { duration: "180" }).timeLeft).toBe(180);
    expect(initialState(1, { duration: "300" }).timeLeft).toBe(300);
  });
});

describe("boggle-full adjacency and paths", () => {
  it("recognises horizontal/diagonal adjacency in a 4x4", () => {
    expect(areAdjacent(0, 1)).toBe(true);   // (0,0)-(0,1)
    expect(areAdjacent(0, 5)).toBe(true);   // diagonal
    expect(areAdjacent(0, 4)).toBe(true);   // vertical
    expect(areAdjacent(0, 2)).toBe(false);  // distance 2
    expect(areAdjacent(0, 0)).toBe(false);  // self
    expect(areAdjacent(3, 4)).toBe(false);  // wraps across rows ((0,3)-(1,0))
  });

  it("isValidPath accepts adjacent chains, rejects revisits and jumps", () => {
    expect(isValidPath([0, 1, 2, 3])).toBe(true);
    expect(isValidPath([0, 1, 0])).toBe(false);
    expect(isValidPath([0, 2])).toBe(false);
  });

  it("pathToWord stitches letters", () => {
    expect(pathToWord([0, 1, 2], ["C", "A", "T", "D"])).toBe("CAT");
  });
});

describe("boggle-full wordScore", () => {
  it("scores by length per spec", () => {
    expect(wordScore(2)).toBe(0);
    expect(wordScore(3)).toBe(1);
    expect(wordScore(4)).toBe(1);
    expect(wordScore(5)).toBe(2);
    expect(wordScore(6)).toBe(3);
    expect(wordScore(7)).toBe(5);
    expect(wordScore(8)).toBe(11);
    expect(wordScore(12)).toBe(11);
  });
});

describe("boggle-full canTrace", () => {
  // Grid:
  //  C A T S
  //  O R E D
  //  H I N G
  //  Z Y X W
  const grid = [
    "C", "A", "T", "S",
    "O", "R", "E", "D",
    "H", "I", "N", "G",
    "Z", "Y", "X", "W",
  ];
  it("finds a simple horizontal word (CAT)", () => {
    expect(canTrace("CAT", grid)).toBe(true);
  });
  it("accepts a longer adjacent chain (CATSD via (0,0)-(0,1)-(0,2)-(0,3)-(1,3))", () => {
    expect(canTrace("CATSD", grid)).toBe(true);
  });
  it("rejects a word that requires revisits (CATCH — only one C on grid)", () => {
    expect(canTrace("CATCH", grid)).toBe(false);
  });
  it("rejects words that don't appear on the grid at all", () => {
    expect(canTrace("ZEBRA", grid)).toBe(false);
  });
});

describe("boggle-full reducer — tick", () => {
  it("decrements timeLeft each tick", () => {
    const s = initialState(1, defaults);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(s.timeLeft - 1);
  });

  it("sets done when timer hits 0", () => {
    const s = { ...initialState(1, defaults), timeLeft: 1 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.done).toBe(true);
  });

  it("ignores actions after done (returns same reference)", () => {
    const s = { ...initialState(1, defaults), done: true };
    expect(reducer(s, { type: "tick" })).toBe(s);
    expect(reducer(s, { type: "selectCell", index: 0 })).toBe(s);
    expect(reducer(s, { type: "submitWord" })).toBe(s);
    expect(reducer(s, { type: "clearPath" })).toBe(s);
  });
});

describe("boggle-full reducer — selectCell", () => {
  it("adds the first cell to the path", () => {
    const s = initialState(1, defaults);
    const s2 = reducer(s, { type: "selectCell", index: 5 });
    expect(s2.currentPath).toEqual([5]);
    expect(s2.error).toBeNull();
  });

  it("rejects a non-adjacent next cell with an error message", () => {
    const s = initialState(1, defaults);
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "selectCell", index: 15 });
    expect(b.error).toMatch(/adjacent/i);
    expect(b.currentPath).toEqual([0]);
  });

  it("retraces back when clicking a cell already in the path", () => {
    const s = initialState(1, defaults);
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "selectCell", index: 1 });
    const c = reducer(b, { type: "selectCell", index: 2 });
    const d = reducer(c, { type: "selectCell", index: 1 });
    expect(d.currentPath).toEqual([0, 1]);
  });

  it("ignores out-of-bounds indices (same state reference)", () => {
    const s = initialState(1, defaults);
    expect(reducer(s, { type: "selectCell", index: -1 })).toBe(s);
    expect(reducer(s, { type: "selectCell", index: 99 })).toBe(s);
  });
});

describe("boggle-full reducer — submitWord", () => {
  it("rejects a path shorter than 3 with an error", () => {
    const s = initialState(1, defaults);
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "selectCell", index: 1 });
    const c = reducer(b, { type: "submitWord" });
    expect(c.error).toMatch(/short/i);
    expect(c.currentPath).toEqual([]);
  });

  it("accepts a real dictionary word built on the grid and scores it", () => {
    // Force-edit the grid to CAT at indices 0,1,2 so the assertion is
    // independent of the random roll.
    const base = initialState(1, defaults);
    const grid = [...base.grid];
    grid[0] = "C"; grid[1] = "A"; grid[2] = "T";
    const s = { ...base, grid };
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "selectCell", index: 1 });
    const c = reducer(b, { type: "selectCell", index: 2 });
    const d = reducer(c, { type: "submitWord" });
    expect(d.foundWords).toContain("CAT");
    expect(d.playerScore).toBe(1);
    expect(d.currentPath).toEqual([]);
    expect(d.error).toBeNull();
  });

  it("rejects a duplicate find", () => {
    const base = initialState(1, defaults);
    const grid = [...base.grid];
    grid[0] = "C"; grid[1] = "A"; grid[2] = "T";
    const s = { ...base, grid, foundWords: ["CAT"] };
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "selectCell", index: 1 });
    const c = reducer(b, { type: "selectCell", index: 2 });
    const d = reducer(c, { type: "submitWord" });
    expect(d.error).toMatch(/already/i);
    expect(d.playerScore).toBe(0);
  });

  it("rejects non-words", () => {
    const base = initialState(1, defaults);
    const grid = [...base.grid];
    grid[0] = "X"; grid[1] = "Q"; grid[2] = "Z";
    const s = { ...base, grid };
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "selectCell", index: 1 });
    const c = reducer(b, { type: "selectCell", index: 2 });
    const d = reducer(c, { type: "submitWord" });
    expect(d.error).toMatch(/not a word/i);
  });
});

describe("boggle-full reducer — clearPath", () => {
  it("clears any in-progress path", () => {
    const s = initialState(1, defaults);
    const a = reducer(s, { type: "selectCell", index: 0 });
    const b = reducer(a, { type: "clearPath" });
    expect(b.currentPath).toEqual([]);
    expect(b.error).toBeNull();
  });
});

describe("boggle-full isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(1, defaults);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns the raw playerScore when the player loses to the CPU", () => {
    const s = { ...initialState(1, defaults), done: true, playerScore: 0, cpuScore: 5 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("awards a 100-point win bonus when player beats CPU", () => {
    const s = { ...initialState(1, defaults), done: true, playerScore: 10, cpuScore: 5 };
    expect(isTerminal(s)).toEqual({ score: 110 });
  });

  it("no bonus on tie", () => {
    const s = { ...initialState(1, defaults), done: true, playerScore: 5, cpuScore: 5 };
    expect(isTerminal(s)).toEqual({ score: 5 });
  });
});

describe("boggle-full full-game scenario", () => {
  it("plays out a one-word run and ends with the right total", () => {
    const base = initialState(99, { duration: "90" });
    const grid = [...base.grid];
    grid[0] = "C"; grid[1] = "A"; grid[2] = "T";
    // Make CPU score zero so we know exactly what bonus applies.
    let s = { ...base, grid, cpuScore: 0, cpuWords: [] as string[] };
    s = reducer(s, { type: "selectCell", index: 0 });
    s = reducer(s, { type: "selectCell", index: 1 });
    s = reducer(s, { type: "selectCell", index: 2 });
    s = reducer(s, { type: "submitWord" });
    expect(s.playerScore).toBe(1);
    // Burn time until done.
    while (!s.done) s = reducer(s, { type: "tick" });
    const t = isTerminal(s);
    // 1 point + 100-point beat-CPU bonus = 101.
    expect(t).toEqual({ score: 101 });
  });
});
