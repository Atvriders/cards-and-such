import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalJumps, countPegs, hasAnyMove } from "./state.js";
import type { EuroPegSolitaireState } from "./state.js";

const settings = { variant: "european" as const };

describe("EuroPegSolitaire initialState", () => {
  it("has 37 valid cells", () => {
    const s = initialState(1, settings);
    const validCount = s.valid.filter(Boolean).length;
    expect(validCount).toBe(37);
  });

  it("starts with 36 pegs (center empty)", () => {
    const s = initialState(1, settings);
    const pegs = countPegs(s.cells, s.valid);
    expect(pegs).toBe(36);
  });

  it("center cell (row 3, col 3 = index 24) is empty", () => {
    const s = initialState(1, settings);
    expect(s.cells[3 * 7 + 3]).toBe("empty");
  });

  it("is not won at start", () => {
    const s = initialState(1, settings);
    expect(s.won).toBe(false);
  });

  it("has legal moves at start", () => {
    const s = initialState(1, settings);
    expect(hasAnyMove(s.cells, s.valid)).toBe(true);
  });

  it("extra corner cells are valid (e.g. row 0, col 2)", () => {
    const s = initialState(1, settings);
    expect(s.valid[0 * 7 + 2]).toBe(true);
    expect(s.valid[0 * 7 + 0]).toBe(false); // extreme corner invalid
  });
});

describe("EuroPegSolitaire getLegalJumps", () => {
  it("returns jumps over adjacent pegs into empty holes", () => {
    const s = initialState(1, settings);
    // center empty; peg at row 3, col 1 (index 22) can jump over col 2 to center
    const jumps = getLegalJumps(s.cells, s.valid, 22);
    expect(jumps.some((j) => j.to === 24)).toBe(true);
  });

  it("returns empty array for empty cell", () => {
    const s = initialState(1, settings);
    const jumps = getLegalJumps(s.cells, s.valid, 24); // center is empty
    expect(jumps.length).toBe(0);
  });

  it("no jumps for isolated peg", () => {
    const s = initialState(1, settings);
    const cells = s.cells.slice() as import("./state.js").PegState[];
    for (let i = 0; i < 49; i++) cells[i] = "empty";
    cells[24] = "peg";
    expect(getLegalJumps(cells, s.valid, 24).length).toBe(0);
  });
});

describe("EuroPegSolitaire reducer", () => {
  it("select a peg sets selected", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", index: 22 });
    expect(s2.selected).toBe(22);
  });

  it("valid jump removes jumped peg and places peg at destination", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "jump", from: 22, over: 23, to: 24 });
    expect(s2.cells[22]).toBe("empty");
    expect(s2.cells[23]).toBe("empty");
    expect(s2.cells[24]).toBe("peg");
    expect(s2.movesMade).toBe(1);
  });

  it("invalid jump is rejected", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "jump", from: 22, over: 23, to: 99 });
    expect(s2.movesMade).toBe(0);
  });

  it("select same peg twice deselects", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", index: 22 });
    const s3 = reducer(s2, { type: "select", index: 22 });
    expect(s3.selected).toBeNull();
  });
});

describe("EuroPegSolitaire isTerminal", () => {
  it("returns null at start (moves available)", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 1000 when exactly 1 peg in center", () => {
    const s = initialState(1, settings);
    const cells = new Array(49).fill("empty") as import("./state.js").PegState[];
    cells[3 * 7 + 3] = "peg";
    const wonState: EuroPegSolitaireState = { ...s, cells, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(1000);
  });

  it("score decreases with more pegs remaining", () => {
    const s = initialState(1, settings);
    const cells = new Array(49).fill("empty") as import("./state.js").PegState[];
    cells[3 * 7 + 3] = "peg";
    cells[3 * 7 + 1] = "peg";
    const stuck: EuroPegSolitaireState = { ...s, cells, won: false };
    const result = isTerminal(stuck);
    if (result !== null) expect(result.score).toBe(870); // 1000 - 1*130
  });

  it("score floors at 50", () => {
    const s = initialState(1, settings);
    const stuck: EuroPegSolitaireState = { ...s, won: false };
    const r = isTerminal(stuck);
    if (r !== null) expect(r.score).toBeGreaterThanOrEqual(50);
  });
});
