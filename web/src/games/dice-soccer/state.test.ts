import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DiceSoccerSettings } from "./state.js";

const s2: DiceSoccerSettings = { halves: "2" };
const s4: DiceSoccerSettings = { halves: "4" };

describe("DiceSoccer initialState", () => {
  it("sets totalHalves to 2", () => {
    expect(initialState(1, s2).totalHalves).toBe(2);
  });

  it("sets totalHalves to 4", () => {
    expect(initialState(1, s4).totalHalves).toBe(4);
  });

  it("starts at half 1", () => {
    expect(initialState(1, s2).half).toBe(1);
  });

  it("starts at ball position 5", () => {
    expect(initialState(1, s2).ballPosition).toBe(5);
  });

  it("starts with player possession", () => {
    expect(initialState(1, s2).possession).toBe("player");
  });

  it("not game over initially", () => {
    expect(initialState(1, s2).phase).toBe("play");
  });
});

describe("DiceSoccer reducer", () => {
  it("dribble changes ball position", () => {
    const s = initialState(1, s2);
    const s2r = reducer(s, { type: "play", move: "dribble" });
    expect(s2r.ballPosition).not.toBe(s.ballPosition);
  });

  it("cannot shoot from position below 6", () => {
    const s = { ...initialState(1, s2), ballPosition: 3, possession: "player" as const };
    const s2r = reducer(s, { type: "play", move: "shoot" });
    expect(s2r.lastPlay).toContain("Too far");
  });

  it("restart resets state", () => {
    let s = initialState(1, s2);
    s = reducer(s, { type: "play", move: "dribble" });
    s = reducer(s, { type: "restart" });
    expect(s.ballPosition).toBe(5);
    expect(s.playerScore).toBe(0);
    expect(s.aiScore).toBe(0);
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("isTerminal returns 1000 for player win", () => {
    const s = { ...initialState(1, s2), phase: "gameOver" as const, playerScore: 3, aiScore: 1 };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("isTerminal returns 500 for draw", () => {
    const s = { ...initialState(1, s2), phase: "gameOver" as const, playerScore: 1, aiScore: 1 };
    expect(isTerminal(s)!.score).toBe(500);
  });

  it("isTerminal returns 100 for loss", () => {
    const s = { ...initialState(1, s2), phase: "gameOver" as const, playerScore: 0, aiScore: 2 };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
