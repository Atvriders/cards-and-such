import { describe, it, expect } from "vitest";
import { blackPairPickupPlugin } from "./index.js";
import type { BlackPairPickupState } from "./state.js";

const S = { dummy: false };

describe("black-pair-pickup plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blackPairPickupPlugin.id).toBe("black-pair-pickup");
    expect(blackPairPickupPlugin.title).toBe("Black Pair Pickup");
    expect(blackPairPickupPlugin.category).toBe("cards");
    expect(blackPairPickupPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blackPairPickupPlugin.description).toBe("string");
    expect(blackPairPickupPlugin.description.length).toBeGreaterThan(0);
    expect(blackPairPickupPlugin.settings).toBeDefined();
    expect(typeof blackPairPickupPlugin.settings).toBe("object");
    expect(typeof blackPairPickupPlugin.initialState).toBe("function");
    expect(typeof blackPairPickupPlugin.reducer).toBe("function");
    expect(typeof blackPairPickupPlugin.isTerminal).toBe("function");
    expect(blackPairPickupPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blackPairPickupPlugin.initialState(42, S);
    const b = blackPairPickupPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.hand).toEqual([]);
    expect(a.phase).toBe("dealing");
    expect(blackPairPickupPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on non-terminal state and null when terminal", () => {
    expect(typeof blackPairPickupPlugin.hint).toBe("function");
    const state = blackPairPickupPlugin.initialState(5, S);
    const result = blackPairPickupPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-black-pair-pickup-primary"]');
    expect(result!.pulses).toBe(3);

    const doneState: BlackPairPickupState = { ...state, phase: "done" };
    expect(blackPairPickupPlugin.isTerminal(doneState)).toEqual({ score: 0 });
    expect(blackPairPickupPlugin.hint!(doneState)).toBeNull();
  });
});
