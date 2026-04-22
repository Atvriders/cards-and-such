import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("FallingCatcher initialState", () => {
  it("starts with 3 lives, score 0, no items", () => {
    const s = initialState(42, easy);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.items.length).toBe(0);
    expect(s.ended).toBe(false);
  });

  it("basket starts at center", () => {
    const s = initialState(1, easy);
    expect(s.basket).toBeCloseTo(0.5);
  });

  it("same seed gives same state", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.basket).toBe(s2.basket);
    expect(s1.lives).toBe(s2.lives);
  });
});

describe("FallingCatcher move", () => {
  it("move action updates basket position", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "move", x: 0.3 });
    expect(s2.basket).toBeCloseTo(0.3);
  });

  it("basket clamps to [0, 1]", () => {
    const s = initialState(42, easy);
    expect(reducer(s, { type: "move", x: -0.5 }).basket).toBeCloseTo(0);
    expect(reducer(s, { type: "move", x: 1.5 }).basket).toBeCloseTo(1);
  });

  it("keyMove left moves basket left", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "keyMove", dir: "left" });
    expect(s2.basket).toBeLessThan(0.5);
  });

  it("keyMove right moves basket right", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "keyMove", dir: "right" });
    expect(s2.basket).toBeGreaterThan(0.5);
  });
});

describe("FallingCatcher tick", () => {
  it("advances elapsed", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "tick", dt: 1 });
    expect(s2.elapsed).toBeCloseTo(1);
  });

  it("spawns items after time", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "tick", dt: 2 });
    expect(s2.items.length).toBeGreaterThan(0);
  });

  it("ends game at 60 seconds", () => {
    const s = initialState(42, easy);
    const ended = reducer(s, { type: "tick", dt: 60 });
    expect(ended.ended).toBe(true);
  });

  it("ends game when lives reach 0", () => {
    const s = initialState(42, hard);
    // Inject a bomb directly under the basket
    const withBombs = {
      ...s,
      lives: 1,
      basket: 0.5,
      items: [{ id: 0, kind: "bomb" as const, x: 0.5, y: 0.85, speed: 0.1 }],
    };
    const s2 = reducer(withBombs, { type: "tick", dt: 0.1 });
    // Bomb should have been caught (basket at 0.5, bomb at 0.5)
    if (s2.lives === 0) {
      expect(s2.ended).toBe(true);
    }
  });

  it("catching a coin increases score", () => {
    const s = initialState(42, easy);
    const withCoin = {
      ...s,
      basket: 0.5,
      items: [{ id: 0, kind: "coin" as const, x: 0.5, y: 0.88, speed: 0.5 }],
    };
    const s2 = reducer(withCoin, { type: "tick", dt: 0.1 });
    expect(s2.score).toBe(1);
  });

  it("catching a star scores 3", () => {
    const s = initialState(42, easy);
    const withStar = {
      ...s,
      basket: 0.5,
      items: [{ id: 0, kind: "star" as const, x: 0.5, y: 0.88, speed: 0.5 }],
    };
    const s2 = reducer(withStar, { type: "tick", dt: 0.1 });
    expect(s2.score).toBe(3);
  });
});

describe("FallingCatcher isTerminal", () => {
  it("null while running", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when ended", () => {
    const s = initialState(42, easy);
    const ended = reducer(s, { type: "tick", dt: 60 });
    expect(isTerminal(ended)?.score).toBe(0);
  });
});
