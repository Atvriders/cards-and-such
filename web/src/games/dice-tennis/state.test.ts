import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DiceTennisSettings } from "./state.js";

const s1: DiceTennisSettings = { sets: "1" };
const s3: DiceTennisSettings = { sets: "3" };

describe("DiceTennis initialState", () => {
  it("sets totalSets to 1", () => {
    expect(initialState(1, s1).totalSets).toBe(1);
  });

  it("sets totalSets to 3", () => {
    expect(initialState(1, s3).totalSets).toBe(3);
  });

  it("starts at 0-0 sets", () => {
    const s = initialState(1, s1);
    expect(s.playerSets).toBe(0);
    expect(s.aiSets).toBe(0);
  });

  it("starts at 0 points each", () => {
    const s = initialState(1, s1);
    expect(s.playerPoints).toBe(0);
    expect(s.aiPoints).toBe(0);
  });

  it("phase is play initially", () => {
    expect(initialState(1, s1).phase).toBe("play");
  });
});

describe("DiceTennis reducer", () => {
  it("serve changes points", () => {
    const s = initialState(1, s1);
    const s2 = reducer(s, { type: "serve", style: "slice" });
    const ptChanged = s2.playerPoints !== s.playerPoints || s2.aiPoints !== s.aiPoints;
    expect(ptChanged).toBe(true);
  });

  it("serves multiple times advances game", () => {
    let s = initialState(1, s1);
    for (let i = 0; i < 20; i++) {
      if (s.phase !== "play") break;
      s = reducer(s, { type: "serve", style: "slice" });
    }
    const progress = s.playerGames > 0 || s.aiGames > 0 || s.phase === "gameOver";
    expect(progress).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, s1);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "serve", style: "flat" });
    s = reducer(s, { type: "restart" });
    expect(s.playerSets).toBe(0);
    expect(s.aiSets).toBe(0);
    expect(s.playerPoints).toBe(0);
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s1))).toBeNull();
  });

  it("isTerminal returns 1000 for player win", () => {
    const s = { ...initialState(1, s1), phase: "gameOver" as const, playerSets: 1, aiSets: 0 };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("isTerminal returns 100 for loss", () => {
    const s = { ...initialState(1, s1), phase: "gameOver" as const, playerSets: 0, aiSets: 1 };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
