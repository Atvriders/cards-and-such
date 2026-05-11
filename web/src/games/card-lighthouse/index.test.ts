import { describe, it, expect } from "vitest";
import { cardLighthousePlugin } from "./index.js";
import type { CardLighthouseState } from "./state.js";

const S = { dummy: false };

describe("card-lighthouse plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardLighthousePlugin.id).toBe("card-lighthouse");
    expect(cardLighthousePlugin.title).toBe("Card Lighthouse");
    expect(cardLighthousePlugin.category).toBe("cards");
    expect(cardLighthousePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardLighthousePlugin.description).toBe("string");
    expect(cardLighthousePlugin.description.length).toBeGreaterThan(0);
    expect(cardLighthousePlugin.settings).toBeDefined();
    expect(typeof cardLighthousePlugin.initialState).toBe("function");
    expect(typeof cardLighthousePlugin.reducer).toBe("function");
    expect(typeof cardLighthousePlugin.isTerminal).toBe("function");
    expect(cardLighthousePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardLighthousePlugin.initialState(42, S);
    const b = cardLighthousePlugin.initialState(42, S);
    expect(a.cards).toEqual(b.cards);
    expect(a.target).toBe(b.target);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.phase).toBe("picking");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.picked).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.cards).toHaveLength(5);
    expect(a.target).toBeGreaterThanOrEqual(0);
    expect(a.target).toBeLessThan(4);
    expect(cardLighthousePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof cardLighthousePlugin.hint).toBe("function");
    const state = cardLighthousePlugin.initialState(7, S);
    const result = cardLighthousePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector).toBe('[data-testid="hint-target-card-lighthouse-primary"]');
    expect(result!.pulses).toBe(3);

    const done: CardLighthouseState = { ...state, phase: "done" };
    expect(cardLighthousePlugin.hint!(done)).toBeNull();
    expect(cardLighthousePlugin.isTerminal(done)).toEqual({ score: state.score });
  });
});
