import { describe, it, expect } from "vitest";
import { cardSnapPairPlugin } from "./index.js";

const S = { rounds: "10" as const };

describe("card-snap-pair plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardSnapPairPlugin.id).toBe("card-snap-pair");
    expect(cardSnapPairPlugin.title).toBe("Card Snap Pair");
    expect(cardSnapPairPlugin.category).toBe("cards");
    expect(cardSnapPairPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardSnapPairPlugin.description).toBe("string");
    expect(cardSnapPairPlugin.description.length).toBeGreaterThan(0);
    expect(cardSnapPairPlugin.settings).toBeDefined();
    expect(typeof cardSnapPairPlugin.settings).toBe("object");
    expect(typeof cardSnapPairPlugin.initialState).toBe("function");
    expect(typeof cardSnapPairPlugin.reducer).toBe("function");
    expect(typeof cardSnapPairPlugin.isTerminal).toBe("function");
    expect(cardSnapPairPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardSnapPairPlugin.initialState(42, S);
    const b = cardSnapPairPlugin.initialState(42, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.card1).toBeNull();
    expect(a.card2).toBeNull();
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("waiting");
    expect(a.matched).toBe(false);
    expect(cardSnapPairPlugin.isTerminal(a)).toBeNull();

    const terminal = { ...a, phase: "gameover" as const, score: 42 };
    expect(cardSnapPairPlugin.isTerminal(terminal)).toEqual({ score: 42 });
  });

  it("hint returns a HintTarget when not terminal and null when terminal", () => {
    expect(typeof cardSnapPairPlugin.hint).toBe("function");
    const state = cardSnapPairPlugin.initialState(7, S);
    const active = cardSnapPairPlugin.hint!(state);
    expect(active).not.toBeNull();
    expect(active!.selector).toBe('[data-testid="hint-target-card-snap-pair-primary"]');
    expect(active!.pulses).toBe(3);

    const terminalState = { ...state, phase: "gameover" as const };
    const done = cardSnapPairPlugin.hint!(terminalState);
    expect(done).toBeNull();
  });
});
