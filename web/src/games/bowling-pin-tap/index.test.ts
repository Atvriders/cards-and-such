import { describe, it, expect } from "vitest";
import { bowlingPinTapPlugin } from "./index.js";
import type { BowlingPinTapState } from "./state.js";

const S = { dummy: false } as never;

describe("bowling-pin-tap plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bowlingPinTapPlugin.id).toBe("bowling-pin-tap");
    expect(bowlingPinTapPlugin.title).toBe("Bowling Pin Tap");
    expect(bowlingPinTapPlugin.category).toBe("arcade");
    expect(bowlingPinTapPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bowlingPinTapPlugin.description).toBe("string");
    expect(bowlingPinTapPlugin.description.length).toBeGreaterThan(0);
    expect(bowlingPinTapPlugin.settings).toBeDefined();
    expect(typeof bowlingPinTapPlugin.settings).toBe("object");
    expect(typeof bowlingPinTapPlugin.initialState).toBe("function");
    expect(typeof bowlingPinTapPlugin.reducer).toBe("function");
    expect(typeof bowlingPinTapPlugin.isTerminal).toBe("function");
    expect(bowlingPinTapPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = bowlingPinTapPlugin.initialState(42, S);
    const b = bowlingPinTapPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.targets).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(bowlingPinTapPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no targets, a HintTarget when targets exist, and null when phase is done", () => {
    expect(typeof bowlingPinTapPlugin.hint).toBe("function");

    const fresh = bowlingPinTapPlugin.initialState(7, S);
    // Fresh state has no targets yet => null.
    expect(bowlingPinTapPlugin.hint!(fresh)).toBeNull();

    // With at least one target, hint should return a HintTarget.
    const withTargets: BowlingPinTapState = {
      ...fresh,
      targets: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const result = bowlingPinTapPlugin.hint!(withTargets);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Done phase always returns null even if targets are present.
    const done: BowlingPinTapState = { ...withTargets, phase: "done" };
    expect(bowlingPinTapPlugin.hint!(done)).toBeNull();
  });
});
