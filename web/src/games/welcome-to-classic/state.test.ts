import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalAt, placeValue, ROW_LEN, ROW_COUNT, TOTAL_SLOTS, TOTAL_ROLLS } from "./state.js";

const S = { dummy: false };
describe("welcome-to-classic", () => {
  it("starts empty in rolling phase", () => {
    const s = initialState(11, S);
    expect(s.phase).toBe("rolling");
    expect(s.values.length).toBe(TOTAL_SLOTS);
    expect(s.values.every(v => v === null)).toBe(true);
  });
  it("roll moves to placing with lastRoll set", () => {
    const s = reducer(initialState(11, S), { type: "roll" });
    expect(s.phase).toBe("placing");
    expect(s.lastRoll).not.toBeNull();
  });
  it("legalAt rejects non-ascending placements", () => {
    const v = new Array(TOTAL_SLOTS).fill(null);
    v[0] = 5;
    expect(legalAt(v, 1, 4)).toBe(false); // 4 to the right of 5 violates ascending
    expect(legalAt(v, 1, 6)).toBe(true);
  });
  it("place fills slot and adds score", () => {
    let s = reducer(initialState(11, S), { type: "roll" });
    const r = s.lastRoll!;
    const before = s.score;
    s = reducer(s, { type: "place", index: 0 });
    expect(s.values[0]).toBe(r);
    expect(s.score).toBeGreaterThan(before);
  });
  it("skip applies a small penalty and increments rolls", () => {
    let s = reducer(initialState(11, S), { type: "roll" });
    s = reducer(s, { type: "skip" });
    expect(s.rolls).toBe(1);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("placeValue rewards consecutive neighbors", () => {
    const v = new Array(TOTAL_SLOTS).fill(null);
    v[0] = 3;
    expect(placeValue(4, 1, v)).toBeGreaterThanOrEqual(4);
  });
  it("isTerminal null while playing, completes after rolls used", () => {
    let s = initialState(11, S);
    expect(isTerminal(s)).toBeNull();
    for (let i = 0; s.phase !== "done" && i < TOTAL_ROLLS * 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else {
        // try first legal slot, else skip
        let placed = false;
        for (let j = 0; j < TOTAL_SLOTS; j++) {
          if (legalAt(s.values, j, s.lastRoll ?? 0)) {
            s = reducer(s, { type: "place", index: j });
            placed = true;
            break;
          }
        }
        if (!placed) s = reducer(s, { type: "skip" });
      }
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("ROW_LEN * ROW_COUNT equals TOTAL_SLOTS", () => {
    expect(ROW_LEN * ROW_COUNT).toBe(TOTAL_SLOTS);
  });
});
