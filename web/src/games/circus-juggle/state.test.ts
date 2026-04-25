import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CircusJuggleSettings } from "./state.js";

const s3: CircusJuggleSettings = { items: "3" };
const s5: CircusJuggleSettings = { items: "5" };

describe("CircusJuggle initialState", () => {
  it("starts with 3 balls", () => {
    expect(initialState(1, s3).balls).toHaveLength(3);
  });

  it("starts with 5 balls", () => {
    expect(initialState(1, s5).balls).toHaveLength(5);
  });

  it("starts with 0 catches and 0 drops", () => {
    const s = initialState(1, s3);
    expect(s.catchCount).toBe(0);
    expect(s.dropCount).toBe(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s3).gameOver).toBe(false);
  });
});

describe("CircusJuggle reducer", () => {
  it("restart resets state", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "tick" });
    s = reducer(s, { type: "restart" });
    expect(s.round).toBe(0);
    expect(s.catchCount).toBe(0);
  });

  it("catching a low ball increases catchCount", () => {
    const s = initialState(1, s3);
    const lowBall = { ...s.balls[0]!, height: 1, ascending: true };
    const forced = { ...s, balls: [lowBall, ...s.balls.slice(1)] };
    const s2 = reducer(forced, { type: "catch", id: 0 });
    expect(s2.catchCount).toBe(1);
    expect(s2.streak).toBe(1);
  });

  it("catching a high ball counts as miss", () => {
    const s = initialState(1, s3);
    const highBall = { ...s.balls[0]!, height: 8 };
    const forced = { ...s, balls: [highBall, ...s.balls.slice(1)] };
    const s2 = reducer(forced, { type: "catch", id: 0 });
    expect(s2.dropCount).toBe(1);
    expect(s2.streak).toBe(0);
  });

  it("tick advances round", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.round).toBe(1);
  });

  it("game over after 20 ticks", () => {
    let s = initialState(1, s3);
    for (let i = 0; i < 20; i++) s = reducer(s, { type: "tick" });
    expect(s.gameOver).toBe(true);
  });
});

describe("CircusJuggle isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s3), gameOver: true, catchCount: 5, bestStreak: 3, dropCount: 1 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("score is capped at 1000", () => {
    const s = { ...initialState(1, s3), gameOver: true, catchCount: 100, bestStreak: 100, dropCount: 0 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});
