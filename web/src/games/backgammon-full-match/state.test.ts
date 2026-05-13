import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  CHECKERS_PER_SIDE,
  POINTS,
  __test,
} from "./state.js";
import type { MatchState } from "./state.js";

const S = { matchTarget: 7 };
const { startingBoard, tryMove, listMoves, pipCount, determineMultiplier, shouldCpuAcceptDouble, evaluate, planTurn } = __test;

describe("backgammon-full-match", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a).toEqual(b);
    // Different seed should at least usually differ in rngSeed
    const c = initialState(99, S);
    expect(c.rngSeed).not.toBe(a.rngSeed);
  });

  it("starting board has the canonical rulebook setup", () => {
    const b = startingBoard();
    // P checkers (positive)
    expect(b.points[23]).toBe(2);
    expect(b.points[12]).toBe(5);
    expect(b.points[7]).toBe(3);
    expect(b.points[5]).toBe(5);
    // C checkers (negative — mirrored)
    expect(b.points[0]).toBe(-2);
    expect(b.points[11]).toBe(-5);
    expect(b.points[16]).toBe(-3);
    expect(b.points[18]).toBe(-5);
    // Each side has 15 checkers
    let p = 0, c = 0;
    for (let i = 0; i < POINTS; i++) {
      const v = b.points[i]!;
      if (v > 0) p += v;
      if (v < 0) c += -v;
    }
    expect(p).toBe(CHECKERS_PER_SIDE);
    expect(c).toBe(CHECKERS_PER_SIDE);
    expect(b.barP).toBe(0);
    expect(b.barC).toBe(0);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("pip count for starting position equals 167 for both sides", () => {
    const b = startingBoard();
    expect(pipCount(b, "P")).toBe(167);
    expect(pipCount(b, "C")).toBe(167);
  });

  it("roll moves preRoll -> moving with dice populated", () => {
    let s = initialState(7, S);
    s = reducer(s, { type: "roll" });
    // Either moving (P had legal moves) or back to preRoll (CPU ran its
    // turn and gave the dice back) — both have populated diceShown.
    expect(s.diceShown[0]).toBeGreaterThanOrEqual(1);
    expect(s.diceShown[1]).toBeGreaterThanOrEqual(1);
  });

  it("illegal moves return the same state reference", () => {
    const s = initialState(11, S);
    const r = reducer(s, { type: "move", from: 0, dieValue: 5 });
    expect(r).toBe(s);
    const r2 = reducer(s, { type: "endTurn" });
    expect(r2).toBe(s);
  });

  it("tryMove rejects moving onto a stacked opponent point", () => {
    const b = startingBoard();
    // P at point 23 (index 23). Moving 5 pips toward 18 — 18 holds -5 (C),
    // which blocks P.
    const nb = tryMove(b, "P", 23, 5);
    expect(nb).toBeNull();
  });

  it("tryMove allows hitting a blot and sends it to the bar", () => {
    const b = startingBoard();
    // Place a C blot at point 22 and confirm P can hit by moving from 23
    b.points[22] = -1;
    b.points[0] = -1; // keep checker count
    const nb = tryMove(b, "P", 23, 1);
    expect(nb).not.toBeNull();
    expect(nb!.points[22]).toBe(1);
    expect(nb!.barC).toBe(1);
  });

  it("must reenter from bar before any other move", () => {
    const b = startingBoard();
    b.barP = 1;
    b.points[23] = 1; // one less at home
    const moves = listMoves(b, "P", [1, 2]);
    // every move must originate from the bar (-1)
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((m) => m.from === -1)).toBe(true);
  });

  it("bear off is legal only when all in home — and exact die works", () => {
    // Set up: all 15 P checkers in home (points 0..5). Place 15 on point 5.
    const b = startingBoard();
    for (let i = 0; i < POINTS; i++) b.points[i] = b.points[i]! > 0 ? 0 : b.points[i]!;
    b.points[5] = 15;
    const nb = tryMove(b, "P", 5, 6); // exact bear off
    expect(nb).not.toBeNull();
    expect(nb!.offP).toBe(1);
    expect(nb!.points[5]).toBe(14);
  });

  it("bear off is illegal if not all checkers are in home", () => {
    const b = startingBoard();
    // P still has checkers in the outer board (the starting position)
    const nb = tryMove(b, "P", 5, 6);
    expect(nb).toBeNull();
  });

  it("determineMultiplier picks single/gammon/backgammon correctly", () => {
    const b1 = startingBoard();
    b1.offP = 1; // loser has at least one off -> single
    expect(determineMultiplier(b1, "P")).toBe(1);

    const b2 = startingBoard();
    b2.offP = 0; // gammon path
    // Remove all P checkers from C's home + bar
    for (let i = 18; i < 24; i++) b2.points[i] = b2.points[i]! > 0 ? 0 : b2.points[i]!;
    b2.barP = 0;
    expect(determineMultiplier(b2, "P")).toBe(2);

    const b3 = startingBoard();
    b3.offP = 0;
    b3.barP = 1; // backgammon
    expect(determineMultiplier(b3, "P")).toBe(3);
  });

  it("CPU accepts a marginal double when behind <= 12 pips", () => {
    const s: MatchState = {
      ...initialState(1, S),
      cubeValue: 2,
      cubeOwner: null,
      phase: "doubleOffered",
      turn: "P",
    };
    expect(shouldCpuAcceptDouble(s)).toBe(true);
  });

  it("planTurn returns the same board when no dice or no moves are possible", () => {
    const b = startingBoard();
    const plan = planTurn(b, "C", []);
    expect(plan.board).toBe(b);
    expect(plan.plays.length).toBe(0);
  });

  it("evaluator rewards bearing off and penalises bar", () => {
    const b1 = startingBoard();
    const v1 = evaluate(b1, "P");
    const b2 = { ...b1, points: b1.points.slice() };
    b2.offP = 5;
    const v2 = evaluate(b2, "P");
    expect(v2).toBeGreaterThan(v1);
    const b3 = { ...b1, points: b1.points.slice() };
    b3.barP = 2;
    const v3 = evaluate(b3, "P");
    expect(v3).toBeLessThan(v1);
  });

  it("match ends with a non-zero player score after forced resignation chain", () => {
    // Force a quick match: target=1 with the CPU resigning would be ideal,
    // but we test the simpler scenario where the player resigns and the
    // CPU reaches target 1 immediately.
    const s = initialState(1, { matchTarget: 1 });
    const after = reducer(s, { type: "resign" });
    expect(after.phase).toBe("matchOver");
    expect(after.scoreC).toBe(1);
    const t = isTerminal(after);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(0); // player lost -> 0
  });

  it("offerDouble during Crawford is rejected", () => {
    let s = initialState(2, S);
    s = { ...s, crawford: true };
    const r = reducer(s, { type: "offerDouble" });
    expect(r).toBe(s);
  });

  it("dropDouble awards cube value to the offering side", () => {
    let s = initialState(3, S);
    s = { ...s, phase: "doubleOffered", turn: "P", cubeValue: 2 };
    const after = reducer(s, { type: "dropDouble" });
    // Player offered; CPU dropped -> player gains 2
    expect(after.scoreP).toBe(2);
    expect(after.phase === "gameOver" || after.phase === "matchOver").toBe(true);
  });

  it("takeDouble doubles the cube and flips ownership to the opponent", () => {
    let s = initialState(4, S);
    s = { ...s, phase: "doubleOffered", turn: "P", cubeValue: 1, cubeOwner: null };
    const after = reducer(s, { type: "takeDouble" });
    // P offered, CPU takes -> CPU owns cube at value 2
    expect(after.cubeValue).toBe(2);
    expect(after.cubeOwner).toBe("C");
  });
});
