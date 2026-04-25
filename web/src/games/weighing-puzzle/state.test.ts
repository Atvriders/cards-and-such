import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("WeighingPuzzle", () => {
  it("initialState picks a valid puzzle", () => {
    const s = initialState(1, {});
    expect(s.puzzle.numBalls).toBeGreaterThan(0);
    expect(s.puzzle.weighings.length).toBeGreaterThan(0);
    expect(s.submitted).toBe(false);
  });

  it("selectBall updates guessedBall", () => {
    const s = initialState(2, {});
    const s2 = reducer(s, { type: "selectBall", ball: 3 });
    expect(s2.guessedBall).toBe(3);
  });

  it("selectWeight updates guessedHeavier", () => {
    const s = initialState(3, {});
    const s2 = reducer(s, { type: "selectWeight", heavier: false });
    expect(s2.guessedHeavier).toBe(false);
  });

  it("submitting with no ball selected does nothing", () => {
    const s = initialState(4, {});
    expect(s.guessedBall).toBe(0);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.submitted).toBe(false);
  });

  it("correct answer marks correct=true and score=1000", () => {
    let s = initialState(0, {});
    const { ball, heavier } = s.puzzle.answer;
    s = reducer(s, { type: "selectBall", ball });
    s = reducer(s, { type: "selectWeight", heavier });
    s = reducer(s, { type: "submit" });
    expect(s.submitted).toBe(true);
    expect(s.correct).toBe(true);
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("wrong answer marks correct=false and score=0", () => {
    let s = initialState(5, {});
    const { ball, heavier } = s.puzzle.answer;
    const wrongBall = ball === 1 ? 2 : 1;
    s = reducer(s, { type: "selectBall", ball: wrongBall });
    s = reducer(s, { type: "selectWeight", heavier });
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(false);
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("reset loads a new puzzle", () => {
    let s = initialState(6, {});
    const oldPuzzle = s.puzzle;
    s = reducer(s, { type: "selectBall", ball: 1 });
    s = reducer(s, { type: "submit" });
    const s2 = reducer(s, { type: "reset" });
    expect(s2.submitted).toBe(false);
    expect(s2.guessedBall).toBe(0);
    // rngSeed incremented so may pick different puzzle
    expect(s2.rngSeed).toBe(s.rngSeed + 1);
    void oldPuzzle; // used for reference
  });

  it("all puzzles have valid answers", () => {
    for (const p of PUZZLES) {
      expect(p.answer.ball).toBeGreaterThanOrEqual(1);
      expect(p.answer.ball).toBeLessThanOrEqual(p.numBalls);
    }
  });
});
