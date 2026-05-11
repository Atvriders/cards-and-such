import { describe, it, expect } from "vitest";
import { cardStackFlipPlugin } from "./index.js";

const S = { rounds: "10" } as const;

describe("card-stack-flip plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardStackFlipPlugin.id).toBe("card-stack-flip");
    expect(cardStackFlipPlugin.title).toBe("Card Stack Flip");
    expect(cardStackFlipPlugin.category).toBe("cards");
    expect(cardStackFlipPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardStackFlipPlugin.description).toBe("string");
    expect(cardStackFlipPlugin.description.length).toBeGreaterThan(0);
    expect(cardStackFlipPlugin.settings).toBeDefined();
    expect(typeof cardStackFlipPlugin.settings).toBe("object");
    expect(typeof cardStackFlipPlugin.initialState).toBe("function");
    expect(typeof cardStackFlipPlugin.reducer).toBe("function");
    expect(typeof cardStackFlipPlugin.isTerminal).toBe("function");
    expect(cardStackFlipPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardStackFlipPlugin.initialState(42, S);
    const b = cardStackFlipPlugin.initialState(42, S);
    expect(a.deck).toEqual(b.deck);
    expect(a.pos).toBe(0);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("waiting");
    expect(a.flipped).toEqual([]);
    expect(cardStackFlipPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for a non-terminal state and null when terminal", () => {
    expect(typeof cardStackFlipPlugin.hint).toBe("function");
    const state = cardStackFlipPlugin.initialState(5, S);
    const result = cardStackFlipPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-stack-flip-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const terminal = { ...state, phase: "gameover" as const };
    expect(cardStackFlipPlugin.isTerminal(terminal)).toEqual({ score: state.score });
    expect(cardStackFlipPlugin.hint!(terminal)).toBeNull();
  });
});
