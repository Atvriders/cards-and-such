import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "normal" as const };

describe("initialState", () => {
  it("starts with correct values", () => {
    const s = initialState(1, settings);
    expect(s.population).toBe(10);
    expect(s.food).toBe(20);
    expect(s.turn).toBe(1);
    expect(s.over).toBe(false);
  });
});

describe("recruit", () => {
  it("recruits a worker and deducts food", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "recruit", role: "worker" });
    expect(s2.workers).toBe(s.workers + 1);
    expect(s2.food).toBe(s.food - 3);
  });

  it("rejects recruit when food is too low", () => {
    const s = { ...initialState(1, settings), food: 1 };
    const s2 = reducer(s, { type: "recruit", role: "soldier" });
    expect(s2.soldiers).toBe(s.soldiers);
    expect(s2.log).toMatch(/not enough food/i);
  });
});

describe("dig", () => {
  it("adds a tunnel and deducts food", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "dig" });
    expect(s2.tunnels).toBe(s.tunnels + 1);
    expect(s2.food).toBe(s.food - 5);
  });
});

describe("end-turn and isTerminal", () => {
  it("advances turn", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "end-turn" });
    expect(s2.turn).toBe(2);
  });

  it("ends when maxTurns reached", () => {
    let s = { ...initialState(1, settings), turn: 20 };
    s = reducer(s, { type: "end-turn" });
    expect(s.over).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("null terminal during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
});
