import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DiceHockeySettings } from "./state.js";

const s2: DiceHockeySettings = { periods: "2" };
const s3: DiceHockeySettings = { periods: "3" };

describe("DiceHockey initialState", () => {
  it("sets totalPeriods to 2", () => {
    expect(initialState(1, s2).totalPeriods).toBe(2);
  });

  it("sets totalPeriods to 3", () => {
    expect(initialState(1, s3).totalPeriods).toBe(3);
  });

  it("starts at period 1", () => {
    expect(initialState(1, s2).period).toBe(1);
  });

  it("starts at puck position 5", () => {
    expect(initialState(1, s2).puckPosition).toBe(5);
  });

  it("starts with player possession", () => {
    expect(initialState(1, s2).possession).toBe("player");
  });

  it("not game over initially", () => {
    expect(initialState(1, s2).phase).toBe("play");
  });
});

describe("DiceHockey reducer", () => {
  it("skate changes game state", () => {
    const s = initialState(1, s2);
    const s2r = reducer(s, { type: "play", move: "pass" });
    // Either puck moved or lastPlay changed
    const changed = s2r.puckPosition !== s.puckPosition || s2r.seed !== s.seed;
    expect(changed).toBe(true);
  });

  it("wrist shot rejected when too far", () => {
    const s = { ...initialState(1, s2), puckPosition: 8, possession: "player" as const };
    const s2r = reducer(s, { type: "play", move: "wrist" });
    expect(s2r.lastPlay).toContain("Too far");
  });

  it("slap shot rejected when too far", () => {
    const s = { ...initialState(1, s2), puckPosition: 6, possession: "player" as const };
    const s2r = reducer(s, { type: "play", move: "slap" });
    expect(s2r.lastPlay).toContain("Too far");
  });

  it("wrist shot at position 0 can score", () => {
    const s = { ...initialState(42, s2), puckPosition: 0, possession: "player" as const };
    const s2r = reducer(s, { type: "play", move: "wrist" });
    const scored = s2r.playerScore > 0;
    const blocked = s2r.puckPosition > s.puckPosition;
    expect(scored || blocked).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, s2);
    s = reducer(s, { type: "play", move: "pass" });
    s = reducer(s, { type: "restart" });
    expect(s.puckPosition).toBe(5);
    expect(s.playerScore).toBe(0);
    expect(s.period).toBe(1);
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s2))).toBeNull();
  });

  it("isTerminal returns 1000 for player win", () => {
    const s = { ...initialState(1, s2), phase: "gameOver" as const, playerScore: 3, aiScore: 1 };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("isTerminal returns 500 for tie", () => {
    const s = { ...initialState(1, s2), phase: "gameOver" as const, playerScore: 2, aiScore: 2 };
    expect(isTerminal(s)!.score).toBe(500);
  });

  it("isTerminal returns 100 for loss", () => {
    const s = { ...initialState(1, s2), phase: "gameOver" as const, playerScore: 0, aiScore: 3 };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
