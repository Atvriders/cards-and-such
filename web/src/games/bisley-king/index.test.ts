import { describe, it, expect } from "vitest";
import { bisleyKingPlugin } from "./index.js";

const S = { dummy: false };

describe("bisley-king plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bisleyKingPlugin.id).toBe("bisley-king");
    expect(bisleyKingPlugin.title).toBe("Bisley Kings");
    expect(bisleyKingPlugin.category).toBe("solitaire");
    expect(bisleyKingPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bisleyKingPlugin.description).toBe("string");
    expect(bisleyKingPlugin.description.length).toBeGreaterThan(0);
    expect(bisleyKingPlugin.settings).toBeDefined();
    expect(typeof bisleyKingPlugin.settings).toBe("object");
    expect(typeof bisleyKingPlugin.initialState).toBe("function");
    expect(typeof bisleyKingPlugin.reducer).toBe("function");
    expect(typeof bisleyKingPlugin.isTerminal).toBe("function");
    expect(bisleyKingPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bisleyKingPlugin.initialState(42, S);
    const b = bisleyKingPlugin.initialState(42, S);
    expect(a.deck).toEqual(b.deck);
    expect(a.hand).toEqual(b.hand);
    expect(a.pos).toBe(b.pos);
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.hand.length).toBe(5);
    expect(a.deck.length).toBe(52);
    expect(bisleyKingPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh deal and null when terminal", () => {
    expect(typeof bisleyKingPlugin.hint).toBe("function");
    const state = bisleyKingPlugin.initialState(5, S);
    const result = bisleyKingPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bisley-king-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const doneState = { ...state, phase: "done" as const };
    expect(bisleyKingPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(bisleyKingPlugin.hint!(doneState)).toBeNull();
  });
});
