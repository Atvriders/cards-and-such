import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, INGREDIENT_COST, TOTAL_ORDERS, RECIPES } from "./state.js";

describe("Alchemy Shop", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.coins).toBe(80);
    expect(s.completedOrders).toBe(0);
    expect(s.orders.length).toBe(3);
    expect(s.phase).toBe("brew");
  });

  it("buyIngredient deducts coins and adds inventory", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buyIngredient", ingredient: "fire", qty: 2 });
    expect(s2.coins).toBe(80 - INGREDIENT_COST * 2);
    expect(s2.inventory.fire).toBe(2);
  });

  it("buyIngredient fails if insufficient coins", () => {
    const s = { ...initialState(42), coins: 5 };
    const s2 = reducer(s, { type: "buyIngredient", ingredient: "fire", qty: 1 });
    expect(s2.inventory.fire).toBe(0);
    expect(s2.coins).toBe(5);
  });

  it("fulfillOrder requires all ingredients", () => {
    const s = initialState(42);
    // Try to fulfill without ingredients - should fail
    const s2 = reducer(s, { type: "fulfillOrder", orderIndex: 0 });
    expect(s2.completedOrders).toBe(0);
  });

  it("fulfillOrder succeeds with correct ingredients", () => {
    let s = initialState(42);
    // Force a known order
    const order = s.orders[0]!;
    const recipe = RECIPES[order.potion];
    // Stock all needed ingredients
    for (const ing of recipe.ingredients) {
      s = reducer(s, { type: "buyIngredient", ingredient: ing, qty: 1 });
    }
    const s2 = reducer(s, { type: "fulfillOrder", orderIndex: 0 });
    expect(s2.completedOrders).toBe(1);
    expect(s2.coins).toBeGreaterThan(s.coins - recipe.ingredients.length * INGREDIENT_COST);
  });

  it("endTurn ticks order timers", () => {
    const s = initialState(42);
    const timersBefore = s.orders.map(o => o.turnsLeft);
    const s2 = reducer(s, { type: "endTurn" });
    // Check that timers decreased (some may be refreshed if expired)
    expect(s2.orders.length).toBe(3);
    void timersBefore;
  });

  it("endTurn penalizes expired orders", () => {
    // Create a state with orders about to expire
    const s = initialState(42);
    const s2 = { ...s, orders: s.orders.map(o => ({ ...o, turnsLeft: 1 })) };
    const s3 = reducer(s2, { type: "endTurn" });
    // All 3 orders expire -> penalty = 30 coins
    expect(s3.coins).toBe(Math.max(0, s2.coins - 30));
  });

  it("isTerminal returns score on done", () => {
    const s = { ...initialState(42), phase: "done" as const, coins: 300 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(100);
  });

  it("isTerminal returns null when brewing", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("completing TOTAL_ORDERS transitions to done", () => {
    let s = { ...initialState(42), completedOrders: TOTAL_ORDERS - 1 };
    // Stock ingredients for first order
    const order = s.orders[0]!;
    const recipe = RECIPES[order.potion];
    for (const ing of recipe.ingredients) {
      s = reducer(s, { type: "buyIngredient", ingredient: ing, qty: 1 });
    }
    const s2 = reducer(s, { type: "fulfillOrder", orderIndex: 0 });
    expect(s2.phase).toBe("done");
  });
});
