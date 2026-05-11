import { describe, it, expect } from "vitest";
import { baseballTapPlugin } from "./index.js";
import type { BaseballTapState, BaseballTapSettings } from "./state.js";

const SETTINGS = { dummy: false } as BaseballTapSettings;

describe("baseballTapPlugin", () => {
  it("exposes the required GamePlugin shape", () => {
    expect(baseballTapPlugin.id).toBe("baseball-tap");
    expect(baseballTapPlugin.title).toBe("Baseball Tap");
    expect(baseballTapPlugin.category).toBe("arcade");
    expect(baseballTapPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof baseballTapPlugin.description).toBe("string");
    expect(baseballTapPlugin.description.length).toBeGreaterThan(0);
    expect(typeof baseballTapPlugin.howToPlay).toBe("string");
    expect(baseballTapPlugin.howToPlay!.length).toBeGreaterThan(0);
    expect(baseballTapPlugin.settings).toBeDefined();
    expect(typeof baseballTapPlugin.initialState).toBe("function");
    expect(typeof baseballTapPlugin.reducer).toBe("function");
    expect(typeof baseballTapPlugin.isTerminal).toBe("function");
    expect(typeof baseballTapPlugin.hint).toBe("function");
    expect(baseballTapPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for a seed and isTerminal returns null at start", () => {
    const seed = 1234;
    const a = baseballTapPlugin.initialState(seed, SETTINGS);
    const b = baseballTapPlugin.initialState(seed, SETTINGS);
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
    expect(baseballTapPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns null on empty board, null when done, and a HintTarget once targets exist", () => {
    const fresh = baseballTapPlugin.initialState(99, SETTINGS);
    // No targets on a fresh state -> hint is null (second guard).
    expect(baseballTapPlugin.hint!(fresh)).toBeNull();

    // Drive one tick so the reducer spawns at least one baseball target.
    const ticked = baseballTapPlugin.reducer(fresh, { type: "tick" });
    expect(ticked.targets.length).toBeGreaterThan(0);
    const target = baseballTapPlugin.hint!(ticked);
    expect(target).not.toBeNull();
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector.length).toBeGreaterThan(0);
    expect(target!.selector).toBe(".ftap-target");
    expect(target!.pulses).toBe(3);

    // Done-phase short-circuits to null (first guard).
    const doneState: BaseballTapState = { ...ticked, phase: "done" };
    expect(baseballTapPlugin.hint!(doneState)).toBeNull();
  });
});
