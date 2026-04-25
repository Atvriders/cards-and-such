import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, autoClickerCost, prestigeMultiplier } from "./state.js";

const defaultSettings = { prestigeGoal: "1000" as const };

describe("initialState", () => {
  it("starts at 0 points with 0 prestiges", () => {
    const s = initialState(1, defaultSettings);
    expect(s.points).toBe(0);
    expect(s.prestiges).toBe(0);
    expect(s.autoClickers).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("prestigeGoal matches setting", () => {
    expect(initialState(1, { prestigeGoal: "5000" }).prestigeGoal).toBe(5000);
  });
});

describe("reducer — click", () => {
  it("earns points on click", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "click" });
    expect(s2.points).toBe(1); // clickPower=1 * multiplier(0)=1
    expect(s2.clicks).toBe(1);
  });

  it("prestige multiplier doubles each prestige", () => {
    expect(prestigeMultiplier(0)).toBe(1);
    expect(prestigeMultiplier(1)).toBe(2);
    expect(prestigeMultiplier(3)).toBe(8);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "click" })).toBe(s);
  });
});

describe("reducer — buyAutoClicker", () => {
  it("refuses without points", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "buyAutoClicker" }).autoClickers).toBe(0);
  });

  it("buys when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = autoClickerCost(0);
    const rich = { ...s, points: cost };
    const s2 = reducer(rich, { type: "buyAutoClicker" });
    expect(s2.autoClickers).toBe(1);
    expect(s2.points).toBe(0);
  });

  it("cost doubles each purchase", () => {
    expect(autoClickerCost(0)).toBe(25);
    expect(autoClickerCost(1)).toBe(50);
  });
});

describe("reducer — prestige", () => {
  it("refuses prestige without enough points", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "prestige" });
    expect(s2.prestiges).toBe(0);
  });

  it("resets points and increments prestiges", () => {
    const s = initialState(1, defaultSettings);
    const atGoal = { ...s, points: 1000 };
    const s2 = reducer(atGoal, { type: "prestige" });
    expect(s2.prestiges).toBe(1);
    expect(s2.points).toBe(0);
    expect(s2.clickPower).toBe(s.clickPower + 2);
    expect(s2.autoClickers).toBe(0);
  });

  it("wins after 3 prestiges when goal is met again", () => {
    const s = initialState(1, defaultSettings);
    const nearWin = { ...s, prestiges: 3, points: 1000 };
    const s2 = reducer(nearWin, { type: "click" });
    expect(s2.gameOver).toBe(true);
  });
});

describe("reducer — tick", () => {
  it("no passive without autoClickers", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).points).toBe(0);
  });

  it("autoClickers earn points each tick", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, autoClickers: 3, prestiges: 1 }, { type: "tick" });
    expect(s2.points).toBe(6); // 3 * multiplier(1)=2
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score on completion", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, totalEarned: 5000, prestiges: 3 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
