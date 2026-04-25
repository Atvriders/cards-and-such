import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "normal" as const };

describe("initialState", () => {
  it("starts with correct resources", () => {
    const s = initialState(1, settings);
    expect(s.colonists).toBe(5);
    expect(s.oxygen).toBe(10);
    expect(s.food).toBe(10);
    expect(s.minerals).toBe(8);
    expect(s.turn).toBe(1);
    expect(s.buildings).toHaveLength(0);
    expect(s.over).toBe(false);
  });
});

describe("reducer build", () => {
  it("builds a mine when resources are sufficient", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "build", building: "mine" });
    expect(s2.buildings).toHaveLength(1);
    expect(s2.buildings[0]!.type).toBe("mine");
    expect(s2.minerals).toBe(s.minerals - 2);
  });

  it("rejects build when insufficient resources", () => {
    const s = { ...initialState(1, settings), minerals: 0, research: 0 };
    const s2 = reducer(s, { type: "build", building: "habitat" });
    expect(s2.buildings).toHaveLength(0);
    expect(s2.log).toMatch(/not enough/i);
  });
});

describe("reducer end-turn", () => {
  it("produces resources each turn", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "end-turn" });
    expect(s2.turn).toBe(2);
    expect(s2.minerals).toBeGreaterThan(s.minerals); // mine-less still gets 1
  });

  it("colony dies if oxygen drops to zero", () => {
    const s = { ...initialState(1, settings), oxygen: 1, colonists: 10 };
    const s2 = reducer(s, { type: "end-turn" });
    expect(s2.over).toBe(true);
  });

  it("game ends at max turns", () => {
    let s = initialState(1, settings);
    s = { ...s, turn: s.maxTurns };
    const s2 = reducer(s, { type: "end-turn" });
    expect(s2.over).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 1500 };
    expect(isTerminal(s)!.score).toBe(1500);
  });
});
