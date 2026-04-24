import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, ANSWERS } from "./state.js";

describe("Magic8Ball", () => {
  it("starts with no answer and empty history", () => {
    const s = initialState(0, { shakeCount: "10" });
    expect(s.currentAnswer).toBeNull();
    expect(s.history).toHaveLength(0);
    expect(s.shakesUsed).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("shake with a question records history entry and answer", () => {
    const s0 = initialState(42, { shakeCount: "10" });
    const s1 = reducer(s0, { type: "setQuestion", question: "Will I win?" });
    const s2 = reducer(s1, { type: "shake" });
    expect(s2.currentAnswer).not.toBeNull();
    expect(ANSWERS).toContainEqual(s2.currentAnswer);
    expect(s2.history).toHaveLength(1);
    expect(s2.history[0]?.question).toBe("Will I win?");
    expect(s2.shakesUsed).toBe(1);
  });

  it("shake without a question does nothing", () => {
    const s0 = initialState(1, { shakeCount: "10" });
    const s1 = reducer(s0, { type: "shake" });
    expect(s1.shakesUsed).toBe(0);
    expect(s1.currentAnswer).toBeNull();
  });

  it("game ends after maxShakes are used", () => {
    let s = initialState(7, { shakeCount: "10" });
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "setQuestion", question: `Question ${i}` });
      s = reducer(s, { type: "shake" });
    }
    expect(s.gameOver).toBe(true);
    expect(s.shakesUsed).toBe(10);
  });

  it("isTerminal returns null while game is ongoing", () => {
    const s = initialState(0, { shakeCount: "20" });
    expect(isTerminal(s)).toBeNull();
  });

  it("unlimited mode never auto-ends the game", () => {
    let s = initialState(3, { shakeCount: "unlimited" });
    for (let i = 0; i < 50; i++) {
      s = reducer(s, { type: "setQuestion", question: `Q${i}` });
      s = reducer(s, { type: "shake" });
    }
    expect(s.gameOver).toBe(false);
    expect(s.shakesUsed).toBe(50);
  });

  it("reset creates fresh state", () => {
    let s = initialState(5, { shakeCount: "10" });
    s = reducer(s, { type: "setQuestion", question: "Test?" });
    s = reducer(s, { type: "shake" });
    const reset = reducer(s, { type: "reset" });
    expect(reset.history).toHaveLength(0);
    expect(reset.shakesUsed).toBe(0);
    expect(reset.currentAnswer).toBeNull();
  });
});
