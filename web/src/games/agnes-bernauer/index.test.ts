import { describe, it, expect } from "vitest";
import { agnesBernauerPlugin } from "./index.js";
import type { AgnesBernauerState } from "./state.js";

const S = {} as never;

describe("agnes-bernauer plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(agnesBernauerPlugin.id).toBe("agnes-bernauer");
    expect(agnesBernauerPlugin.title).toBe("Agnes Bernauer");
    expect(agnesBernauerPlugin.category).toBe("solitaire");
    expect(agnesBernauerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof agnesBernauerPlugin.description).toBe("string");
    expect(agnesBernauerPlugin.description.length).toBeGreaterThan(0);
    expect(agnesBernauerPlugin.settings).toBeDefined();
    expect(typeof agnesBernauerPlugin.settings).toBe("object");
    expect(typeof agnesBernauerPlugin.initialState).toBe("function");
    expect(typeof agnesBernauerPlugin.reducer).toBe("function");
    expect(typeof agnesBernauerPlugin.isTerminal).toBe("function");
    expect(agnesBernauerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = agnesBernauerPlugin.initialState(42, S);
    const b = agnesBernauerPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(agnesBernauerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof agnesBernauerPlugin.hint).toBe("function");
    const state = agnesBernauerPlugin.initialState(5, S);
    const result = agnesBernauerPlugin.hint!(state);
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
    const emptied: AgnesBernauerState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(agnesBernauerPlugin.hint!(emptied)).toBeNull();
  });
});
