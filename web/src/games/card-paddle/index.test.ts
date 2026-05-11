import { describe, it, expect } from "vitest";
import { cardPaddlePlugin } from "./index.js";
import type { CardPaddleState } from "./state.js";

const S = { dummy: false };

describe("card-paddle plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPaddlePlugin.id).toBe("card-paddle");
    expect(cardPaddlePlugin.title).toBe("Card Paddle");
    expect(cardPaddlePlugin.category).toBe("cards");
    expect(cardPaddlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPaddlePlugin.description).toBe("string");
    expect(cardPaddlePlugin.description.length).toBeGreaterThan(0);
    expect(typeof cardPaddlePlugin.howToPlay).toBe("string");
    expect(cardPaddlePlugin.settings).toBeDefined();
    expect(typeof cardPaddlePlugin.settings).toBe("object");
    expect(typeof cardPaddlePlugin.initialState).toBe("function");
    expect(typeof cardPaddlePlugin.reducer).toBe("function");
    expect(typeof cardPaddlePlugin.isTerminal).toBe("function");
    expect(cardPaddlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardPaddlePlugin.initialState(42, S);
    const b = cardPaddlePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("predict");
    expect(a.rngSeed).toBe(42);
    expect(cardPaddlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on predict phase and null otherwise", () => {
    expect(typeof cardPaddlePlugin.hint).toBe("function");
    const state = cardPaddlePlugin.initialState(5, S);
    const result = cardPaddlePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-paddle-primary"]');
    expect(result!.pulses).toBe(3);

    const doneState: CardPaddleState = { ...state, phase: "done" };
    expect(cardPaddlePlugin.hint!(doneState)).toBeNull();

    const resultState: CardPaddleState = { ...state, phase: "result" };
    expect(cardPaddlePlugin.hint!(resultState)).toBeNull();
  });
});
