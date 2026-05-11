import { describe, it, expect } from "vitest";
import { cardLowHigh3Plugin } from "./index.js";
import type { CardLowHigh3State } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-low-high-3 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardLowHigh3Plugin.id).toBe("card-low-high-3");
    expect(cardLowHigh3Plugin.title).toBe("Card Low High 3");
    expect(cardLowHigh3Plugin.category).toBe("cards");
    expect(cardLowHigh3Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardLowHigh3Plugin.description).toBe("string");
    expect(cardLowHigh3Plugin.description.length).toBeGreaterThan(0);
    expect(cardLowHigh3Plugin.settings).toBeDefined();
    expect(typeof cardLowHigh3Plugin.settings).toBe("object");
    expect(typeof cardLowHigh3Plugin.initialState).toBe("function");
    expect(typeof cardLowHigh3Plugin.reducer).toBe("function");
    expect(typeof cardLowHigh3Plugin.isTerminal).toBe("function");
    expect(cardLowHigh3Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardLowHigh3Plugin.initialState(42, S);
    const b = cardLowHigh3Plugin.initialState(42, S);
    expect(a.cards).toEqual(b.cards);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("picking");
    expect(a.choice).toBeNull();
    expect(a.bet).toBeNull();
    expect(a.result).toBeNull();
    expect(a.cards).toHaveLength(3);
    expect(cardLowHigh3Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on the result phase and null otherwise", () => {
    expect(typeof cardLowHigh3Plugin.hint).toBe("function");

    // picking phase: hint should be null
    const picking = cardLowHigh3Plugin.initialState(7, S);
    expect(cardLowHigh3Plugin.hint!(picking)).toBeNull();

    // result phase: hint should return a pulsing selector
    const resultState: CardLowHigh3State = { ...picking, phase: "result" };
    const resultHint = cardLowHigh3Plugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(typeof resultHint!.selector).toBe("string");
    expect(resultHint!.selector.length).toBeGreaterThan(0);
    expect(resultHint!.selector).toBe('[data-testid="hint-target-card-low-high-3-next"]');
    expect(resultHint!.pulses).toBe(3);

    // gameover phase: hint should be null
    const overState: CardLowHigh3State = { ...picking, phase: "gameover" };
    expect(cardLowHigh3Plugin.hint!(overState)).toBeNull();
  });
});
