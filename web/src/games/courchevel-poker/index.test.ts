import { describe, it, expect } from "vitest";
import { courchevelPokerPlugin } from "./index.js";
import type { CourchevelPokerState } from "./state.js";

const S = { dummy: false } as never;

describe("courchevel-poker plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(courchevelPokerPlugin.id).toBe("courchevel-poker");
    expect(courchevelPokerPlugin.title).toBe("Courchevel Solo");
    expect(courchevelPokerPlugin.category).toBe("cards");
    expect(courchevelPokerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof courchevelPokerPlugin.description).toBe("string");
    expect(courchevelPokerPlugin.description.length).toBeGreaterThan(0);
    expect(courchevelPokerPlugin.settings).toBeDefined();
    expect(typeof courchevelPokerPlugin.settings).toBe("object");
    expect(typeof courchevelPokerPlugin.initialState).toBe("function");
    expect(typeof courchevelPokerPlugin.reducer).toBe("function");
    expect(typeof courchevelPokerPlugin.isTerminal).toBe("function");
    expect(courchevelPokerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = courchevelPokerPlugin.initialState(42, S);
    const b = courchevelPokerPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.hand).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.rank).toBe("");
    expect(a.rankPts).toBe(0);
    expect(a.phase).toBe("deal");
    expect(a.rngSeed).toBe(42);
    expect(courchevelPokerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for deal/scored phases and null when terminal", () => {
    expect(typeof courchevelPokerPlugin.hint).toBe("function");
    const fresh = courchevelPokerPlugin.initialState(7, S);
    const dealHint = courchevelPokerPlugin.hint!(fresh);
    expect(dealHint).not.toBeNull();
    expect(dealHint!.selector).toBe('[data-testid="hint-target-courchevel-poker-deal"]');
    expect(dealHint!.pulses).toBe(3);

    const scoredState: CourchevelPokerState = { ...fresh, phase: "scored" };
    const scoredHint = courchevelPokerPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-courchevel-poker-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: CourchevelPokerState = { ...fresh, phase: "done", score: 123 };
    expect(courchevelPokerPlugin.hint!(doneState)).toBeNull();
    expect(courchevelPokerPlugin.isTerminal(doneState)).toEqual({ score: 123 });
  });
});
