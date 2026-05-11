import { describe, it, expect } from "vitest";
import { cardStormPlugin } from "./index.js";
import type { CardStormState } from "./state.js";

const S = { dummy: false };

describe("card-storm plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardStormPlugin.id).toBe("card-storm");
    expect(cardStormPlugin.title).toBe("Card Storm");
    expect(cardStormPlugin.category).toBe("cards");
    expect(cardStormPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardStormPlugin.description).toBe("string");
    expect(cardStormPlugin.description.length).toBeGreaterThan(0);
    expect(cardStormPlugin.settings).toBeDefined();
    expect(typeof cardStormPlugin.settings).toBe("object");
    expect(typeof cardStormPlugin.initialState).toBe("function");
    expect(typeof cardStormPlugin.reducer).toBe("function");
    expect(typeof cardStormPlugin.isTerminal).toBe("function");
    expect(cardStormPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardStormPlugin.initialState(42, S);
    const b = cardStormPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.hand.length).toBe(4);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(cardStormPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for non-terminal state and null when done", () => {
    expect(typeof cardStormPlugin.hint).toBe("function");
    const state = cardStormPlugin.initialState(7, S);
    const result = cardStormPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="/);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const done: CardStormState = { ...state, phase: "done" };
    expect(cardStormPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(cardStormPlugin.hint!(done)).toBeNull();
  });
});
