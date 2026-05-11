import { describe, it, expect } from "vitest";
import { canisterPlugin } from "./index.js";
import type { CanisterState } from "./state.js";

const S = {} as never;

describe("canister plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(canisterPlugin.id).toBe("canister");
    expect(canisterPlugin.title).toBe("Canister");
    expect(canisterPlugin.category).toBe("solitaire");
    expect(canisterPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof canisterPlugin.description).toBe("string");
    expect(canisterPlugin.description.length).toBeGreaterThan(0);
    expect(canisterPlugin.settings).toBeDefined();
    expect(typeof canisterPlugin.settings).toBe("object");
    expect(typeof canisterPlugin.initialState).toBe("function");
    expect(typeof canisterPlugin.reducer).toBe("function");
    expect(typeof canisterPlugin.isTerminal).toBe("function");
    expect(canisterPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = canisterPlugin.initialState(42, S);
    const b = canisterPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(canisterPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof canisterPlugin.hint).toBe("function");
    const state = canisterPlugin.initialState(5, S);
    const result = canisterPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="pile-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Drain all piles to force hint() to fall through to the final `return null` branch.
    const emptied: CanisterState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(canisterPlugin.hint!(emptied)).toBeNull();
  });
});
