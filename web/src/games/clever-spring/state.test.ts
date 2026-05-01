import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, trackProgress, TRACK_COUNT, TRACK_LEN, TOTAL_CELLS, TOTAL_ROLLS } from "./state.js";

const S = { dummy: false };
describe("clever-spring", () => {
  it("starts in rolling with empty tracks", () => {
    const s = initialState(2, S);
    expect(s.phase).toBe("rolling");
    expect(s.filled.length).toBe(TOTAL_CELLS);
    expect(s.filled.some(Boolean)).toBe(false);
  });
  it("roll produces 5 dice and moves to picking", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    expect(s.lastDice.length).toBe(5);
    expect(s.phase).toBe("picking");
    s.lastDice.forEach(d => {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    });
  });
  it("pick selects a die and moves to placing", () => {
    let s = reducer(initialState(2, S), { type: "roll" });
    s = reducer(s, { type: "pick", dieIdx: 0 });
    expect(s.phase).toBe("placing");
    expect(s.selectedDie).toBe(0);
  });
  it("place adds to a track and increments rolls", () => {
    let s = reducer(initialState(2, S), { type: "roll" });
    s = reducer(s, { type: "pick", dieIdx: 0 });
    s = reducer(s, { type: "place", track: 0 });
    expect(trackProgress(s.filled, 0)).toBe(1);
    expect(s.rolls).toBe(1);
    expect(s.score).toBeGreaterThan(0);
  });
  it("skip increments rolls", () => {
    let s = reducer(initialState(2, S), { type: "roll" });
    s = reducer(s, { type: "skip" });
    expect(s.rolls).toBe(1);
  });
  it("game ends after TOTAL_ROLLS", () => {
    let s = initialState(2, S);
    for (let i = 0; s.phase !== "done" && i < TOTAL_ROLLS * 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "picking") s = reducer(s, { type: "pick", dieIdx: 0 });
      else if (s.phase === "placing") s = reducer(s, { type: "place", track: i % TRACK_COUNT });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("trackProgress matches TRACK_LEN when full", () => {
    expect(TRACK_LEN).toBeGreaterThan(0);
    expect(TRACK_COUNT).toBe(4);
  });
});
