import { describe, it, expect } from "vitest";
import { asteroidAimPlugin } from "./index.js";
import type { AsteroidAimState } from "./state.js";

const S = { dummy: false };

describe("asteroid-aim plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(asteroidAimPlugin.id).toBe("asteroid-aim");
    expect(asteroidAimPlugin.title).toBe("Asteroid Aim");
    expect(asteroidAimPlugin.category).toBe("arcade");
    expect(asteroidAimPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof asteroidAimPlugin.description).toBe("string");
    expect(asteroidAimPlugin.description.length).toBeGreaterThan(0);
    expect(asteroidAimPlugin.settings).toBeDefined();
    expect(typeof asteroidAimPlugin.settings).toBe("object");
    expect(typeof asteroidAimPlugin.initialState).toBe("function");
    expect(typeof asteroidAimPlugin.reducer).toBe("function");
    expect(typeof asteroidAimPlugin.isTerminal).toBe("function");
    expect(asteroidAimPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = asteroidAimPlugin.initialState(42, S);
    const b = asteroidAimPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.targets).toEqual([]);
    expect(asteroidAimPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no targets or done, and a HintTarget when targets exist", () => {
    expect(typeof asteroidAimPlugin.hint).toBe("function");
    const fresh = asteroidAimPlugin.initialState(7, S);

    // No targets yet -> null
    expect(asteroidAimPlugin.hint!(fresh)).toBeNull();

    // With targets present -> HintTarget
    const withTargets: AsteroidAimState = {
      ...fresh,
      targets: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const result = asteroidAimPlugin.hint!(withTargets);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-/);
    expect(result!.pulses).toBe(3);

    // Phase done -> null even with targets
    const done: AsteroidAimState = { ...withTargets, phase: "done" };
    expect(asteroidAimPlugin.hint!(done)).toBeNull();
  });
});
