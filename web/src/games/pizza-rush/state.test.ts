import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { speed: "normal" as const };

describe("initialState", () => {
  it("starts with one active order and empty pizza", () => {
    const s = initialState(1, settings);
    expect(s.orders).toHaveLength(1);
    expect(s.currentPizza).toHaveLength(0);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
  });
});

describe("add-topping", () => {
  it("adds topping to current pizza", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "add-topping", topping: "sauce" });
    expect(s2.currentPizza).toContain("sauce");
  });

  it("rejects if pizza already has 5 toppings", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "add-topping", topping: "olive" });
    }
    const s6 = reducer(s, { type: "add-topping", topping: "sauce" });
    expect(s6.currentPizza).toHaveLength(5);
    expect(s6.log).toMatch(/full/i);
  });
});

describe("clear", () => {
  it("empties current pizza", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "add-topping", topping: "cheese" });
    s = reducer(s, { type: "clear" });
    expect(s.currentPizza).toHaveLength(0);
  });
});

describe("submit", () => {
  it("completes order when toppings match", () => {
    const s = initialState(99, settings);
    const needed = s.orders[0]!.toppings;
    let cur = s;
    for (const t of needed) {
      cur = reducer(cur, { type: "add-topping", topping: t });
    }
    cur = reducer(cur, { type: "submit" });
    expect(cur.ordersCompleted).toBe(1);
    expect(cur.score).toBeGreaterThan(0);
    expect(cur.currentPizza).toHaveLength(0);
  });
});

describe("tick and isTerminal", () => {
  it("ends game at maxTicks", () => {
    let s = { ...initialState(1, settings), tick: 59 };
    s = reducer(s, { type: "tick" });
    expect(s.over).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("null terminal during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
});
