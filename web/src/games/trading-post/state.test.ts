import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, GOODS } from "./state.js";

describe("Trading Post", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.turn).toBe(1);
    expect(s.gold).toBe(200);
    expect(s.phase).toBe("buy");
    expect(GOODS.every(g => s.inventory[g] === 0)).toBe(true);
  });

  it("buy reduces gold and adds inventory", () => {
    const s = initialState(42);
    const price = s.prices["grain"];
    const s2 = reducer(s, { type: "buy", good: "grain", qty: 5 });
    expect(s2.gold).toBe(s.gold - price * 5);
    expect(s2.inventory["grain"]).toBe(5);
  });

  it("buy does nothing if insufficient gold", () => {
    const s = { ...initialState(42), gold: 1 };
    const s2 = reducer(s, { type: "buy", good: "gems", qty: 1 });
    expect(s2.gold).toBe(1);
    expect(s2.inventory["gems"]).toBe(0);
  });

  it("endPhase moves buy to sell", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endPhase" });
    expect(s2.phase).toBe("sell");
  });

  it("sell adds gold and reduces inventory", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", good: "grain", qty: 3 });
    const s3 = reducer(s2, { type: "endPhase" }); // move to sell
    const price = s3.prices["grain"];
    const goldBefore = s3.gold;
    const s4 = reducer(s3, { type: "sell", good: "grain", qty: 3 });
    expect(s4.gold).toBe(goldBefore + price * 3);
    expect(s4.inventory["grain"]).toBe(0);
  });

  it("sell does nothing if not enough inventory", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endPhase" }); // sell phase
    const s3 = reducer(s2, { type: "sell", good: "silk", qty: 5 });
    expect(s3.inventory["silk"]).toBe(0);
  });

  it("turns advance after sell phase endPhase", () => {
    let s = initialState(42);
    s = reducer(s, { type: "endPhase" }); // buy->sell
    s = reducer(s, { type: "endPhase" }); // sell->next turn
    expect(s.turn).toBe(2);
    expect(s.phase).toBe("buy");
  });

  it("reaches done after 10 turns", () => {
    let s = initialState(42);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "endPhase" }); // buy->sell
      s = reducer(s, { type: "endPhase" }); // sell->next
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal returns null when not done", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
