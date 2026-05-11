import { describe, it, expect } from "vitest";
import { crissCrossPokerPlugin } from "./index.js";
import type { CrissCrossPokerState } from "./state.js";

const S = { dummy: false };

describe("criss-cross-poker plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(crissCrossPokerPlugin.id).toBe("criss-cross-poker");
    expect(crissCrossPokerPlugin.title).toBe("Criss-Cross Poker");
    expect(crissCrossPokerPlugin.category).toBe("cards");
    expect(crissCrossPokerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crissCrossPokerPlugin.description).toBe("string");
    expect(crissCrossPokerPlugin.description.length).toBeGreaterThan(0);
    expect(crissCrossPokerPlugin.settings).toBeDefined();
    expect(typeof crissCrossPokerPlugin.settings).toBe("object");
    expect(typeof crissCrossPokerPlugin.initialState).toBe("function");
    expect(typeof crissCrossPokerPlugin.reducer).toBe("function");
    expect(typeof crissCrossPokerPlugin.isTerminal).toBe("function");
    expect(crissCrossPokerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = crissCrossPokerPlugin.initialState(42, S);
    const b = crissCrossPokerPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("deal");
    expect(a.hand).toEqual([]);
    expect(crissCrossPokerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for deal/scored phases and null for done", () => {
    expect(typeof crissCrossPokerPlugin.hint).toBe("function");
    const fresh = crissCrossPokerPlugin.initialState(7, S);
    const dealHint = crissCrossPokerPlugin.hint!(fresh);
    expect(dealHint).not.toBeNull();
    expect(dealHint!.selector).toBe('[data-testid="hint-target-criss-cross-poker-deal"]');
    expect(dealHint!.pulses).toBe(3);

    const scored: CrissCrossPokerState = { ...fresh, phase: "scored" };
    const scoredHint = crissCrossPokerPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-criss-cross-poker-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const done: CrissCrossPokerState = { ...fresh, phase: "done" };
    expect(crissCrossPokerPlugin.hint!(done)).toBeNull();
  });
});
