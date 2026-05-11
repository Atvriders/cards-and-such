import { describe, it, expect } from "vitest";
import { burnCardPokerPlugin } from "./index.js";
import type { BurnCardPokerState } from "./state.js";

const S = { dummy: false } as never;

describe("burn-card-poker plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(burnCardPokerPlugin.id).toBe("burn-card-poker");
    expect(burnCardPokerPlugin.title).toBe("Burn Card Poker Solo");
    expect(burnCardPokerPlugin.category).toBe("cards");
    expect(burnCardPokerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof burnCardPokerPlugin.description).toBe("string");
    expect(burnCardPokerPlugin.description.length).toBeGreaterThan(0);
    expect(burnCardPokerPlugin.settings).toBeDefined();
    expect(typeof burnCardPokerPlugin.settings).toBe("object");
    expect(typeof burnCardPokerPlugin.initialState).toBe("function");
    expect(typeof burnCardPokerPlugin.reducer).toBe("function");
    expect(typeof burnCardPokerPlugin.isTerminal).toBe("function");
    expect(burnCardPokerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = burnCardPokerPlugin.initialState(42, S);
    const b = burnCardPokerPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.hand).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("deal");
    expect(burnCardPokerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for deal/scored phases and null when terminal", () => {
    expect(typeof burnCardPokerPlugin.hint).toBe("function");
    const fresh = burnCardPokerPlugin.initialState(7, S);
    const dealHint = burnCardPokerPlugin.hint!(fresh);
    expect(dealHint).not.toBeNull();
    expect(dealHint!.selector).toBe('[data-testid="hint-target-burn-card-poker-deal"]');
    expect(dealHint!.pulses).toBe(3);

    const scoredState: BurnCardPokerState = { ...fresh, phase: "scored" };
    const scoredHint = burnCardPokerPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-burn-card-poker-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: BurnCardPokerState = { ...fresh, phase: "done" };
    expect(burnCardPokerPlugin.hint!(doneState)).toBeNull();
    expect(burnCardPokerPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
