import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { difficulty: "normal" as const };

describe("initialState", () => {
  it("starts with 2 active orders", () => {
    const s = initialState(42, def);
    const active = s.orders.filter(o => !o.complete && !o.failed);
    expect(active.length).toBe(2);
  });

  it("score starts at 0", () => {
    const s = initialState(42, def);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("orders have valid ingredients only", () => {
    const s = initialState(42, def);
    const valid = new Set(["tomato", "cheese", "lettuce", "bread", "meat"]);
    s.orders.forEach(o => {
      o.ingredients.forEach(ing => expect(valid.has(ing)).toBe(true));
    });
  });
});

describe("reducer — select-order", () => {
  it("sets active order id", () => {
    const s = initialState(42, def);
    const orderId = s.orders[0]!.id;
    const s2 = reducer(s, { type: "select-order", id: orderId });
    expect(s2.activeOrderId).toBe(orderId);
  });
});

describe("reducer — add-ingredient", () => {
  it("adds ingredient to active order assembly", () => {
    const s = initialState(42, def);
    const orderId = s.orders[0]!.id;
    let state = reducer(s, { type: "select-order", id: orderId });
    state = reducer(state, { type: "add-ingredient", ingredient: "bread" });
    const order = state.orders.find(o => o.id === orderId)!;
    expect(order.assembled.length).toBe(1);
    expect(order.assembled[0]).toBe("bread");
  });

  it("no-op without active order", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "add-ingredient", ingredient: "cheese" });
    expect(s2).toBe(s);
  });
});

describe("reducer — serve", () => {
  it("correct serve adds score and marks complete", () => {
    const s = initialState(42, def);
    const order = s.orders[0]!;
    let state = reducer(s, { type: "select-order", id: order.id });
    for (const ing of order.ingredients) {
      state = reducer(state, { type: "add-ingredient", ingredient: ing });
    }
    const before = state.score;
    state = reducer(state, { type: "serve" });
    expect(state.score).toBeGreaterThan(before);
    expect(state.completed).toBe(1);
  });

  it("wrong serve scores 0 and marks failed", () => {
    const s = initialState(42, def);
    const order = s.orders[0]!;
    let state = reducer(s, { type: "select-order", id: order.id });
    state = reducer(state, { type: "add-ingredient", ingredient: "tomato" });
    state = reducer(state, { type: "serve" });
    expect(state.score).toBe(0);
    expect(state.failed).toBe(1);
  });
});

describe("reducer — tick", () => {
  it("decrements order timeLeft", () => {
    const s = initialState(42, def);
    const before = s.orders[0]!.timeLeft;
    const s2 = reducer(s, { type: "tick" });
    const after = s2.orders.find(o => o.id === s.orders[0]!.id)?.timeLeft;
    expect(after).toBe(before - 1);
  });

  it("ends game at maxTick", () => {
    const s = { ...initialState(42, def), tick: 79 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, def), gameOver: true, score: 250 };
    expect(isTerminal(s)!.score).toBe(250);
  });
});
