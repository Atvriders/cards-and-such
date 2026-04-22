import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, YARD, HOME_SQUARE, NUM_PAWNS } from "./state.js";

const defaultSettings = { opponents: "1" as const };

describe("Parcheesi", () => {
  it("initializes with all pawns in yard", () => {
    const s = initialState(42, defaultSettings);
    expect(s.numPlayers).toBe(2);
    for (let p = 0; p < 2; p++) {
      for (let pw = 0; pw < NUM_PAWNS; pw++) {
        expect(s.pawns[p]![pw]).toBe(YARD);
      }
    }
    expect(s.turn).toBe(0);
    expect(s.phase).toBe("rolling");
    expect(s.winner).toBeNull();
  });

  it("rolling dice changes rngSeed", () => {
    const s = initialState(42, defaultSettings);
    const next = reducer(s, { type: "roll" });
    // Seed must change after rolling
    expect(next.rngSeed).not.toBe(s.rngSeed);
  });

  it("rolling with a moveable pawn transitions to moving phase", () => {
    const s = initialState(42, defaultSettings);
    // Put a pawn on the track so any die value can be used
    const withPawn = { ...s, pawns: [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]] };
    const next = reducer(withPawn, { type: "roll" });
    // Some roll values might pass turn if no legal move, but with pawn at 10, all values 1-6 are valid
    expect(next.phase).toBe("moving");
    expect(next.dice).toHaveLength(2);
    expect(next.dice[0]).toBeGreaterThanOrEqual(1);
    expect(next.dice[0]).toBeLessThanOrEqual(6);
  });

  it("cannot move pawn from yard without die=5", () => {
    const s = initialState(42, defaultSettings);
    // Set up: after roll, force dice to [3, 4]
    const withDice = { ...s, dice: [3, 4], usedDice: [false, false], phase: "moving" as const };
    const next = reducer(withDice, { type: "move", pawn: 0, dieIndex: 0 });
    // Should be rejected (pawn still in yard, die=3 not 5)
    expect(next.pawns[0]![0]).toBe(YARD);
  });

  it("can move pawn from yard with die=5", () => {
    const s = initialState(42, defaultSettings);
    const withDice = { ...s, dice: [5, 3], usedDice: [false, false], phase: "moving" as const };
    const next = reducer(withDice, { type: "move", pawn: 0, dieIndex: 0 });
    expect(next.pawns[0]![0]).toBe(0); // entered at position 0
  });

  it("pawn advances by die value after entering track", () => {
    const s = initialState(42, defaultSettings);
    // Put pawn 0 at position 10
    const withPawn = {
      ...s,
      pawns: [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
      dice: [4, 2],
      usedDice: [false, false],
      phase: "moving" as const,
    };
    const next = reducer(withPawn, { type: "move", pawn: 0, dieIndex: 0 });
    expect(next.pawns[0]![0]).toBe(14);
  });

  it("pawn captures opponent on non-safe square", () => {
    const s = initialState(42, defaultSettings);
    // Player 0 pawn at 5, opponent pawn 0 at 9 (absolute = entry[1]+relPos, but for p=1 entry=13, so rel=9 maps to abs 22 != 9)
    // Let's set both on non-safe absolute 10: player0 at rel 10, bot at rel 10 (bot entry=13 so abs=23... not same)
    // Simpler: place both so they share absolute position 10
    // Player 0 abs = (0 + rel) % 52 = rel; Bot abs = (13 + rel) % 52
    // For player 0 at rel=7 → abs=7; bot at rel=47 → abs=(13+47)%52=8 not same
    // Player 0 at rel=17 → abs=17; bot at rel=(17-13+52)%52=4 → abs=(13+4)=17 ✓ (non-safe)
    const withPawns = {
      ...s,
      pawns: [[17, YARD, YARD, YARD], [4, YARD, YARD, YARD]],
      dice: [3, 2],
      usedDice: [false, false],
      phase: "moving" as const,
    };
    // Move player 0 pawn to rel 20 (abs 20) — no capture since not at 17
    // Instead, move player0 from rel 14 by 3 to reach rel 17 (abs 17)
    const setup = {
      ...s,
      pawns: [[14, YARD, YARD, YARD], [4, YARD, YARD, YARD]],
      dice: [3, 2],
      usedDice: [false, false],
      phase: "moving" as const,
    };
    const next = reducer(setup, { type: "move", pawn: 0, dieIndex: 0 });
    // Player 0 pawn lands at rel 17 (abs 17, non-safe)
    // Bot pawn at rel 4 → abs (13+4)=17 → gets sent home
    expect(next.pawns[0]![0]).toBe(17);
    expect(next.pawns[1]![0]).toBe(YARD);
  });

  it("isTerminal returns null mid-game and score at game over", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
    const won = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("game ends when all 4 pawns reach home", () => {
    const s = initialState(42, defaultSettings);
    // Place player 0 with 3 pawns home and 1 at position 49
    const setup = {
      ...s,
      pawns: [[49, HOME_SQUARE, HOME_SQUARE, HOME_SQUARE], [YARD, YARD, YARD, YARD]],
      dice: [3, 2],
      usedDice: [false, false],
      phase: "moving" as const,
    };
    const next = reducer(setup, { type: "move", pawn: 0, dieIndex: 0 });
    // 49 + 3 = 52 = HOME_SQUARE → winner
    expect(next.pawns[0]![0]).toBe(HOME_SQUARE);
    expect(next.winner).toBe(0);
  });
});
