import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreHand, calcTotalScore } from "./state.js";

const def = {};

describe("CribbageSquare initialState", () => {
  it("starts in placing phase", () => {
    expect(initialState(1, def).phase).toBe("placing");
  });

  it("has empty grid", () => {
    const s = initialState(1, def);
    expect(s.grid.filter(c => c !== null).length).toBe(0);
  });

  it("first currentCard is set", () => {
    expect(initialState(1, def).currentCard).not.toBeNull();
  });

  it("is deterministic", () => {
    expect(initialState(5, def).currentCard).toBe(initialState(5, def).currentCard);
  });
});

describe("CribbageSquare reducer", () => {
  it("place puts card in grid", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "place", cellIndex: 0 });
    expect(s2.grid[0]).not.toBeNull();
  });

  it("cannot place in occupied cell", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "place", cellIndex: 0 });
    const card2 = s2.currentCard;
    const s3 = reducer(s2, { type: "place", cellIndex: 0 });
    expect(s3.currentCard).toBe(card2);
  });

  it("after 16 placements phase is done", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 16; i++) s = reducer(s, { type: "place", cellIndex: i });
    expect(s.phase).toBe("done");
  });

  it("score calculated after done", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 16; i++) s = reducer(s, { type: "place", cellIndex: i });
    expect(typeof s.score).toBe("number");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});

describe("CribbageSquare scoreHand", () => {
  it("scores pair correctly", () => {
    // Two 5s = pair = 2pts + two 15s = 4pts total = 6
    const fiveOfSpades = 3;  // rank 3 = 5 (2+3=5)
    const fiveOfHearts = 16; // 13+3=16
    const twoOfSpades = 0;
    const threeOfSpades = 1;
    const pts = scoreHand([fiveOfSpades, fiveOfHearts, twoOfSpades, threeOfSpades]);
    expect(pts).toBeGreaterThanOrEqual(2); // at least the pair
  });

  it("returns 0 for partial hand", () => {
    expect(scoreHand([null!, null!, null!, null!])).toBe(0);
  });
});

describe("CribbageSquare isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 16; i++) s = reducer(s, { type: "place", cellIndex: i });
    expect(isTerminal(s)).not.toBeNull();
  });
});
