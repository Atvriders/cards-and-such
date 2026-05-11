import { describe, it, expect } from "vitest";
import { beleagueredCastlePlugin } from "./index.js";
import type { BeleagueredCastleState } from "./state.js";

const S = {} as never;

describe("beleaguered-castle plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(beleagueredCastlePlugin.id).toBe("beleaguered-castle");
    expect(beleagueredCastlePlugin.title).toBe("Beleaguered Castle");
    expect(beleagueredCastlePlugin.category).toBe("solitaire");
    expect(beleagueredCastlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof beleagueredCastlePlugin.description).toBe("string");
    expect(beleagueredCastlePlugin.description.length).toBeGreaterThan(0);
    expect(beleagueredCastlePlugin.settings).toBeDefined();
    expect(typeof beleagueredCastlePlugin.settings).toBe("object");
    expect(typeof beleagueredCastlePlugin.initialState).toBe("function");
    expect(typeof beleagueredCastlePlugin.reducer).toBe("function");
    expect(typeof beleagueredCastlePlugin.isTerminal).toBe("function");
    expect(beleagueredCastlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = beleagueredCastlePlugin.initialState(42, S);
    const b = beleagueredCastlePlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(beleagueredCastlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof beleagueredCastlePlugin.hint).toBe("function");
    const state = beleagueredCastlePlugin.initialState(5, S);
    const result = beleagueredCastlePlugin.hint!(state);
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

    // Drain all tableau piles to force hint() to fall through to the final `return null` branch.
    const emptied: BeleagueredCastleState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(beleagueredCastlePlugin.hint!(emptied)).toBeNull();
  });
});
