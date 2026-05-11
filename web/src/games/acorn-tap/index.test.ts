import { describe, it, expect } from "vitest";
import { acornTapPlugin } from "./index.js";
import type { AcornTapState, AcornTapSettings } from "./state.js";

const SETTINGS = { dummy: false } as AcornTapSettings;

describe("acornTapPlugin", () => {
  it("exposes the required GamePlugin shape", () => {
    expect(acornTapPlugin.id).toBe("acorn-tap");
    expect(acornTapPlugin.title).toBe("Acorn Tap");
    expect(acornTapPlugin.category).toBe("arcade");
    expect(acornTapPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acornTapPlugin.description).toBe("string");
    expect(acornTapPlugin.description.length).toBeGreaterThan(0);
    expect(typeof acornTapPlugin.howToPlay).toBe("string");
    expect(acornTapPlugin.howToPlay!.length).toBeGreaterThan(0);
    expect(acornTapPlugin.settings).toBeDefined();
    expect(typeof acornTapPlugin.initialState).toBe("function");
    expect(typeof acornTapPlugin.reducer).toBe("function");
    expect(typeof acornTapPlugin.isTerminal).toBe("function");
    expect(typeof acornTapPlugin.hint).toBe("function");
    expect(acornTapPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for a seed and isTerminal returns null at start", () => {
    const seed = 1234;
    const a = acornTapPlugin.initialState(seed, SETTINGS);
    const b = acornTapPlugin.initialState(seed, SETTINGS);
    expect(a).toEqual(b);
    // Sanity: fresh state has no targets, full timer, zero score, "playing" phase
    expect(a.targets).toEqual([]);
    expect(a.ticksRemaining).toBe(30);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.nextId).toBe(1);
    expect(a.rngSeed).toBe(seed);
    // isTerminal must be null when phase is still "playing"
    expect(acornTapPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns null on empty board, null when done, and a HintTarget once targets exist", () => {
    const fresh = acornTapPlugin.initialState(99, SETTINGS);
    // No targets on a fresh state → hint is null (second guard).
    expect(acornTapPlugin.hint!(fresh)).toBeNull();

    // Drive one tick so the reducer spawns at least one acorn target.
    const ticked = acornTapPlugin.reducer(fresh, { type: "tick" });
    expect(ticked.targets.length).toBeGreaterThan(0);
    const target = acornTapPlugin.hint!(ticked);
    expect(target).not.toBeNull();
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector.length).toBeGreaterThan(0);
    expect(target!.selector).toBe(".acorntap-target");
    expect(target!.pulses).toBe(3);

    // Done-phase short-circuits to null (first guard).
    const doneState: AcornTapState = { ...ticked, phase: "done" };
    expect(acornTapPlugin.hint!(doneState)).toBeNull();
  });
});
