import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SEASONS, FIELDS } from "./state.js";

const S = { dummy: false };

describe("dice-harvest", () => {
  it("starts with empty fields", () => {
    const s = initialState(1, S);
    expect(s.fields.length).toBe(FIELDS);
    expect(s.fields.every(f => f === null)).toBe(true);
  });
  it("planting fills fields", () => {
    const s = reducer(initialState(2, S), { type: "plant" });
    expect(s.fields.every(f => f !== null)).toBe(true);
  });
  it("harvest empties fields and adds score", () => {
    let s = reducer(initialState(3, S), { type: "plant" });
    s = reducer(s, { type: "harvest" });
    expect(s.fields.every(f => f === null)).toBe(true);
    expect(s.score).toBeGreaterThan(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("game ends after SEASONS seasons", () => {
    let s = initialState(5, S);
    for (let i = 0; i < SEASONS; i++) {
      s = reducer(s, { type: "plant" });
      s = reducer(s, { type: "harvest" });
    }
    expect(s.phase).toBe("done");
  });
});
