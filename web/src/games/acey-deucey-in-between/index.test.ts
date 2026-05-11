import { describe, it, expect } from "vitest";
import { aceyDeuceyInBetweenPlugin } from "./index.js";

const S = {} as never;

describe("acey-deucey-in-between plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceyDeuceyInBetweenPlugin.id).toBe("acey-deucey-in-between");
    expect(aceyDeuceyInBetweenPlugin.title).toBe("Acey-Deucey (In Between)");
    expect(aceyDeuceyInBetweenPlugin.category).toBe("cards");
    expect(aceyDeuceyInBetweenPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceyDeuceyInBetweenPlugin.description).toBe("string");
    expect(aceyDeuceyInBetweenPlugin.description.length).toBeGreaterThan(0);
    expect(typeof aceyDeuceyInBetweenPlugin.howToPlay).toBe("string");
    expect(aceyDeuceyInBetweenPlugin.settings).toBeDefined();
    expect(typeof aceyDeuceyInBetweenPlugin.initialState).toBe("function");
    expect(typeof aceyDeuceyInBetweenPlugin.reducer).toBe("function");
    expect(typeof aceyDeuceyInBetweenPlugin.isTerminal).toBe("function");
    expect(aceyDeuceyInBetweenPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null when not gameover", () => {
    const a = aceyDeuceyInBetweenPlugin.initialState(42, S);
    const b = aceyDeuceyInBetweenPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("ready");
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.hand).toEqual([]);
    expect(a.lastGain).toBe(0);
    expect(a.rngSeed).toBe(42);
    expect(aceyDeuceyInBetweenPlugin.isTerminal(a)).toBeNull();

    // Force a gameover state and verify isTerminal returns the score payload.
    const over = { ...a, phase: "gameover" as const, score: 123 };
    expect(aceyDeuceyInBetweenPlugin.isTerminal(over)).toEqual({ score: 123 });
  });

  it("hint returns a HintTarget when phase is 'ready' and null otherwise", () => {
    expect(typeof aceyDeuceyInBetweenPlugin.hint).toBe("function");

    const ready = aceyDeuceyInBetweenPlugin.initialState(7, S);
    const readyHint = aceyDeuceyInBetweenPlugin.hint!(ready);
    expect(readyHint).not.toBeNull();
    expect(readyHint!.selector).toBe('[data-testid="hint-target-acey-deucey-in-between-primary"]');
    expect(readyHint!.pulses).toBe(3);

    const dealt = { ...ready, phase: "dealt" as const };
    expect(aceyDeuceyInBetweenPlugin.hint!(dealt)).toBeNull();

    const over = { ...ready, phase: "gameover" as const };
    expect(aceyDeuceyInBetweenPlugin.hint!(over)).toBeNull();
  });
});
