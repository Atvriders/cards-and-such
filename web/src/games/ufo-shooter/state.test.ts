import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { UfoShooterSettings } from "./state.js";

const s3: UfoShooterSettings = { waves: "3" };
const s5: UfoShooterSettings = { waves: "5" };

describe("UfoShooter initialState", () => {
  it("sets totalWaves to 3", () => {
    expect(initialState(1, s3).totalWaves).toBe(3);
  });

  it("sets totalWaves to 5", () => {
    expect(initialState(1, s5).totalWaves).toBe(5);
  });

  it("starts at wave 1", () => {
    expect(initialState(1, s3).wave).toBe(1);
  });

  it("starts with 10 shots", () => {
    expect(initialState(1, s3).shotsRemaining).toBe(10);
  });

  it("spawns UFOs on wave 1", () => {
    const s = initialState(1, s3);
    expect(s.ufos.length).toBeGreaterThan(0);
  });

  it("not game over initially", () => {
    expect(initialState(1, s3).gameOver).toBe(false);
  });
});

describe("UfoShooter reducer", () => {
  it("moveLeft decreases gunPosition", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "moveLeft" });
    expect(s2.gunPosition).toBe(s.gunPosition - 1);
  });

  it("moveRight increases gunPosition", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "moveRight" });
    expect(s2.gunPosition).toBe(s.gunPosition + 1);
  });

  it("shoot decrements shots", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "shoot" });
    expect(s2.shotsRemaining).toBe(9);
  });

  it("shoot hits UFO in same column", () => {
    const s = initialState(1, s3);
    const ufo = s.ufos.find(u => !u.destroyed)!;
    const aligned = { ...s, gunPosition: ufo.x };
    const s2 = reducer(aligned, { type: "shoot" });
    const hitUfo = s2.ufos.find(u => u.id === ufo.id)!;
    expect(hitUfo.destroyed || hitUfo.hp < ufo.hp).toBe(true);
  });

  it("nextWave increments wave", () => {
    const s = initialState(1, s3);
    const s2 = reducer(s, { type: "nextWave" });
    expect(s2.wave).toBe(2);
  });

  it("game over after all waves", () => {
    let s = initialState(1, s3);
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "nextWave" });
    expect(s.gameOver).toBe(true);
  });

  it("restart resets state", () => {
    let s = initialState(1, s3);
    s = reducer(s, { type: "nextWave" });
    s = reducer(s, { type: "restart" });
    expect(s.wave).toBe(1);
    expect(s.score).toBe(0);
    expect(s.shotsRemaining).toBe(10);
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s3))).toBeNull();
  });

  it("isTerminal caps at 1000", () => {
    const s = { ...initialState(1, s3), gameOver: true, score: 9999 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});
