import { describe, it, expect } from "vitest";
import { chaiChasePlugin } from "./index.js";
import type { ChaiChaseState } from "./state.js";

const S = { dummy: false };

describe("chai-chase plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chaiChasePlugin.id).toBe("chai-chase");
    expect(chaiChasePlugin.title).toBe("Chai Chase");
    expect(chaiChasePlugin.category).toBe("arcade");
    expect(chaiChasePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chaiChasePlugin.description).toBe("string");
    expect(chaiChasePlugin.description.length).toBeGreaterThan(0);
    expect(chaiChasePlugin.settings).toBeDefined();
    expect(typeof chaiChasePlugin.settings).toBe("object");
    expect(typeof chaiChasePlugin.initialState).toBe("function");
    expect(typeof chaiChasePlugin.reducer).toBe("function");
    expect(typeof chaiChasePlugin.isTerminal).toBe("function");
    expect(chaiChasePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = chaiChasePlugin.initialState(123, S);
    const b = chaiChasePlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.items).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.popped).toBe(0);
    expect(a.missed).toBe(0);
    expect(a.rngSeed).toBe(123);
    expect(chaiChasePlugin.isTerminal(a)).toBeNull();

    // Force a "done" state and confirm isTerminal returns the score payload.
    const finished: ChaiChaseState = { ...a, phase: "done", score: 42 };
    expect(chaiChasePlugin.isTerminal(finished)).toEqual({ score: 42 });
  });

  it("hint returns a HintTarget when items exist and null on done or empty board", () => {
    expect(typeof chaiChasePlugin.hint).toBe("function");
    const fresh = chaiChasePlugin.initialState(7, S);
    // Fresh state has no items, so hint should be null.
    expect(chaiChasePlugin.hint!(fresh)).toBeNull();

    // With at least one item present and phase === "playing", hint must yield a HintTarget.
    const withItem: ChaiChaseState = {
      ...fresh,
      items: [{ id: 1, lane: 0, ticksLeft: 3 }],
    };
    const target = chaiChasePlugin.hint!(withItem);
    expect(target).not.toBeNull();
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector.length).toBeGreaterThan(0);
    expect(target!.selector).toBe('[data-testid="hint-target-chai-chase-target"]');
    expect(target!.pulses).toBe(3);

    // Done phase always yields null, even with items.
    const done: ChaiChaseState = { ...withItem, phase: "done" };
    expect(chaiChasePlugin.hint!(done)).toBeNull();
  });
});
