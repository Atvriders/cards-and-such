import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreShow, cardValue, TARGET_SCORE, HAND_SIZE, KEEP_SIZE } from "./state.js";

const S = { dummy: false };

describe("Cribbage Mini", () => {
  it("starts in discard phase with 4 cards each", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("discard");
    expect(s.yourHand.length).toBe(HAND_SIZE);
    expect(s.botHand.length).toBe(HAND_SIZE);
    expect(s.yourScore).toBe(0);
    expect(s.botScore).toBe(0);
  });

  it("toggleSelect adds and removes selections, capped at KEEP_SIZE", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggleSelect", idx: 0 });
    expect(s.selected).toEqual([0]);
    s = reducer(s, { type: "toggleSelect", idx: 1 });
    expect(s.selected).toEqual([0, 1]);
    s = reducer(s, { type: "toggleSelect", idx: 2 });
    expect(s.selected.length).toBe(KEEP_SIZE); // capped
    s = reducer(s, { type: "toggleSelect", idx: 0 });
    expect(s.selected).toEqual([1]);
  });

  it("cardValue follows cribbage rules (A=1, J/Q/K=10)", () => {
    expect(cardValue(0)).toBe(1); // ace
    expect(cardValue(4 * 9)).toBe(10); // 10
    expect(cardValue(4 * 10)).toBe(10); // J
    expect(cardValue(4 * 12)).toBe(10); // K
  });

  it("scoreShow scores a pair of 5s + a 5 starter as pair royal + fifteens", () => {
    // Three 5s: three pairs (3 * 2 = 6pts), and any pair of 5s = 10 (no fifteen subset)
    // Three 5s sum to 15: that's one fifteen subset (2pts).
    // Pairs: C(3,2) = 3 pairs * 2 = 6pts
    // Total: 8pts
    const cards = [4 * 4 + 0, 4 * 4 + 1, 4 * 4 + 2]; // three 5s
    const r = scoreShow(cards, false);
    expect(r.score).toBeGreaterThanOrEqual(8);
  });

  it("submit transitions to show and assigns a starter", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "toggleSelect", idx: 0 });
    s = reducer(s, { type: "toggleSelect", idx: 1 });
    s = reducer(s, { type: "submit" });
    expect(["show", "done"]).toContain(s.phase);
    expect(s.starter).not.toBeNull();
  });

  it("isTerminal null while in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("TARGET_SCORE is 31", () => {
    expect(TARGET_SCORE).toBe(31);
  });
});
