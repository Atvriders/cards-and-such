import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Kite Fight", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(7);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("move");
    expect(s.kites).toHaveLength(4);
    expect(s.cuts).toBe(0);
    expect(s.kites.filter(k => k.isPlayer)).toHaveLength(1);
  });

  it("movePlayer changes player position", () => {
    const s = initialState(7);
    const player = s.kites.find(k => k.isPlayer)!;
    const s2 = reducer(s, { type: "movePlayer", dx: 1, dy: 0 });
    const movedPlayer = s2.kites.find(k => k.isPlayer)!;
    expect(movedPlayer.x).toBe(Math.min(8, player.x + 1));
  });

  it("player cannot move outside 0-8 grid", () => {
    const s = initialState(7);
    // Force player to edge
    const edgeKites = s.kites.map(k => k.isPlayer ? { ...k, x: 0, y: 0 } : k);
    const s1 = { ...s, kites: edgeKites };
    const s2 = reducer(s1, { type: "movePlayer", dx: -5, dy: -5 });
    const player = s2.kites.find(k => k.isPlayer)!;
    expect(player.x).toBe(0);
    expect(player.y).toBe(0);
  });

  it("confirmMove advances round", () => {
    const s = initialState(7);
    const s2 = reducer(s, { type: "confirmMove" });
    expect(s2.round).toBe(2);
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(7))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = { ...initialState(7), phase: "done" as const, score: 200 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("all opponents dead triggers done phase", () => {
    const s = initialState(7);
    const deadKites = s.kites.map(k => k.isPlayer ? k : { ...k, alive: false });
    const s2 = reducer({ ...s, kites: deadKites }, { type: "confirmMove" });
    expect(s2.phase).toBe("done");
  });
});
