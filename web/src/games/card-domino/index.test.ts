import { describe, it, expect } from "vitest";
import { cardDominoPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("card-domino plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardDominoPlugin.id).toBe("card-domino");
    expect(cardDominoPlugin.title).toBe("Card Domino");
    expect(cardDominoPlugin.category).toBe("cards");
    expect(cardDominoPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardDominoPlugin.description).toBe("string");
    expect(cardDominoPlugin.description.length).toBeGreaterThan(0);
    expect(cardDominoPlugin.settings).toBeDefined();
    expect(typeof cardDominoPlugin.settings).toBe("object");
    expect(typeof cardDominoPlugin.initialState).toBe("function");
    expect(typeof cardDominoPlugin.reducer).toBe("function");
    expect(typeof cardDominoPlugin.isTerminal).toBe("function");
    expect(cardDominoPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh hand", () => {
    const a = cardDominoPlugin.initialState(42, S);
    const b = cardDominoPlugin.initialState(42, S);
    const aIds = a.hand.map((c) => `${c.id}:${c.rank}`).join("|");
    const bIds = b.hand.map((c) => `${c.id}:${c.rank}`).join("|");
    expect(aIds).toBe(bIds);
    expect(a.chain).toEqual([]);
    expect(a.played).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(cardDominoPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cardDominoPlugin.hint).toBe("function");
    const state = cardDominoPlugin.initialState(7, S);
    const result = cardDominoPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the "done" phase branch -> hint should return null.
    const finished = { ...state, phase: "done" as const };
    expect(cardDominoPlugin.hint!(finished)).toBeNull();
  });
});
