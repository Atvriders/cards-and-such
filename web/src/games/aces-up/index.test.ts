import { describe, it, expect } from "vitest";
import { acesUpPlugin, acesUpSettings } from "./index.js";
import type { AcesUpState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

describe("acesUpPlugin", () => {
  it("exposes the required GamePlugin shape", () => {
    expect(acesUpPlugin.id).toBe("aces-up");
    expect(acesUpPlugin.title).toBe("Aces Up");
    expect(acesUpPlugin.category).toBe("solitaire");
    expect(acesUpPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acesUpPlugin.description).toBe("string");
    expect(acesUpPlugin.description.length).toBeGreaterThan(0);
    expect(acesUpPlugin.settings).toBe(acesUpSettings);
    expect(typeof acesUpPlugin.initialState).toBe("function");
    expect(typeof acesUpPlugin.reducer).toBe("function");
    expect(typeof acesUpPlugin.isTerminal).toBe("function");
    expect(typeof acesUpPlugin.hint).toBe("function");
    expect(acesUpPlugin.component).toBeDefined();
  });

  it("initialState is deterministic for a seed and isTerminal returns null at start", () => {
    const seed = 123;
    const a = acesUpPlugin.initialState(seed, acesUpSettings);
    const b = acesUpPlugin.initialState(seed, acesUpSettings);
    // Deterministic: same seed produces identical card layout
    const flatA = a.columns.flat().map((c) => c.id).concat(a.stock.map((c) => c.id));
    const flatB = b.columns.flat().map((c) => c.id).concat(b.stock.map((c) => c.id));
    expect(flatA).toEqual(flatB);
    // Sanity: starts with 4 columns of 1 + 48 in stock, not won
    expect(a.columns).toHaveLength(4);
    expect(a.stock).toHaveLength(48);
    expect(a.won).toBe(false);
    // isTerminal must be null because stock is non-empty
    expect(acesUpPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns a HintTarget when stock remains, and null when won", () => {
    const fresh = acesUpPlugin.initialState(7, acesUpSettings);
    const target = acesUpPlugin.hint!(fresh);
    // Fresh game: either discardable tops or stock — both branches yield a target
    expect(target).not.toBeNull();
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector.length).toBeGreaterThan(0);
    expect(target!.pulses).toBe(3);
    // The two valid selectors per the source branches
    expect([
      '[data-testid="hint-target-aces-up-discard"]',
      '[data-testid="hint-target-aces-up-deal"]',
    ]).toContain(target!.selector);

    // Won state short-circuits to null
    const wonState: AcesUpState = {
      columns: [[], [], [], []] as Card[][],
      stock: [],
      discarded: [],
      score: 48,
      movesMade: 10,
      won: true,
    };
    expect(acesUpPlugin.hint!(wonState)).toBeNull();
  });
});
