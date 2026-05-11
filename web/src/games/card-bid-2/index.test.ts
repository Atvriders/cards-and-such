import { describe, it, expect } from "vitest";
import { cardBid2Plugin } from "./index.js";

const S = { rounds: "8" } as const;

describe("card-bid-2 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardBid2Plugin.id).toBe("card-bid-2");
    expect(cardBid2Plugin.title).toBe("Card Bid 2");
    expect(cardBid2Plugin.category).toBe("cards");
    expect(cardBid2Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardBid2Plugin.description).toBe("string");
    expect(cardBid2Plugin.description.length).toBeGreaterThan(0);
    expect(cardBid2Plugin.settings).toBeDefined();
    expect(typeof cardBid2Plugin.settings).toBe("object");
    expect(typeof cardBid2Plugin.initialState).toBe("function");
    expect(typeof cardBid2Plugin.reducer).toBe("function");
    expect(typeof cardBid2Plugin.isTerminal).toBe("function");
    expect(cardBid2Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh deal", () => {
    const a = cardBid2Plugin.initialState(42, S);
    const b = cardBid2Plugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.topCard).toBe(b.topCard);
    expect(a.coins).toBe(50);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(8);
    expect(a.phase).toBe("betting");
    expect(a.revealedCard).toBeNull();
    expect(a.lastResult).toBeNull();
    expect(cardBid2Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh deal and null when the game is over", () => {
    expect(typeof cardBid2Plugin.hint).toBe("function");
    const state = cardBid2Plugin.initialState(7, S);
    const result = cardBid2Plugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-bid-2-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const terminal = { ...state, phase: "gameover" as const };
    expect(cardBid2Plugin.hint!(terminal)).toBeNull();
    expect(cardBid2Plugin.isTerminal(terminal)).toEqual({ score: terminal.coins });
  });
});
