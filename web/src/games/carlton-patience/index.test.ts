import { describe, it, expect } from "vitest";
import { carltonPatiencePlugin } from "./index.js";
import type { CarltonPatienceState } from "./state.js";

const S = {} as never;

describe("carlton-patience plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(carltonPatiencePlugin.id).toBe("carlton-patience");
    expect(carltonPatiencePlugin.title).toBe("Carlton Patience");
    expect(carltonPatiencePlugin.category).toBe("solitaire");
    expect(carltonPatiencePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof carltonPatiencePlugin.description).toBe("string");
    expect(carltonPatiencePlugin.description.length).toBeGreaterThan(0);
    expect(carltonPatiencePlugin.settings).toBeDefined();
    expect(typeof carltonPatiencePlugin.settings).toBe("object");
    expect(typeof carltonPatiencePlugin.initialState).toBe("function");
    expect(typeof carltonPatiencePlugin.reducer).toBe("function");
    expect(typeof carltonPatiencePlugin.isTerminal).toBe("function");
    expect(carltonPatiencePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = carltonPatiencePlugin.initialState(42, S);
    const b = carltonPatiencePlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(carltonPatiencePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof carltonPatiencePlugin.hint).toBe("function");
    const state = carltonPatiencePlugin.initialState(5, S);
    const result = carltonPatiencePlugin.hint!(state);
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
    const emptied: CarltonPatienceState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(carltonPatiencePlugin.hint!(emptied)).toBeNull();
  });
});
