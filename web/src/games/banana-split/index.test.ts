import { describe, it, expect } from "vitest";
import { bananaSplitPlugin } from "./index.js";
import { TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false } as never;

describe("banana-split plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bananaSplitPlugin.id).toBe("banana-split");
    expect(bananaSplitPlugin.title).toBe("Banana Split");
    expect(bananaSplitPlugin.category).toBe("arcade");
    expect(bananaSplitPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bananaSplitPlugin.description).toBe("string");
    expect(bananaSplitPlugin.description.length).toBeGreaterThan(0);
    expect(bananaSplitPlugin.settings).toBeDefined();
    expect(typeof bananaSplitPlugin.settings).toBe("object");
    expect(typeof bananaSplitPlugin.initialState).toBe("function");
    expect(typeof bananaSplitPlugin.reducer).toBe("function");
    expect(typeof bananaSplitPlugin.isTerminal).toBe("function");
    expect(bananaSplitPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = bananaSplitPlugin.initialState(42, S);
    const b = bananaSplitPlugin.initialState(42, S);
    expect(a.targets).toEqual(b.targets);
    expect(a.targets.length).toBe(TOTAL_ROUNDS);
    expect(a.roundIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("aiming");
    expect(bananaSplitPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null once gameover/done", () => {
    expect(typeof bananaSplitPlugin.hint).toBe("function");
    const fresh = bananaSplitPlugin.initialState(7, S);
    const result = bananaSplitPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-banana-split-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the null branch by setting phase to "done".
    const done = { ...fresh, phase: "done" as const };
    expect(bananaSplitPlugin.hint!(done)).toBeNull();
  });
});
