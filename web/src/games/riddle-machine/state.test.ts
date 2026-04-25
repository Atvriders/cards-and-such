import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, RIDDLES } from "./state.js";

describe("RiddleMachine", () => {
  it("initialState shuffles riddles into queue", () => {
    const s = initialState(1, {});
    expect(s.queue).toHaveLength(RIDDLES.length);
    expect(s.currentIndex).toBe(0);
    expect(s.totalScore).toBe(0);
  });

  it("selectOption sets selectedOption", () => {
    const s = initialState(2, {});
    const s2 = reducer(s, { type: "selectOption", option: 2 });
    expect(s2.selectedOption).toBe(2);
  });

  it("submit without selection does nothing", () => {
    const s = initialState(3, {});
    const s2 = reducer(s, { type: "submit" });
    expect(s2.submitted).toBe(false);
  });

  it("correct answer increases totalScore and streak", () => {
    let s = initialState(0, {});
    const riddle = RIDDLES[s.queue[0]!]!;
    s = reducer(s, { type: "selectOption", option: riddle.correctIndex });
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(true);
    expect(s.totalScore).toBeGreaterThan(0);
    expect(s.streak).toBe(1);
  });

  it("wrong answer gives 0 roundScore and resets streak", () => {
    let s = initialState(0, {});
    const riddle = RIDDLES[s.queue[0]!]!;
    const wrongOpt = riddle.correctIndex === 0 ? 1 : 0;
    s = reducer(s, { type: "selectOption", option: wrongOpt });
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(false);
    expect(s.roundScore).toBe(0);
    expect(s.streak).toBe(0);
  });

  it("streak bonus accumulates on consecutive correct answers", () => {
    let s = initialState(5, {});
    for (let turn = 0; turn < 3; turn++) {
      const riddle = RIDDLES[s.queue[s.currentIndex]!]!;
      s = reducer(s, { type: "selectOption", option: riddle.correctIndex });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    // After 3 correct, streak should be 3
    expect(s.streak).toBe(3);
    expect(s.totalScore).toBeGreaterThan(600); // at least 200+250+300
  });

  it("next advances to next riddle", () => {
    let s = initialState(6, {});
    s = reducer(s, { type: "selectOption", option: 0 });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "next" });
    expect(s.submitted).toBe(false);
    expect(s.selectedOption).toBeNull();
  });

  it("isTerminal returns null when not submitted", () => {
    const s = initialState(7, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("all riddles have valid correctIndex", () => {
    for (const r of RIDDLES) {
      expect(r.correctIndex).toBeGreaterThanOrEqual(0);
      expect(r.correctIndex).toBeLessThan(r.options.length);
    }
  });
});
