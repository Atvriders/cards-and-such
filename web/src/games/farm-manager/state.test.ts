import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_SEASONS } from "./state.js";

describe("Farm Manager", () => {
  it("initializes with 6 empty fields and $50", () => {
    const s = initialState(42);
    expect(s.fields.length).toBe(6);
    expect(s.fields.every(f => !f.planted)).toBe(true);
    expect(s.money).toBe(50);
    expect(s.season).toBe(1);
    expect(s.phase).toBe("planting");
  });

  it("planting a field costs money and marks it planted", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "plant", field: 0, crop: "wheat" });
    expect(s2.fields[0]?.planted).toBe(true);
    expect(s2.fields[0]?.crop).toBe("wheat");
    expect(s2.money).toBe(50 - 1); // wheat costs $1
  });

  it("cannot plant if not enough money", () => {
    const s = { ...initialState(42), money: 0 };
    const s2 = reducer(s, { type: "plant", field: 0, crop: "tomato" });
    expect(s2.fields[0]?.planted).toBe(false);
  });

  it("endPlanting moves to harvest phase", () => {
    const s = reducer(initialState(42), { type: "plant", field: 0, crop: "corn" });
    const s2 = reducer(s, { type: "endPlanting" });
    expect(s2.phase).toBe("harvest");
  });

  it("harvesting increases money and moves to growing phase", () => {
    let s = reducer(initialState(42), { type: "plant", field: 0, crop: "wheat" });
    s = reducer(s, { type: "endPlanting" });
    const moneyBefore = s.money;
    s = reducer(s, { type: "harvest" });
    expect(s.phase).toBe("growing");
    expect(s.money).toBeGreaterThanOrEqual(moneyBefore); // revenue added, but cost already sunk at plant time
  });

  it("nextSeason advances season and resets fields", () => {
    let s = reducer(initialState(42), { type: "endPlanting" });
    s = reducer(s, { type: "harvest" });
    s = reducer(s, { type: "nextSeason" });
    expect(s.season).toBe(2);
    expect(s.fields.every(f => !f.planted)).toBe(true);
    expect(s.phase).toBe("planting");
  });

  it("completes 10 seasons and reaches done", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_SEASONS; i++) {
      s = reducer(s, { type: "endPlanting" });
      s = reducer(s, { type: "harvest" });
      s = reducer(s, { type: "nextSeason" });
    }
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns null during game, score when done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", money: 500 })).toEqual({ score: 100 });
  });
});
