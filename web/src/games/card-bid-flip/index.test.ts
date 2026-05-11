import { describe, it, expect } from "vitest";
import { cardBidFlipPlugin } from "./index.js";
import type { CardBidFlipState } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-bid-flip plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardBidFlipPlugin.id).toBe("card-bid-flip");
    expect(cardBidFlipPlugin.title).toBe("Card Bid Flip");
    expect(cardBidFlipPlugin.category).toBe("cards");
    expect(cardBidFlipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardBidFlipPlugin.description).toBe("string");
    expect(cardBidFlipPlugin.description.length).toBeGreaterThan(0);
    expect(cardBidFlipPlugin.settings).toBeDefined();
    expect(typeof cardBidFlipPlugin.settings).toBe("object");
    expect(typeof cardBidFlipPlugin.initialState).toBe("function");
    expect(typeof cardBidFlipPlugin.reducer).toBe("function");
    expect(typeof cardBidFlipPlugin.isTerminal).toBe("function");
    expect(cardBidFlipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardBidFlipPlugin.initialState(42, S);
    const b = cardBidFlipPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.deck.length).toBe(52);
    expect(a.coins).toBe(100);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("bidding");
    expect(a.currentCard).toBeNull();
    expect(a.lastWin).toBeNull();
    expect(cardBidFlipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while bidding and null otherwise", () => {
    expect(typeof cardBidFlipPlugin.hint).toBe("function");
    const state = cardBidFlipPlugin.initialState(5, S);
    const result = cardBidFlipPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-bid-flip-primary"]');
    expect(result!.pulses).toBe(3);

    const flipped: CardBidFlipState = { ...state, phase: "flipped" };
    expect(cardBidFlipPlugin.hint!(flipped)).toBeNull();

    const over: CardBidFlipState = { ...state, phase: "gameover" };
    expect(cardBidFlipPlugin.hint!(over)).toBeNull();
    expect(cardBidFlipPlugin.isTerminal(over)).toEqual({ score: over.coins });
  });
});
