import { describe, it, expect } from "vitest";
import { aceFinderPlugin } from "./index.js";
import type { AceFinderState } from "./state.js";

const S = { rounds: "5" } as const;

describe("ace-finder plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceFinderPlugin.id).toBe("ace-finder");
    expect(aceFinderPlugin.title).toBe("Ace Finder");
    expect(aceFinderPlugin.category).toBe("cards");
    expect(aceFinderPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceFinderPlugin.description).toBe("string");
    expect(aceFinderPlugin.description.length).toBeGreaterThan(0);
    expect(aceFinderPlugin.settings).toBeDefined();
    expect(typeof aceFinderPlugin.settings).toBe("object");
    expect(typeof aceFinderPlugin.initialState).toBe("function");
    expect(typeof aceFinderPlugin.reducer).toBe("function");
    expect(typeof aceFinderPlugin.isTerminal).toBe("function");
    expect(aceFinderPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = aceFinderPlugin.initialState(42, S);
    const b = aceFinderPlugin.initialState(42, S);
    expect(a.cards).toEqual(b.cards);
    expect(a.acePos).toBe(b.acePos);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.phase).toBe("picking");
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(5);
    expect(a.score).toBe(0);
    expect(a.hintUsed).toBe(false);
    expect(a.picked).toBeNull();
    expect(a.revealed).toEqual([false, false, false, false]);
    expect(a.cards.length).toBe(4);
    expect(a.acePos).toBeGreaterThanOrEqual(0);
    expect(a.acePos).toBeLessThan(4);
    expect(aceFinderPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while picking, switches to next selector on result, and is null otherwise", () => {
    expect(typeof aceFinderPlugin.hint).toBe("function");
    const fresh = aceFinderPlugin.initialState(7, S);
    const pickingHint = aceFinderPlugin.hint!(fresh);
    expect(pickingHint).not.toBeNull();
    expect(pickingHint!.selector).toBe('[data-testid="hint-target-ace-finder-hint"]');
    expect(pickingHint!.pulses).toBe(3);

    // After hintUsed flips true, picking-phase hint falls through to null.
    const hintUsedState: AceFinderState = { ...fresh, hintUsed: true };
    expect(aceFinderPlugin.hint!(hintUsedState)).toBeNull();

    // In result phase, hint should point at the "next" button.
    const resultState: AceFinderState = { ...fresh, phase: "result" };
    const resultHint = aceFinderPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-ace-finder-next"]');
    expect(resultHint!.pulses).toBe(3);

    // Gameover phase returns null.
    const gameoverState: AceFinderState = { ...fresh, phase: "gameover" };
    expect(aceFinderPlugin.hint!(gameoverState)).toBeNull();
  });
});
