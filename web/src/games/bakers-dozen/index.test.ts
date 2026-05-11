import { describe, it, expect } from "vitest";
import { bakersDozPlugin } from "./index.js";
import type { BakersDozenState } from "./state.js";

const S = {} as never;

describe("bakers-dozen plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bakersDozPlugin.id).toBe("bakers-dozen");
    expect(bakersDozPlugin.title).toBe("Baker's Dozen");
    expect(bakersDozPlugin.category).toBe("solitaire");
    expect(bakersDozPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bakersDozPlugin.description).toBe("string");
    expect(bakersDozPlugin.description.length).toBeGreaterThan(0);
    expect(bakersDozPlugin.settings).toBeDefined();
    expect(typeof bakersDozPlugin.settings).toBe("object");
    expect(typeof bakersDozPlugin.initialState).toBe("function");
    expect(typeof bakersDozPlugin.reducer).toBe("function");
    expect(typeof bakersDozPlugin.isTerminal).toBe("function");
    expect(bakersDozPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bakersDozPlugin.initialState(42, S);
    const b = bakersDozPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(bakersDozPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bakersDozPlugin.hint).toBe("function");
    const state = bakersDozPlugin.initialState(5, S);
    const result = bakersDozPlugin.hint!(state);
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
    const emptied: BakersDozenState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(bakersDozPlugin.hint!(emptied)).toBeNull();
  });
});
