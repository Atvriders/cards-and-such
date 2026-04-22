import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, YARD, HOME_SQ, NUM_PAWNS } from "./state.js";
import type { SorryState } from "./state.js";

const s1 = { opponents: "1" as const };

describe("Sorry!", () => {
  it("starts with all pawns in yard and a shuffled deck", () => {
    const s = initialState(42, s1);
    expect(s.numPlayers).toBe(2);
    for (let p = 0; p < 2; p++) {
      for (let pw = 0; pw < NUM_PAWNS; pw++) {
        expect(s.pawns[p]![pw]).toBe(YARD);
      }
    }
    expect(s.deck.length).toBeGreaterThan(0);
    expect(s.phase).toBe("drawing");
    expect(s.winner).toBeNull();
  });

  it("drawing a card transitions to choosing phase (or skips if no move)", () => {
    const s = initialState(42, s1);
    const next = reducer(s, { type: "draw" });
    // With all pawns in yard, only card 1 or Sorry/Swap can matter
    // Either moved to choosing or turn passed to bot
    expect(next.rngSeed).not.toBe(s.rngSeed);
  });

  it("card 1 lets you bring a pawn out of yard", () => {
    const base = initialState(42, s1);
    const s: SorryState = {
      ...base,
      currentCard: 1,
      phase: "choosing",
      pawns: [[YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(0);
  });

  it("pawn advances forward by card value", () => {
    const base = initialState(42, s1);
    const s: SorryState = {
      ...base,
      currentCard: 5,
      phase: "choosing",
      pawns: [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(15);
  });

  it("card 4 moves pawn backward 4 spaces", () => {
    const base = initialState(42, s1);
    const s: SorryState = {
      ...base,
      currentCard: 4,
      phase: "choosing",
      pawns: [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(6);
  });

  it("Sorry card sends opponent pawn home", () => {
    const base = initialState(42, s1);
    const s: SorryState = {
      ...base,
      currentCard: "Sorry",
      phase: "choosing",
      pawns: [[YARD, YARD, YARD, YARD], [20, YARD, YARD, YARD]],
    };
    const next = reducer(s, { type: "sorry", targetPlayer: 1, targetPawn: 0 });
    expect(next.pawns[1]![0]).toBe(YARD);
  });

  it("isTerminal returns correct scores", () => {
    const s = initialState(42, s1);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });

  it("win detected when all 4 pawns reach home", () => {
    const base = initialState(42, s1);
    const s: SorryState = {
      ...base,
      currentCard: 3,
      phase: "choosing",
      pawns: [[42, HOME_SQ, HOME_SQ, HOME_SQ], [YARD, YARD, YARD, YARD]],
    };
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(HOME_SQ);
    expect(next.winner).toBe(0);
  });
});
