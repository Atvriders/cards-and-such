import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, apprenticeCost, tomeCost } from "./state.js";

const defaultSettings = { spells: "10" as const };

describe("initialState", () => {
  it("starts with 0 mana, 1 tome, 0 spells cast", () => {
    const s = initialState(1, defaultSettings);
    expect(s.mana).toBe(0);
    expect(s.tomes).toBe(1);
    expect(s.spellsCast).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("goal matches setting", () => {
    expect(initialState(1, { spells: "25" }).spellGoal).toBe(25);
  });
});

describe("reducer — cast", () => {
  it("earns mana and increments spellsCast", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "cast" });
    expect(s2.mana).toBeGreaterThanOrEqual(1);
    expect(s2.spellsCast).toBe(1);
  });

  it("ends game when spellGoal reached", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, spellsCast: 9 };
    const s2 = reducer(near, { type: "cast" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "cast" })).toBe(s);
  });
});

describe("reducer — hireApprentice", () => {
  it("refuses without mana", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "hireApprentice" }).apprentices).toBe(0);
  });

  it("hires when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = apprenticeCost(0);
    const rich = { ...s, mana: cost };
    const s2 = reducer(rich, { type: "hireApprentice" });
    expect(s2.apprentices).toBe(1);
    expect(s2.spellsPower).toBe(s.spellsPower + 2);
  });

  it("cost scales exponentially", () => {
    expect(apprenticeCost(0)).toBe(25);
    expect(apprenticeCost(1)).toBe(50);
  });
});

describe("reducer — buyTome", () => {
  it("adds tome when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = tomeCost(1);
    const rich = { ...s, mana: cost };
    const s2 = reducer(rich, { type: "buyTome" });
    expect(s2.tomes).toBe(2);
  });

  it("refuses without enough mana", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "buyTome" }).tomes).toBe(1);
  });
});

describe("reducer — tick", () => {
  it("tick with no apprentices gives nothing", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.mana).toBe(0);
    expect(s2.ticks).toBe(1);
  });

  it("tick with apprentices earns mana and spells", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, apprentices: 3, tomes: 2 }, { type: "tick" });
    expect(s2.mana).toBe(6);
    expect(s2.spellsCast).toBe(3);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns positive score when done", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, mana: 100 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
