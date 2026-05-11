import { describe, it, expect } from "vitest";
import { bouncerPlugin, bouncerSettings } from "./index.js";

const defaultSettings = {
  difficulty: bouncerSettings.difficulty.default,
  lives: bouncerSettings.lives.default,
} as const;

describe("bouncer plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bouncerPlugin.id).toBe("bouncer");
    expect(bouncerPlugin.title).toBe("Bouncer");
    expect(bouncerPlugin.category).toBe("board");
    expect(bouncerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bouncerPlugin.description).toBe("string");
    expect(bouncerPlugin.description.length).toBeGreaterThan(0);
    expect(bouncerPlugin.settings).toBeDefined();
    expect(typeof bouncerPlugin.settings).toBe("object");
    expect(typeof bouncerPlugin.initialState).toBe("function");
    expect(typeof bouncerPlugin.reducer).toBe("function");
    expect(typeof bouncerPlugin.isTerminal).toBe("function");
    expect(bouncerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = bouncerPlugin.initialState(123, defaultSettings);
    const b = bouncerPlugin.initialState(123, defaultSettings);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.lives).toBe(b.lives);
    expect(a.score).toBe(b.score);
    expect(a.paddleX).toBe(b.paddleX);
    expect(a.paddleWidth).toBe(b.paddleWidth);
    expect(a.balls.length).toBe(b.balls.length);
    expect(a.balls[0]!.vx).toBe(b.balls[0]!.vx);
    expect(a.balls[0]!.vy).toBe(b.balls[0]!.vy);
    expect(a.started).toBe(false);
    expect(a.over).toBe(false);
    expect(bouncerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget shape (no DOM in tests yields null)", () => {
    expect(typeof bouncerPlugin.hint).toBe("function");
    const state = bouncerPlugin.initialState(7, defaultSettings);
    const result = bouncerPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".bouncer-game");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
