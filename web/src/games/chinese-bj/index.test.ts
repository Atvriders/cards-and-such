import { describe, it, expect } from "vitest";
import { chineseBjPlugin } from "./index.js";
import type { ChineseBjState } from "./state.js";

const S = { dummy: false } as never;

describe("chinese-bj plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chineseBjPlugin.id).toBe("chinese-bj");
    expect(chineseBjPlugin.title).toBe("Chinese Blackjack");
    expect(chineseBjPlugin.category).toBe("cards");
    expect(chineseBjPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chineseBjPlugin.description).toBe("string");
    expect(chineseBjPlugin.description.length).toBeGreaterThan(0);
    expect(chineseBjPlugin.settings).toBeDefined();
    expect(typeof chineseBjPlugin.settings).toBe("object");
    expect(typeof chineseBjPlugin.initialState).toBe("function");
    expect(typeof chineseBjPlugin.reducer).toBe("function");
    expect(typeof chineseBjPlugin.isTerminal).toBe("function");
    expect(chineseBjPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = chineseBjPlugin.initialState(42, S);
    const b = chineseBjPlugin.initialState(42, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.total).toBe(b.total);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("play");
    expect(a.score).toBe(0);
    expect(chineseBjPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each phase and respects total thresholds", () => {
    expect(typeof chineseBjPlugin.hint).toBe("function");
    const state = chineseBjPlugin.initialState(7, S);
    const result = chineseBjPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-chinese-bj-/);
    expect(result!.pulses).toBe(3);

    // Force "scored" phase: hint should point at the "next" target.
    const scored: ChineseBjState = { ...state, phase: "scored" };
    const scoredHint = chineseBjPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-chinese-bj-next"]');

    // Force "done" phase: hint must be null (only "play" and "scored" produce targets).
    const done: ChineseBjState = { ...state, phase: "done" };
    expect(chineseBjPlugin.hint!(done)).toBeNull();

    // total >= 17 in "play" phase should advise "stand".
    const standish: ChineseBjState = { ...state, phase: "play", total: 19 };
    const standHint = chineseBjPlugin.hint!(standish);
    expect(standHint).not.toBeNull();
    expect(standHint!.selector).toBe('[data-testid="hint-target-chinese-bj-stand"]');

    // total < 12 in "play" phase should advise "hit".
    const hittish: ChineseBjState = { ...state, phase: "play", total: 8 };
    const hitHint = chineseBjPlugin.hint!(hittish);
    expect(hitHint).not.toBeNull();
    expect(hitHint!.selector).toBe('[data-testid="hint-target-chinese-bj-hit"]');
  });
});
