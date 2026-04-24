import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS } from "./state.js";

describe("Resource Chain", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.turn).toBe(1);
    expect(s.coins).toBe(50);
    expect(s.phase).toBe("action");
    expect(s.resources.seeds).toBe(0);
    expect(s.resources.bread).toBe(0);
  });

  it("buy seeds deducts coins", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", resource: "seeds", qty: 3 });
    expect(s2.coins).toBe(50 - 15);
    expect(s2.resources.seeds).toBe(3);
  });

  it("buy seeds fails if insufficient coins", () => {
    const s = { ...initialState(42), coins: 4 };
    const s2 = reducer(s, { type: "buy", resource: "seeds", qty: 1 });
    expect(s2.resources.seeds).toBe(0);
    expect(s2.coins).toBe(4);
  });

  it("process seeds to crops (1:2 ratio)", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", resource: "seeds", qty: 2 });
    const s3 = reducer(s2, { type: "process", from: "seeds", qty: 2 });
    expect(s3.resources.seeds).toBe(0);
    expect(s3.resources.crops).toBe(4);
  });

  it("process crops to flour (2:1 ratio)", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", resource: "seeds", qty: 4 });
    const s3 = reducer(s2, { type: "process", from: "seeds", qty: 4 }); // 8 crops
    const s4 = reducer(s3, { type: "process", from: "crops", qty: 8 }); // 4 flour
    expect(s4.resources.crops).toBe(0);
    expect(s4.resources.flour).toBe(4);
  });

  it("process flour to bread (1:1)", () => {
    const s = { ...initialState(42), resources: { seeds: 0, crops: 0, flour: 3, bread: 0 } };
    const s2 = reducer(s, { type: "process", from: "flour", qty: 3 });
    expect(s2.resources.flour).toBe(0);
    expect(s2.resources.bread).toBe(3);
  });

  it("sell bread increases coins", () => {
    const s = { ...initialState(42), resources: { seeds: 0, crops: 0, flour: 0, bread: 5 }, demandMultiplier: 1.0 };
    const s2 = reducer(s, { type: "sell", qty: 2 });
    expect(s2.coins).toBe(50 + 40);
    expect(s2.resources.bread).toBe(3);
  });

  it("endTurn advances turn", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endTurn" });
    expect(s2.turn).toBe(2);
  });

  it("done after TOTAL_TURNS", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal null when not done", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
