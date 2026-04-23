import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BananagramsState } from "./state.js";

const defSettings = { tileCount: "21" as const };

describe("Bananagrams initialState", () => {
  it("creates correct number of tiles", () => {
    const s = initialState(1, defSettings);
    expect(s.tiles.length).toBe(21);
    expect(s.hand.length).toBe(21);
    expect(s.placed.length).toBe(0);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.tiles).toEqual(s2.tiles);
  });

  it("starts not gameOver", () => {
    const s = initialState(1, defSettings);
    expect(s.gameOver).toBe(false);
    expect(s.score).toBe(0);
    expect(s.timeLeft).toBe(300);
  });

  it("respects tileCount setting", () => {
    const s = initialState(1, { tileCount: "15" });
    expect(s.tiles.length).toBe(15);
    expect(s.hand.length).toBe(15);
  });
});

describe("Bananagrams reducer", () => {
  function makeState(overrides: Partial<BananagramsState> = {}): BananagramsState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("selectHandTile sets selectedHandTile", () => {
    const s = makeState({ hand: [0, 1, 2] });
    const s2 = reducer(s, { type: "selectHandTile", tileId: 1 });
    expect(s2.selectedHandTile).toBe(1);
  });

  it("placeOnGrid moves tile from hand to placed", () => {
    const s = makeState({ hand: [0, 1], selectedHandTile: 0 });
    const s2 = reducer(s, { type: "placeOnGrid", row: 0, col: 0 });
    expect(s2.placed.some(t => t.id === 0)).toBe(true);
    expect(s2.hand).not.toContain(0);
    expect(s2.selectedHandTile).toBeNull();
  });

  it("pickUpTile returns tile to hand", () => {
    const s = makeState({
      tiles: ["C","A","T"],
      placed: [{ id: 0, letter: "C", row: 0, col: 0 }],
      hand: [1, 2],
    });
    const s2 = reducer(s, { type: "pickUpTile", tileId: 0 });
    expect(s2.placed).toHaveLength(0);
    expect(s2.hand).toContain(0);
  });

  it("validate with valid placement sets validationResult to valid", () => {
    const s = makeState({
      tiles: ["C","A","T"],
      placed: [
        { id: 0, letter: "C", row: 0, col: 0 },
        { id: 1, letter: "A", row: 0, col: 1 },
        { id: 2, letter: "T", row: 0, col: 2 },
      ],
      hand: [], // all placed
    });
    const s2 = reducer(s, { type: "validate" });
    expect(s2.validationResult).toBe("valid");
    expect(s2.gameOver).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });

  it("validate with empty placed returns invalid message", () => {
    const s = makeState({ placed: [], hand: [0, 1] });
    const s2 = reducer(s, { type: "validate" });
    expect(s2.validationResult).toBe("invalid");
  });

  it("tick decrements timeLeft", () => {
    const s = makeState({ timeLeft: 10 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(9);
  });

  it("tick ends game at 0", () => {
    const s = makeState({ timeLeft: 1 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });

  it("no-ops when gameOver", () => {
    const s = makeState({ gameOver: true });
    const s2 = reducer(s, { type: "selectHandTile", tileId: 0 });
    expect(s2).toBe(s);
  });
});

describe("Bananagrams isTerminal", () => {
  it("returns null when in progress", () => {
    expect(isTerminal(initialState(1, defSettings))).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 210 };
    expect(isTerminal(s)?.score).toBe(210);
  });
});
