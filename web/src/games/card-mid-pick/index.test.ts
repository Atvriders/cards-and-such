import { describe, it, expect } from "vitest";
import { cardMidPickPlugin } from "./index.js";
import type { CardMidPickState } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-mid-pick plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardMidPickPlugin.id).toBe("card-mid-pick");
    expect(cardMidPickPlugin.title).toBe("Card Mid Pick");
    expect(cardMidPickPlugin.category).toBe("cards");
    expect(cardMidPickPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardMidPickPlugin.description).toBe("string");
    expect(cardMidPickPlugin.description.length).toBeGreaterThan(0);
    expect(cardMidPickPlugin.settings).toBeDefined();
    expect(typeof cardMidPickPlugin.settings).toBe("object");
    expect(typeof cardMidPickPlugin.initialState).toBe("function");
    expect(typeof cardMidPickPlugin.reducer).toBe("function");
    expect(typeof cardMidPickPlugin.isTerminal).toBe("function");
    expect(cardMidPickPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardMidPickPlugin.initialState(42, S);
    const b = cardMidPickPlugin.initialState(42, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("picking");
    expect(a.picked).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.hand).toHaveLength(5);
    for (const c of a.hand) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(52);
    }
    expect(cardMidPickPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when not terminal and null at gameover", () => {
    expect(typeof cardMidPickPlugin.hint).toBe("function");

    const fresh = cardMidPickPlugin.initialState(7, S);
    const freshHint = cardMidPickPlugin.hint!(fresh);
    expect(freshHint).not.toBeNull();
    expect(typeof freshHint!.selector).toBe("string");
    expect(freshHint!.selector).toBe('[data-testid="hint-target-card-mid-pick-primary"]');
    expect(freshHint!.pulses).toBe(3);

    const overState: CardMidPickState = { ...fresh, phase: "gameover" };
    expect(cardMidPickPlugin.isTerminal(overState)).toEqual({ score: fresh.score });
    expect(cardMidPickPlugin.hint!(overState)).toBeNull();
  });
});
