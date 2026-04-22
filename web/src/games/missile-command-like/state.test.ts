import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MissileCommandState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("creates 6 alive cities", () => {
    const s = initialState(42, settings);
    expect(s.cities).toHaveLength(6);
    expect(s.cities.every((c) => c.alive)).toBe(true);
  });

  it("starts with no streaks and no explosions", () => {
    const s = initialState(42, settings);
    expect(s.streaks).toHaveLength(0);
    expect(s.explosions).toHaveLength(0);
  });

  it("score starts at 0, wave at 1", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.wave).toBe(1);
  });
});

describe("aim action", () => {
  it("updates cursor position", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "aim", x: 0.3, y: 0.6 });
    expect(after.cursorX).toBeCloseTo(0.3);
    expect(after.cursorY).toBeCloseTo(0.6);
  });
});

describe("fire action", () => {
  it("adds an explosion at cursor position", () => {
    const s = initialState(42, settings);
    const aimed = reducer(s, { type: "aim", x: 0.5, y: 0.4 });
    const after = reducer(aimed, { type: "fire" });
    expect(after.explosions).toHaveLength(1);
    expect(after.explosions[0]!.x).toBeCloseTo(0.5);
    expect(after.explosions[0]!.y).toBeCloseTo(0.4);
    expect(after.explosions[0]!.growing).toBe(true);
  });
});

describe("tick grows explosions", () => {
  it("explosion radius increases on tick", () => {
    let s = initialState(42, settings);
    s = reducer(s, { type: "aim", x: 0.5, y: 0.5 });
    s = reducer(s, { type: "fire" });
    const before = s.explosions[0]!.radius;
    s = reducer(s, { type: "tick", dt: 0.1 });
    expect(s.explosions[0]!.radius).toBeGreaterThan(before);
  });
});

describe("explosion kills nearby streak", () => {
  it("streak within explosion radius is removed and score increases", () => {
    let s = initialState(42, settings);
    // Manually inject a streak and a large explosion at the same position
    const streak = { id: 99, x: 0.5, y: 0.4, vx: 0, vy: 0.01, dead: false };
    const explosion = { id: 100, x: 0.5, y: 0.4, radius: 0.1, maxRadius: 0.1, growing: false };
    const injected: MissileCommandState = {
      ...s,
      streaks: [streak],
      explosions: [explosion],
      streaksLeft: 0, // prevent new spawns during tick
      spawnCooldown: 999,
    };
    const after = reducer(injected, { type: "tick", dt: 0.016 });
    expect(after.streaks).toHaveLength(0);
    expect(after.score).toBeGreaterThan(0);
  });
});

describe("streak reaching ground destroys city", () => {
  it("city count decreases when streak hits ground", () => {
    const s = initialState(42, settings);
    const cityX = s.cities[0]!.x;
    const streak = { id: 10, x: cityX, y: 0.91, vx: 0, vy: 0.5, dead: false };
    const injected: MissileCommandState = { ...s, streaks: [streak], streaksLeft: 0 };
    const after = reducer(injected, { type: "tick", dt: 0.1 });
    const aliveCities = after.cities.filter((c) => c.alive).length;
    expect(aliveCities).toBeLessThan(6);
  });
});

describe("game over when all cities destroyed", () => {
  it("sets over=true when no cities alive", () => {
    const s = initialState(42, settings);
    const deadCities = s.cities.map((c) => ({ ...c, alive: false }));
    const injected: MissileCommandState = {
      ...s,
      cities: deadCities,
      streaks: [],
      streaksLeft: 0,
      explosions: [],
      spawnCooldown: 999, // prevent new spawns
    };
    const after = reducer(injected, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null when game is in progress", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(42, settings), over: true, score: 150 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(150);
  });

  it("returns score+500 when won", () => {
    const s = { ...initialState(42, settings), won: true, score: 200 };
    const result = isTerminal(s);
    expect(result!.score).toBe(700);
  });
});
