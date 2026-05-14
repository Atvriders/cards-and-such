import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  canMove,
  hasAnyMove,
  posToAbs,
  YARD,
  FINISH,
  NUM_PAWNS,
  NUM_PLAYERS,
  STRETCH_START,
  TRACK_SIZE,
} from "./state.js";
import type { TroubleFullState } from "./state.js";

const settings = { _dummy: false };

function clonePawns(state: TroubleFullState): number[][] {
  return state.pawns.map((row) => [...row]);
}

describe("Trouble (Full 4-Pawn)", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(123, settings);
    const b = initialState(123, settings);
    expect(a).toEqual(b);
    // Different seeds produce different rngSeed (everything else equal).
    const c = initialState(124, settings);
    expect(c.rngSeed).not.toBe(a.rngSeed);
  });

  it("starts with 4 players, all 4 pegs in yard, rolling phase", () => {
    const s = initialState(42, settings);
    expect(s.numPlayers).toBe(NUM_PLAYERS);
    expect(s.pawns).toHaveLength(NUM_PLAYERS);
    for (let p = 0; p < NUM_PLAYERS; p++) {
      expect(s.pawns[p]).toHaveLength(NUM_PAWNS);
      for (let pw = 0; pw < NUM_PAWNS; pw++) {
        expect(s.pawns[p]![pw]).toBe(YARD);
      }
    }
    expect(s.phase).toBe("rolling");
    expect(s.die).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.finishOrder).toEqual([]);
  });

  it("isTerminal returns null on a fresh state", () => {
    const s = initialState(7, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("rejects illegal actions and returns same state reference", () => {
    const s = initialState(1, settings);
    // Move action while in rolling phase = no-op.
    const r1 = reducer(s, { type: "move", pawn: 0 });
    expect(r1).toBe(s);
    // Pass while in rolling phase = no-op.
    const r2 = reducer(s, { type: "pass" });
    expect(r2).toBe(s);
    // Out-of-range pawn move = no-op even in moving phase.
    const moving: TroubleFullState = { ...s, phase: "moving", die: 6 };
    const r3 = reducer(moving, { type: "move", pawn: 99 });
    expect(r3).toBe(moving);
  });

  it("cannot move a peg out of yard without rolling a 6", () => {
    const s = initialState(1, settings);
    const setup: TroubleFullState = { ...s, phase: "moving", die: 3 };
    const r = reducer(setup, { type: "move", pawn: 0 });
    // No legal move (no 6) -> reducer returns same state.
    expect(r).toBe(setup);
    expect(canMove(setup.pawns, 0, 0, 3)).toBe(false);
    expect(canMove(setup.pawns, 0, 0, 6)).toBe(true);
  });

  it("moves a peg from yard onto entry square (rel 0) on a 6", () => {
    const s = initialState(1, settings);
    const setup: TroubleFullState = { ...s, phase: "moving", die: 6 };
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r.pawns[0]![0]).toBe(0);
    // Rolling a 6 grants another turn — so it's still player 0's turn,
    // back in rolling phase.
    expect(r.turn).toBe(0);
    expect(r.phase).toBe("rolling");
  });

  it("advances a peg by the rolled die value on the shared track", () => {
    const s = initialState(1, settings);
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 4,
      pawns: [[5, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r.pawns[0]![0]).toBe(9);
  });

  it("captures opponent on the shared track (non-safe square) and sends them to yard", () => {
    const s = initialState(1, settings);
    // Player 0 at rel 4 (abs 4). Player 1 also at rel 25 -> abs (7+25)%28 = 4.
    // Player 0 rolls 1 to land on abs 4. Abs 4 is NOT a safe start.
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 1,
      pawns: [[3, YARD, YARD, YARD], [25, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    expect(posToAbs(0, 4)).toBe(4);
    expect(posToAbs(1, 25)).toBe(4);
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r.pawns[0]![0]).toBe(4);
    expect(r.pawns[1]![0]).toBe(YARD); // Bumped back.
  });

  it("safe squares (own start) cannot be captured on", () => {
    const s = initialState(1, settings);
    // Player 1 sits on abs 0 (player 0's start, also a safe square in the
    // global SAFE_ABS set). Player 0 rolls 6 to bring a peg out onto rel 0
    // which is abs 0. Safe square -> opponent NOT captured.
    // Player 1 at rel 21 means abs (7+21)%28 = 0.
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 6,
      pawns: [[YARD, YARD, YARD, YARD], [21, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    expect(posToAbs(1, 21)).toBe(0);
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r.pawns[0]![0]).toBe(0);
    expect(r.pawns[1]![0]).toBe(21); // Not bumped.
  });

  it("cannot land on own peg", () => {
    const s = initialState(1, settings);
    // Two own pegs at rel 5 and 8; rolling 3 from rel 5 would land on rel 8
    // (occupied by own peg) — illegal.
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 3,
      pawns: [[5, 8, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    expect(canMove(setup.pawns, 0, 0, 3)).toBe(false);
    // Pawn 1 (at rel 8) can still move to rel 11.
    expect(canMove(setup.pawns, 0, 1, 3)).toBe(true);
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r).toBe(setup); // illegal move -> same state ref
  });

  it("requires exact roll to finish; over-roll is illegal", () => {
    const s = initialState(1, settings);
    // Peg at FINISH-1 (=31, stretch slot 4/4). Rolling 2 over-rolls; rolling 1 finishes.
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 2,
      pawns: [[FINISH - 1, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    expect(canMove(setup.pawns, 0, 0, 2)).toBe(false);
    expect(canMove(setup.pawns, 0, 0, 1)).toBe(true);
    // With die=2 nothing moves -> reducer returns same state ref.
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r).toBe(setup);
    // With die=1 the peg reaches FINISH.
    const setup1: TroubleFullState = { ...setup, die: 1 };
    const r1 = reducer(setup1, { type: "move", pawn: 0 });
    expect(r1.pawns[0]![0]).toBe(FINISH);
  });

  it("declares winner and updates isTerminal when all 4 pegs reach FINISH", () => {
    const s = initialState(1, settings);
    // Three pegs already home, one at stretch_start (28). Rolling 4 finishes.
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 4,
      pawns: [
        [STRETCH_START, FINISH, FINISH, FINISH],
        [YARD, YARD, YARD, YARD],
        [YARD, YARD, YARD, YARD],
        [YARD, YARD, YARD, YARD],
      ],
    };
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r.pawns[0]!.every((p) => p === FINISH)).toBe(true);
    expect(r.winner).toBe(0);
    expect(r.finishOrder[0]).toBe(0);
    const term = isTerminal(r);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(10); // rank 0 -> 10
  });

  it("after a 6-roll move the turn stays with the same player (bonus turn)", () => {
    const s = initialState(1, settings);
    const setup: TroubleFullState = {
      ...s,
      phase: "moving",
      die: 6,
      pawns: [[5, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]],
    };
    const r = reducer(setup, { type: "move", pawn: 0 });
    expect(r.pawns[0]![0]).toBe(11);
    expect(r.turn).toBe(0);
    expect(r.phase).toBe("rolling");
  });

  it("hasAnyMove correctly reflects legality across pegs", () => {
    const s = initialState(1, settings);
    // All in yard, die=3 -> no legal move.
    expect(hasAnyMove(s.pawns, 0, 3)).toBe(false);
    // All in yard, die=6 -> first peg can enter.
    expect(hasAnyMove(s.pawns, 0, 6)).toBe(true);
    // One on track at rel 5, die=3 -> moves to rel 8 (legal).
    const withPeg: number[][] = clonePawns(s);
    withPeg[0] = [5, YARD, YARD, YARD];
    expect(hasAnyMove(withPeg, 0, 3)).toBe(true);
  });

  it("posToAbs wraps correctly around TRACK_SIZE", () => {
    expect(posToAbs(0, 0)).toBe(0);
    expect(posToAbs(0, 27)).toBe(27);
    expect(posToAbs(1, 0)).toBe(7);
    expect(posToAbs(3, 10)).toBe((21 + 10) % TRACK_SIZE);
  });
});
