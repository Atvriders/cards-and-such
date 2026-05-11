import { describe, it, expect } from "vitest";
import { cardCastleDefensePlugin } from "./index.js";
import type { CardCastleDefenseState } from "./state.js";

const S = { dummy: false } as never;

describe("card-castle-defense plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardCastleDefensePlugin.id).toBe("card-castle-defense");
    expect(cardCastleDefensePlugin.title).toBe("Card Castle Defense");
    expect(cardCastleDefensePlugin.category).toBe("cards");
    expect(cardCastleDefensePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardCastleDefensePlugin.description).toBe("string");
    expect(cardCastleDefensePlugin.description.length).toBeGreaterThan(0);
    expect(cardCastleDefensePlugin.settings).toBeDefined();
    expect(typeof cardCastleDefensePlugin.settings).toBe("object");
    expect(typeof cardCastleDefensePlugin.initialState).toBe("function");
    expect(typeof cardCastleDefensePlugin.reducer).toBe("function");
    expect(typeof cardCastleDefensePlugin.isTerminal).toBe("function");
    expect(cardCastleDefensePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardCastleDefensePlugin.initialState(42, S);
    const b = cardCastleDefensePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.card).toBeNull();
    expect(a.phase).toBe("draw");
    expect(cardCastleDefensePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof cardCastleDefensePlugin.hint).toBe("function");
    const state = cardCastleDefensePlugin.initialState(7, S);
    const result = cardCastleDefensePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-castle-defense-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const terminal: CardCastleDefenseState = { ...state, phase: "done" };
    expect(cardCastleDefensePlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(cardCastleDefensePlugin.hint!(terminal)).toBeNull();
  });
});
