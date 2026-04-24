import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DAYS, FISH_PRICES } from "./state.js";

describe("Fishing Village", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.coins).toBe(30);
    expect(s.energy).toBe(5);
    expect(s.boatDurability).toBe(10);
    expect(s.phase).toBe("choose");
    expect(s.weather).toBe("sunny");
  });

  it("shore fishing reduces energy and may catch fish", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "fish_shore" });
    expect(s2.energy).toBe(4);
    expect(s2.phase).toBe("result");
  });

  it("deep fishing reduces energy and boat durability", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "fish_deep" });
    expect(s2.energy).toBeLessThan(s.energy);
    expect(s2.phase).toBe("result");
  });

  it("rest increases energy", () => {
    const s = { ...initialState(42), energy: 1 };
    const s2 = reducer(s, { type: "choose", action: "rest" });
    expect(s2.energy).toBe(4); // 1 + 3
  });

  it("selling fish converts to coins", () => {
    const s = { ...initialState(42), fish: { cod: 3, tuna: 0, herring: 0, salmon: 0, bass: 0 } };
    const s2 = reducer(s, { type: "choose", action: "trade" });
    expect(s2.coins).toBe(30 + 3 * FISH_PRICES.cod);
    expect(s2.fish.cod).toBe(0);
  });

  it("repair restores boat durability", () => {
    const s = { ...initialState(42), boatDurability: 5, coins: 100 };
    const s2 = reducer(s, { type: "choose", action: "repair" });
    expect(s2.boatDurability).toBe(10);
    expect(s2.coins).toBe(100 - 5 * 5); // 25 coins
  });

  it("nextDay advances day", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "rest" });
    const s3 = reducer(s2, { type: "nextDay" });
    expect(s3.day).toBe(2);
    expect(s3.phase).toBe("choose");
  });

  it("done after TOTAL_DAYS", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      if (s.phase === "done") break;
      s = reducer(s, { type: "choose", action: "rest" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal returns null when choosing", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score scales with coins", () => {
    const s = { ...initialState(42), phase: "done" as const, coins: 300 };
    expect(isTerminal(s)?.score).toBe(100);
  });
});
