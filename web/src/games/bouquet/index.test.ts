import { describe, it, expect } from "vitest";
import { bouquetPlugin } from "./index.js";
import type { BouquetState } from "./state.js";

const S = {} as never;

describe("bouquet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bouquetPlugin.id).toBe("bouquet");
    expect(bouquetPlugin.title).toBe("Bouquet");
    expect(bouquetPlugin.category).toBe("solitaire");
    expect(bouquetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bouquetPlugin.description).toBe("string");
    expect(bouquetPlugin.description.length).toBeGreaterThan(0);
    expect(bouquetPlugin.settings).toBeDefined();
    expect(typeof bouquetPlugin.settings).toBe("object");
    expect(typeof bouquetPlugin.initialState).toBe("function");
    expect(typeof bouquetPlugin.reducer).toBe("function");
    expect(typeof bouquetPlugin.isTerminal).toBe("function");
    expect(bouquetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bouquetPlugin.initialState(42, S);
    const b = bouquetPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(bouquetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bouquetPlugin.hint).toBe("function");
    const state = bouquetPlugin.initialState(7, S);
    const result = bouquetPlugin.hint!(state);
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
    const emptied: BouquetState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(bouquetPlugin.hint!(emptied)).toBeNull();
  });
});
