import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOWER_DEFS, TOTAL_WAVES, BASE_HP } from "./state.js";

describe("Tower Defense Mini", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.wave).toBe(0);
    expect(s.gold).toBe(150);
    expect(s.baseHp).toBe(BASE_HP);
    expect(s.phase).toBe("build");
    expect(s.enemies.length).toBe(0);
  });

  it("places tower on grass cell", () => {
    const s = initialState(42);
    const grassIdx = s.grid.findIndex(c => c === "grass");
    const s2 = reducer(s, { type: "placeTower", cellIndex: grassIdx, towerType: "arrow" });
    expect(s2.grid[grassIdx]).toBe("arrow");
    expect(s2.towers[grassIdx]).not.toBeNull();
    expect(s2.gold).toBe(s.gold - TOWER_DEFS.arrow.cost);
  });

  it("cannot place tower on path", () => {
    const s = initialState(42);
    const pathIdx = s.grid.findIndex(c => c === "path");
    const s2 = reducer(s, { type: "placeTower", cellIndex: pathIdx, towerType: "arrow" });
    expect(s2.grid[pathIdx]).toBe("path");
    expect(s2.gold).toBe(s.gold);
  });

  it("cannot place tower if insufficient gold", () => {
    const s = { ...initialState(42), gold: 10 };
    const grassIdx = s.grid.findIndex(c => c === "grass");
    const s2 = reducer(s, { type: "placeTower", cellIndex: grassIdx, towerType: "arrow" });
    expect(s2.grid[grassIdx]).toBe("grass");
  });

  it("startWave increases wave count", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "startWave" });
    expect(s2.wave).toBe(1);
  });

  it("startWave earns gold", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "startWave" });
    expect(s2.gold).toBeGreaterThanOrEqual(s.gold + 20); // at least wave bonus
  });

  it("selling tower returns half cost", () => {
    const s = initialState(42);
    const grassIdx = s.grid.findIndex(c => c === "grass");
    const s2 = reducer(s, { type: "placeTower", cellIndex: grassIdx, towerType: "arrow" });
    const s3 = reducer(s2, { type: "sellTower", cellIndex: grassIdx });
    expect(s3.grid[grassIdx]).toBe("grass");
    expect(s3.gold).toBe(s2.gold + Math.floor(TOWER_DEFS.arrow.cost * 0.5));
  });

  it("done after TOTAL_WAVES", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_WAVES; i++) {
      if (s.phase === "done" || s.phase === "lost") break;
      s = reducer(s, { type: "startWave" });
    }
    expect(s.phase === "done" || s.phase === "lost").toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal returns null when building", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
