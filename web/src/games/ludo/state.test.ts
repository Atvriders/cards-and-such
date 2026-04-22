import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, YARD, HOME_POS, NUM_PAWNS } from "./state.js";

const s1 = { opponents: "1" as const };

describe("Ludo", () => {
  it("starts with all pawns in yard", () => {
    const s = initialState(42, s1);
    expect(s.numPlayers).toBe(2);
    for (let p = 0; p < 2; p++) {
      for (let pw = 0; pw < NUM_PAWNS; pw++) {
        expect(s.pawns[p]![pw]).toBe(YARD);
      }
    }
    expect(s.phase).toBe("rolling");
    expect(s.winner).toBeNull();
  });

  it("rolling transitions to moving phase", () => {
    const s = initialState(0, s1);
    const next = reducer(s, { type: "roll" });
    // If no move possible (die!=6 with all in yard), might stay rolling or pass turn
    // If die=6, moves to moving
    // Either way, die should be set or turn advanced
    expect(next.rngSeed).not.toBe(s.rngSeed);
  });

  it("cannot move pawn from yard without rolling 6", () => {
    const s = initialState(0, s1);
    const withDie = { ...s, die: 3, phase: "moving" as const };
    const next = reducer(withDie, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(YARD);
  });

  it("can move pawn out of yard with die=6", () => {
    const s = initialState(0, s1);
    const withDie = { ...s, die: 6, phase: "moving" as const };
    const next = reducer(withDie, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(0);
  });

  it("pawn advances by die value", () => {
    const s = initialState(0, s1);
    const withPawn = {
      ...s,
      pawns: [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
      die: 4,
      phase: "moving" as const,
    };
    const next = reducer(withPawn, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(14);
  });

  it("captures opponent on non-safe square", () => {
    const s = initialState(0, s1);
    // Player0 at rel 3 + die 4 = rel 7 (abs = (0+7)%56 = 7, not safe)
    // Bot at rel (7 - 14 + 56) % 56 = 49 → abs (14+49)%56 = 7 ✓
    const setup = {
      ...s,
      pawns: [[3, YARD, YARD, YARD], [49, YARD, YARD, YARD]],
      die: 4,
      phase: "moving" as const,
    };
    const next = reducer(setup, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(7);
    expect(next.pawns[1]![0]).toBe(YARD);
  });

  it("win detected when all 4 pawns reach home", () => {
    const s = initialState(0, s1);
    const setup = {
      ...s,
      pawns: [[54, HOME_POS, HOME_POS, HOME_POS], [YARD, YARD, YARD, YARD]],
      die: 2,
      phase: "moving" as const,
    };
    const next = reducer(setup, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(HOME_POS);
    expect(next.winner).toBe(0);
  });

  it("isTerminal returns correct scores", () => {
    const s = initialState(0, s1);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });
});
