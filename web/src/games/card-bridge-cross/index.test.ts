import { describe, it, expect } from "vitest";
import { cardBridgeCrossPlugin } from "./index.js";
import type { CardBridgeCrossState } from "./state.js";

const S = { dummy: false } as never;

describe("card-bridge-cross plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardBridgeCrossPlugin.id).toBe("card-bridge-cross");
    expect(cardBridgeCrossPlugin.title).toBe("Card Bridge Cross");
    expect(cardBridgeCrossPlugin.category).toBe("cards");
    expect(cardBridgeCrossPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardBridgeCrossPlugin.description).toBe("string");
    expect(cardBridgeCrossPlugin.description.length).toBeGreaterThan(0);
    expect(cardBridgeCrossPlugin.settings).toBeDefined();
    expect(typeof cardBridgeCrossPlugin.settings).toBe("object");
    expect(typeof cardBridgeCrossPlugin.initialState).toBe("function");
    expect(typeof cardBridgeCrossPlugin.reducer).toBe("function");
    expect(typeof cardBridgeCrossPlugin.isTerminal).toBe("function");
    expect(cardBridgeCrossPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardBridgeCrossPlugin.initialState(42, S);
    const b = cardBridgeCrossPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("draw");
    expect(cardBridgeCrossPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when the game is done", () => {
    expect(typeof cardBridgeCrossPlugin.hint).toBe("function");
    const state = cardBridgeCrossPlugin.initialState(5, S);
    const result = cardBridgeCrossPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-bridge-cross-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: CardBridgeCrossState = { ...state, phase: "done" };
    expect(cardBridgeCrossPlugin.hint!(finished)).toBeNull();
    expect(cardBridgeCrossPlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
