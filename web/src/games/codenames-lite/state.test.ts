import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CodenamesState } from "./state.js";

describe("initialState", () => {
  it("has 25 tiles", () => {
    const s = initialState(42);
    expect(s.tiles).toHaveLength(25);
  });

  it("has exactly 9 agent tiles", () => {
    const s = initialState(42);
    expect(s.tiles.filter(t => t.type === "agent")).toHaveLength(9);
  });

  it("has exactly 1 assassin tile", () => {
    const s = initialState(42);
    expect(s.tiles.filter(t => t.type === "assassin")).toHaveLength(1);
  });

  it("has a clue with a positive count", () => {
    const s = initialState(42);
    expect(s.clue).not.toBeNull();
    expect(s.clue!.count).toBeGreaterThan(0);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.tiles.map(t => t.word)).toEqual(s2.tiles.map(t => t.word));
  });
});

describe("reducer - guess agent", () => {
  it("reveals tile and decrements agentsLeft", () => {
    const s = initialState(10);
    const agentIdx = s.tiles.findIndex(t => t.type === "agent");
    const s2 = reducer(s, { type: "guess", tileIndex: agentIdx });
    expect(s2.tiles[agentIdx]!.revealed).toBe(true);
    expect(s2.agentsLeft).toBe(s.agentsLeft - 1);
  });
});

describe("reducer - guess assassin", () => {
  it("immediately loses the game", () => {
    const s = initialState(15);
    const assassinIdx = s.tiles.findIndex(t => t.type === "assassin");
    const s2 = reducer(s, { type: "guess", tileIndex: assassinIdx });
    expect(s2.lost).toBe(true);
  });
});

describe("reducer - guess already revealed", () => {
  it("ignores revealed tile", () => {
    const s = initialState(20);
    const agentIdx = s.tiles.findIndex(t => t.type === "agent");
    const s2 = reducer(s, { type: "guess", tileIndex: agentIdx });
    const s3 = reducer(s2, { type: "guess", tileIndex: agentIdx });
    // Should not change
    expect(s3.agentsLeft).toBe(s2.agentsLeft);
  });
});

describe("reducer - end guessing", () => {
  it("generates a new clue", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "endGuessing" });
    expect(s2.clue).not.toBeNull();
    expect(s2.log.length).toBeGreaterThan(s.log.length);
  });
});

describe("isTerminal", () => {
  it("returns null when ongoing", () => {
    expect(isTerminal(initialState(3))).toBeNull();
  });

  it("returns score 100 when won", () => {
    const s: CodenamesState = { ...initialState(3), won: true };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns score 0 when lost", () => {
    const s: CodenamesState = { ...initialState(3), lost: true };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
