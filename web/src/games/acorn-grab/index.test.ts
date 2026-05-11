import { describe, it, expect } from "vitest";
import { acornGrabPlugin } from "./index.js";
import type { AcornGrabState } from "./state.js";

const S = { dummy: false };

describe("acorn-grab plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(acornGrabPlugin.id).toBe("acorn-grab");
    expect(acornGrabPlugin.title).toBe("Acorn Grab");
    expect(acornGrabPlugin.category).toBe("arcade");
    expect(acornGrabPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acornGrabPlugin.description).toBe("string");
    expect(acornGrabPlugin.description.length).toBeGreaterThan(0);
    expect(acornGrabPlugin.settings).toBeDefined();
    expect(typeof acornGrabPlugin.settings).toBe("object");
    expect(typeof acornGrabPlugin.initialState).toBe("function");
    expect(typeof acornGrabPlugin.reducer).toBe("function");
    expect(typeof acornGrabPlugin.isTerminal).toBe("function");
    expect(acornGrabPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = acornGrabPlugin.initialState(42, S);
    const b = acornGrabPlugin.initialState(42, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(a.targets).toEqual([]);
    expect(acornGrabPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no targets, a HintTarget when targets exist, and null when phase is done", () => {
    expect(typeof acornGrabPlugin.hint).toBe("function");
    const fresh = acornGrabPlugin.initialState(7, S);
    // Fresh state has no targets, hint should be null.
    expect(acornGrabPlugin.hint!(fresh)).toBeNull();

    // Inject a target to force the HintTarget branch.
    const withTarget: AcornGrabState = {
      ...fresh,
      targets: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const hint = acornGrabPlugin.hint!(withTarget);
    expect(hint).not.toBeNull();
    if (hint !== null) {
      expect(typeof hint.selector).toBe("string");
      expect(hint.selector.length).toBeGreaterThan(0);
      expect(hint.selector).toContain("hint-target-acorn-grab-target");
      if (hint.pulses !== undefined) {
        expect(typeof hint.pulses).toBe("number");
        expect(hint.pulses).toBeGreaterThan(0);
      }
    }

    // Done phase should yield null regardless of targets.
    const done: AcornGrabState = { ...withTarget, phase: "done" };
    expect(acornGrabPlugin.hint!(done)).toBeNull();
  });
});
