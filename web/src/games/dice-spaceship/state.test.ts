import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TRACK_LENGTH, STARTING_FUEL, STARTING_HULL } from "./state.js";

const S = { dummy: false };

describe("dice-spaceship", () => {
  it("starts at sector 0 with full fuel and hull", () => {
    const s = initialState(1, S);
    expect(s.pos).toBe(0);
    expect(s.fuel).toBe(STARTING_FUEL);
    expect(s.hull).toBe(STARTING_HULL);
  });

  it("thrust burns 2 fuel and advances", () => {
    const s = reducer(initialState(2, S), { type: "act", choice: "thrust" });
    expect(s.fuel).toBe(STARTING_FUEL - 2);
    expect(s.pos).toBeGreaterThan(0);
  });

  it("drift consumes no fuel", () => {
    const s = reducer(initialState(3, S), { type: "act", choice: "drift" });
    expect(s.fuel).toBe(STARTING_FUEL);
  });

  it("scan never takes hull damage", () => {
    let s = initialState(99, S);
    for (let i = 0; i < 5 && s.phase === "choose"; i++) {
      s = reducer(s, { type: "act", choice: "scan" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.hull).toBe(STARTING_HULL);
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("eventually arrives or sinks across many actions", () => {
    let s = initialState(7, S);
    for (let i = 0; i < 100 && s.phase !== "done"; i++) {
      if (s.phase === "choose") s = reducer(s, { type: "act", choice: s.fuel > 0 ? "thrust" : "drift" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(s.pos === TRACK_LENGTH || s.hull === 0).toBe(true);
  });
});
