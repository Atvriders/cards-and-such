import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, compareWar, MAX_ROUNDS } from "./state.js";
const S = { dummy: false };

describe("MiniWar", () => {
  it("starts with 26 cards each, ready phase", () => {
    const s = initialState(1, S);
    expect(s.player.length).toBe(26);
    expect(s.cpu.length).toBe(26);
    expect(s.phase).toBe("ready");
  });

  it("flip moves into reveal or war and increments round", () => {
    const s = reducer(initialState(1, S), { type: "flip" });
    expect(["reveal", "war", "done"]).toContain(s.phase);
    expect(s.round).toBe(1);
    expect(s.playerPlayed.length).toBeGreaterThan(0);
  });

  it("compareWar treats Ace high", () => {
    const ace = { suit: "♠" as const, rank: 1 as const, id: "a" };
    const king = { suit: "♥" as const, rank: 13 as const, id: "k" };
    expect(compareWar(ace, king)).toBe(1);
    expect(compareWar(king, ace)).toBe(-1);
  });

  it("after MAX_ROUNDS, game is done", () => {
    let s = initialState(7, S);
    for (let i = 0; i < MAX_ROUNDS * 4 && s.phase !== "done"; i++) {
      if (s.phase === "ready") s = reducer(s, { type: "flip" });
      else if (s.phase === "war") s = reducer(s, { type: "warFlip" });
      else if (s.phase === "reveal") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
