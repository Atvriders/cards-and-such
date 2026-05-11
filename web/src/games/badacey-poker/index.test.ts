import { describe, it, expect } from "vitest";
import { badaceyPokerPlugin } from "./index.js";
import type { BadaceyPokerState } from "./state.js";

const S = {} as never;

describe("badacey-poker plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(badaceyPokerPlugin.id).toBe("badacey-poker");
    expect(badaceyPokerPlugin.title).toBe("Badacey Solo");
    expect(badaceyPokerPlugin.category).toBe("cards");
    expect(badaceyPokerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof badaceyPokerPlugin.description).toBe("string");
    expect(badaceyPokerPlugin.description.length).toBeGreaterThan(0);
    expect(badaceyPokerPlugin.settings).toBeDefined();
    expect(typeof badaceyPokerPlugin.settings).toBe("object");
    expect(typeof badaceyPokerPlugin.initialState).toBe("function");
    expect(typeof badaceyPokerPlugin.reducer).toBe("function");
    expect(typeof badaceyPokerPlugin.isTerminal).toBe("function");
    expect(badaceyPokerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = badaceyPokerPlugin.initialState(42, S);
    const b = badaceyPokerPlugin.initialState(42, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.round).toBe(b.round);
    expect(a.hand).toEqual(b.hand);
    expect(a.rank).toBe(b.rank);
    expect(a.rankPts).toBe(b.rankPts);
    expect(a.score).toBe(b.score);
    expect(a.phase).toBe(b.phase);
    expect(a.round).toBe(1);
    expect(a.hand).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("deal");
    expect(badaceyPokerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget in deal/scored phase and null otherwise", () => {
    expect(typeof badaceyPokerPlugin.hint).toBe("function");

    const dealState = badaceyPokerPlugin.initialState(7, S);
    const dealHint = badaceyPokerPlugin.hint!(dealState);
    expect(dealHint).not.toBeNull();
    expect(dealHint!.selector).toBe('[data-testid="hint-target-badacey-poker-deal"]');
    expect(dealHint!.pulses).toBe(3);

    const scoredState: BadaceyPokerState = { ...dealState, phase: "scored" };
    const scoredHint = badaceyPokerPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-badacey-poker-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: BadaceyPokerState = { ...dealState, phase: "done" };
    expect(badaceyPokerPlugin.hint!(doneState)).toBeNull();
  });
});
