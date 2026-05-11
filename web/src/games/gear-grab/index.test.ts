import { describe, it, expect } from "vitest";
import { gearGrabPlugin } from "./index.js";
import type { GearGrabState } from "./state.js";

const S = { dummy: false };

describe("gear-grab plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(gearGrabPlugin.id).toBe("gear-grab");
    expect(gearGrabPlugin.title).toBe("Gear Grab");
    expect(gearGrabPlugin.category).toBe("arcade");
    expect(gearGrabPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof gearGrabPlugin.description).toBe("string");
    expect(gearGrabPlugin.description.length).toBeGreaterThan(0);
    expect(gearGrabPlugin.settings).toBeDefined();
    expect(typeof gearGrabPlugin.settings).toBe("object");
    expect(typeof gearGrabPlugin.initialState).toBe("function");
    expect(typeof gearGrabPlugin.reducer).toBe("function");
    expect(typeof gearGrabPlugin.isTerminal).toBe("function");
    expect(gearGrabPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = gearGrabPlugin.initialState(123, S);
    const b = gearGrabPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.targets).toEqual([]);
    expect(a.nextId).toBe(1);
    expect(a.ticksRemaining).toBeGreaterThan(0);
    expect(gearGrabPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when no targets, a HintTarget once targets exist, and null when phase is done", () => {
    expect(typeof gearGrabPlugin.hint).toBe("function");
    const fresh = gearGrabPlugin.initialState(7, S);
    // No targets yet -> null
    expect(gearGrabPlugin.hint!(fresh)).toBeNull();

    // Tick once to spawn targets -> hint should produce a HintTarget
    const ticked = gearGrabPlugin.reducer(fresh, { type: "tick" });
    expect(ticked.targets.length).toBeGreaterThan(0);
    const hint = gearGrabPlugin.hint!(ticked);
    expect(hint).not.toBeNull();
    expect(typeof hint!.selector).toBe("string");
    expect(hint!.selector.length).toBeGreaterThan(0);
    expect(hint!.selector).toBe('[data-testid="hint-target-gear-grab-target"]');
    expect(hint!.pulses).toBe(3);

    // Phase done -> hint returns null even when targets exist
    const doneState: GearGrabState = { ...ticked, phase: "done" };
    expect(gearGrabPlugin.hint!(doneState)).toBeNull();
  });
});
