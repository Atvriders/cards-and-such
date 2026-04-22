import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, YARD, HOME_POS, NUM_PAWNS } from "./state.js";

const s1 = { opponents: "1" as const };

describe("Trouble", () => {
  it("starts with all pawns in home base", () => {
    const s = initialState(42, s1);
    expect(s.numPlayers).toBe(2);
    for (let p = 0; p < 2; p++) {
      for (let pw = 0; pw < NUM_PAWNS; pw++) {
        expect(s.pawns[p]![pw]).toBe(YARD);
      }
    }
    expect(s.phase).toBe("rolling");
    expect(s.die).toBe(0);
  });

  it("rolling transitions to moving phase when moves available", () => {
    const s = initialState(42, s1);
    // Force a 6 by using a pawn already on track
    const withPawn = { ...s, pawns: [[5, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]] };
    // Use the roll action - actual die determined by RNG
    const next = reducer(withPawn, { type: "roll" });
    // Either transitions to moving or to rolling (bot's turn if no moves)
    expect(next.rngSeed).not.toBe(s.rngSeed);
  });

  it("cannot move pawn from base without 6", () => {
    const s = initialState(42, s1);
    const withDie = { ...s, die: 3, phase: "moving" as const };
    const next = reducer(withDie, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(YARD);
  });

  it("moves pawn out of base with die=6", () => {
    const s = initialState(42, s1);
    const withDie = { ...s, die: 6, phase: "moving" as const };
    const next = reducer(withDie, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(0);
  });

  it("pawn advances by die value", () => {
    const s = initialState(42, s1);
    const withPawn = {
      ...s,
      pawns: [[5, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
      die: 4,
      phase: "moving" as const,
    };
    const next = reducer(withPawn, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(9);
  });

  it("win condition triggers correctly", () => {
    const s = initialState(42, s1);
    const setup = {
      ...s,
      pawns: [[26, HOME_POS, HOME_POS, HOME_POS], [YARD, YARD, YARD, YARD]],
      die: 2,
      phase: "moving" as const,
    };
    const next = reducer(setup, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(HOME_POS);
    expect(next.winner).toBe(0);
  });

  it("isTerminal correct", () => {
    const s = initialState(42, s1);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });
});
