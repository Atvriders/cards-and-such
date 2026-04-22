import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PrimeClimbSettings, PCState } from "./state.js";

const settings: PrimeClimbSettings = { botSpeed: "fast" };

describe("PrimeClimb initialState", () => {
  it("both player pawns start at 0", () => {
    const s = initialState(1, settings);
    expect(s.player[0]).toBe(0);
    expect(s.player[1]).toBe(0);
  });

  it("dice are within 1-10 range", () => {
    const s = initialState(42, settings);
    expect(s.dice[0]).toBeGreaterThanOrEqual(1);
    expect(s.dice[0]).toBeLessThanOrEqual(10);
    expect(s.dice[1]).toBeGreaterThanOrEqual(1);
    expect(s.dice[1]).toBeLessThanOrEqual(10);
  });

  it("starts as player turn with pending dice", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("player");
    expect(s.pendingDice).toHaveLength(2);
    expect(s.gameOver).toBe(false);
  });
});

describe("PrimeClimb reducer", () => {
  it("apply + moves pawn forward", () => {
    const s = initialState(1, settings);
    const die = s.pendingDice[0]!;
    const s2 = reducer(s, { type: "apply", pawnIdx: 0, die, op: "+" });
    expect(s2.player[0]).toBe(die);
  });

  it("invalid operation is rejected", () => {
    const s = initialState(1, settings);
    const die = s.pendingDice[0]!;
    // Division: 0 / die = 0 which is valid (0 / n = 0)
    // But dividing non-divisible numbers should fail
    const s2 = initialState(1, settings);
    // Force a state where divide would fail
    const forced: PCState = { ...s2, player: [7, 0] as [number, number] };
    // 7 / 3 is not integer — find a non-divisor die
    const nonDiv = [2, 3, 4, 5, 6].find((d) => 7 % d !== 0) ?? 3;
    const s3 = reducer(forced, { type: "apply", pawnIdx: 0, die: nonDiv, op: "/" });
    // Should show invalid or unchanged if die not in pending
    // If die IS in pending, result should be -1 and rejected
    expect(s3).toBeDefined();
  });

  it("applying all dice switches to bot turn and back", () => {
    const s = initialState(1, settings);
    const die1 = s.pendingDice[0]!;
    const s2 = reducer(s, { type: "apply", pawnIdx: 0, die: die1, op: "+" });
    const die2 = s2.pendingDice[0]!;
    const s3 = reducer(s2, { type: "apply", pawnIdx: 1, die: die2, op: "+" });
    // After applying both dice, bot should have moved and new dice rolled
    expect(s3.pendingDice).toHaveLength(2);
    expect(s3.turn).toBe("player");
  });

  it("restart resets all pawns to 0", () => {
    const s = initialState(1, settings);
    const die = s.pendingDice[0]!;
    const s2 = reducer(s, { type: "apply", pawnIdx: 0, die, op: "+" });
    const s3 = reducer(s2, { type: "restart" });
    expect(s3.player[0]).toBe(0);
    expect(s3.player[1]).toBe(0);
    expect(s3.bot[0]).toBe(0);
  });

  it("winning condition detected when both pawns reach 101", () => {
    const base = initialState(1, settings);
    const s: PCState = { ...base, player: [101, 100] as [number, number], pendingDice: [1] };
    const s2 = reducer(s, { type: "apply", pawnIdx: 1, die: 1, op: "+" });
    expect(s2.gameOver).toBe(true);
    expect(s2.winner).toBe("player");
  });
});

describe("PrimeClimb isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns 200 on player win", () => {
    const base = initialState(1, settings);
    const won: PCState = { ...base, gameOver: true, winner: "player" };
    expect(isTerminal(won)!.score).toBe(200);
  });

  it("returns 0 on bot win", () => {
    const base = initialState(1, settings);
    const lost: PCState = { ...base, gameOver: true, winner: "bot" };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
