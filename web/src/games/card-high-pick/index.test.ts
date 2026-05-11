import { describe, it, expect } from "vitest";
import { cardHighPickPlugin } from "./index.js";

const S = { rounds: "10" } as const;

describe("card-high-pick plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardHighPickPlugin.id).toBe("card-high-pick");
    expect(cardHighPickPlugin.title).toBe("Card High Pick");
    expect(cardHighPickPlugin.category).toBe("cards");
    expect(cardHighPickPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardHighPickPlugin.description).toBe("string");
    expect(cardHighPickPlugin.description.length).toBeGreaterThan(0);
    expect(cardHighPickPlugin.settings).toBeDefined();
    expect(typeof cardHighPickPlugin.settings).toBe("object");
    expect(typeof cardHighPickPlugin.initialState).toBe("function");
    expect(typeof cardHighPickPlugin.reducer).toBe("function");
    expect(typeof cardHighPickPlugin.isTerminal).toBe("function");
    expect(cardHighPickPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardHighPickPlugin.initialState(123, S);
    const b = cardHighPickPlugin.initialState(123, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("picking");
    expect(a.picked).toBeNull();
    expect(a.hand).toHaveLength(4);
    expect(cardHighPickPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof cardHighPickPlugin.hint).toBe("function");
    const state = cardHighPickPlugin.initialState(7, S);
    const result = cardHighPickPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-high-pick-primary"]');
    expect(result!.pulses).toBe(3);

    const terminal = { ...state, phase: "gameover" as const };
    expect(cardHighPickPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(cardHighPickPlugin.hint!(terminal)).toBeNull();
  });
});
