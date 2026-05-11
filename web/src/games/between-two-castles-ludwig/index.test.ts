import { describe, it, expect } from "vitest";
import { betweenTwoCastlesLudwigPlugin } from "./index.js";

const S = { dummy: false };

describe("between-two-castles-ludwig plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(betweenTwoCastlesLudwigPlugin.id).toBe("between-two-castles-ludwig");
    expect(betweenTwoCastlesLudwigPlugin.title).toBe("Between Two Castles");
    expect(betweenTwoCastlesLudwigPlugin.category).toBe("cards");
    expect(betweenTwoCastlesLudwigPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof betweenTwoCastlesLudwigPlugin.description).toBe("string");
    expect(betweenTwoCastlesLudwigPlugin.description.length).toBeGreaterThan(0);
    expect(typeof betweenTwoCastlesLudwigPlugin.howToPlay).toBe("string");
    expect(betweenTwoCastlesLudwigPlugin.settings).toBeDefined();
    expect(typeof betweenTwoCastlesLudwigPlugin.initialState).toBe("function");
    expect(typeof betweenTwoCastlesLudwigPlugin.reducer).toBe("function");
    expect(typeof betweenTwoCastlesLudwigPlugin.isTerminal).toBe("function");
    expect(typeof betweenTwoCastlesLudwigPlugin.hint).toBe("function");
    expect(betweenTwoCastlesLudwigPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while drafting", () => {
    const a = betweenTwoCastlesLudwigPlugin.initialState(42, S);
    const b = betweenTwoCastlesLudwigPlugin.initialState(42, S);
    const aSig = a.offer.map((c) => `${c.suit}:${c.rank}`).join(",");
    const bSig = b.offer.map((c) => `${c.suit}:${c.rank}`).join(",");
    expect(aSig).toBe(bSig);
    expect(a.offer.length).toBe(4);
    expect(a.totalRounds).toBe(9);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("drafting");
    expect(a.myTableau).toEqual([]);
    expect(a.cpuTableau).toEqual([]);
    expect(a.myScore).toBe(0);
    expect(a.cpuScore).toBe(0);
    for (const card of a.offer) {
      expect(card.suit).toBeGreaterThanOrEqual(0);
      expect(card.suit).toBeLessThan(5);
      expect(card.rank).toBeGreaterThanOrEqual(1);
      expect(card.rank).toBeLessThanOrEqual(9);
    }
    expect(betweenTwoCastlesLudwigPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drafting with offers and null otherwise", () => {
    const state = betweenTwoCastlesLudwigPlugin.initialState(7, S);
    const draftingHint = betweenTwoCastlesLudwigPlugin.hint!(state);
    expect(draftingHint).not.toBeNull();
    expect(draftingHint!.selector).toBe('[class$="-offer"] > button:first-child');
    expect(draftingHint!.pulses).toBe(3);

    const emptyOfferState = { ...state, offer: [] };
    expect(betweenTwoCastlesLudwigPlugin.hint!(emptyOfferState)).toBeNull();

    const doneState = { ...state, phase: "done" as const };
    expect(betweenTwoCastlesLudwigPlugin.hint!(doneState)).toBeNull();
    expect(betweenTwoCastlesLudwigPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
