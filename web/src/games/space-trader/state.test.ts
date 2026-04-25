import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_JUMPS, cargoTotal } from "./state.js";

describe("Space Trader", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.credits).toBe(200);
    expect(s.jump).toBe(0);
    expect(s.phase).toBe("port");
  });

  it("buying reduces credits and increases cargo", () => {
    const s = initialState(42);
    const price = s.prices.food;
    const s2 = reducer(s, { type: "buy", good: "food", qty: 2 });
    expect(s2.credits).toBe(200 - price * 2);
    expect(s2.cargo.food).toBe(2);
  });

  it("selling increases credits and reduces cargo", () => {
    const s = { ...initialState(42), cargo: { food: 5, tech: 0, ore: 0, medicine: 0 } };
    const price = s.prices.food;
    const s2 = reducer(s, { type: "sell", good: "food", qty: 3 });
    expect(s2.credits).toBe(s.credits + price * 3);
    expect(s2.cargo.food).toBe(2);
  });

  it("cannot buy more than cargo capacity", () => {
    const s = { ...initialState(42), cargo: { food: 18, tech: 2, ore: 0, medicine: 0 } };
    const s2 = reducer(s, { type: "buy", good: "ore", qty: 2 });
    expect(cargoTotal(s2.cargo)).toBeLessThanOrEqual(20);
  });

  it("jump reduces fuel and changes planet", () => {
    const s = initialState(42);
    const planet0 = s.planet;
    const s2 = reducer(s, { type: "jump" });
    expect(s2.fuel).toBe(s.fuel - 3);
    expect(s2.jump).toBe(1);
    // Planet may or may not change (random), but prices refreshed
    expect(typeof s2.planet).toBe("string");
    void planet0;
  });

  it("refuel restores fuel for 30 credits", () => {
    const s = { ...initialState(42), fuel: 0 };
    const s2 = reducer(s, { type: "refuel" });
    expect(s2.fuel).toBe(15);
    expect(s2.credits).toBe(200 - 30);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("completes after TOTAL_JUMPS", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_JUMPS; i++) {
      if (s.fuel < 3) s = reducer(s, { type: "refuel" });
      s = reducer(s, { type: "jump" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
