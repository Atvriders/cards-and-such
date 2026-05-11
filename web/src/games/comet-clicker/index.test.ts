import { describe, it, expect } from "vitest";
import { cometClickerPlugin } from "./index.js";
import type { CometClickerState } from "./state.js";

const S = { dummy: false } as never;

describe("comet-clicker plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cometClickerPlugin.id).toBe("comet-clicker");
    expect(cometClickerPlugin.title).toBe("Comet Clicker");
    expect(cometClickerPlugin.category).toBe("arcade");
    expect(cometClickerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cometClickerPlugin.description).toBe("string");
    expect(cometClickerPlugin.description.length).toBeGreaterThan(0);
    expect(cometClickerPlugin.settings).toBeDefined();
    expect(typeof cometClickerPlugin.settings).toBe("object");
    expect(typeof cometClickerPlugin.initialState).toBe("function");
    expect(typeof cometClickerPlugin.reducer).toBe("function");
    expect(typeof cometClickerPlugin.isTerminal).toBe("function");
    expect(cometClickerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cometClickerPlugin.initialState(42, S);
    const b = cometClickerPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.score).toBe(0);
    expect(a.targets).toEqual([]);
    expect(cometClickerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget; null in done phase and with no targets", () => {
    expect(typeof cometClickerPlugin.hint).toBe("function");
    const fresh = cometClickerPlugin.initialState(7, S);
    // No targets on fresh state -> hint should be null.
    expect(cometClickerPlugin.hint!(fresh)).toBeNull();

    // Force a state with targets to take the HintTarget branch.
    const withTargets: CometClickerState = {
      ...fresh,
      targets: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const hinted = cometClickerPlugin.hint!(withTargets);
    expect(hinted).not.toBeNull();
    if (hinted !== null) {
      expect(typeof hinted.selector).toBe("string");
      expect(hinted.selector.length).toBeGreaterThan(0);
      expect(hinted.selector).toBe(".cometclicker-target");
      expect(hinted.pulses).toBe(3);
    }

    // Done phase -> hint should be null even with targets present.
    const done: CometClickerState = { ...withTargets, phase: "done" };
    expect(cometClickerPlugin.hint!(done)).toBeNull();
    expect(cometClickerPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
