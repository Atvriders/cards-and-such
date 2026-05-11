import { describe, it, expect } from "vitest";
import { closedChinesePokerCasPlugin } from "./index.js";
import type { ClosedChinesePokerCasState } from "./state.js";

const S = { dummy: false } as never;

describe("closed-chinese-poker-cas plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(closedChinesePokerCasPlugin.id).toBe("closed-chinese-poker-cas");
    expect(closedChinesePokerCasPlugin.title).toBe("Closed Chinese Poker (Casino)");
    expect(closedChinesePokerCasPlugin.category).toBe("cards");
    expect(closedChinesePokerCasPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof closedChinesePokerCasPlugin.description).toBe("string");
    expect(closedChinesePokerCasPlugin.description.length).toBeGreaterThan(0);
    expect(closedChinesePokerCasPlugin.settings).toBeDefined();
    expect(typeof closedChinesePokerCasPlugin.settings).toBe("object");
    expect(typeof closedChinesePokerCasPlugin.initialState).toBe("function");
    expect(typeof closedChinesePokerCasPlugin.reducer).toBe("function");
    expect(typeof closedChinesePokerCasPlugin.isTerminal).toBe("function");
    expect(closedChinesePokerCasPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = closedChinesePokerCasPlugin.initialState(42, S);
    const b = closedChinesePokerCasPlugin.initialState(42, S);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("see");
    expect(a.score).toBe(0);
    expect(a.pts).toBe(0);
    expect(a.result).toBe("");
    expect(a.you).toHaveLength(5);
    expect(a.cpu).toHaveLength(5);
    expect(a.you.join(",")).toBe(b.you.join(","));
    expect(a.cpu.join(",")).toBe(b.cpu.join(","));
    expect(a.rngSeed).toBe(b.rngSeed);
    // all dealt cards must be unique and in [0, 52)
    const all = [...a.you, ...a.cpu];
    for (const c of all) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(52);
    }
    expect(new Set(all).size).toBe(all.length);
    expect(closedChinesePokerCasPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when scored and null otherwise", () => {
    expect(typeof closedChinesePokerCasPlugin.hint).toBe("function");

    // Fresh state is "see" phase, so hint should be null.
    const fresh = closedChinesePokerCasPlugin.initialState(7, S);
    expect(closedChinesePokerCasPlugin.hint!(fresh)).toBeNull();

    // Terminal state should yield null.
    const doneState: ClosedChinesePokerCasState = { ...fresh, phase: "done" };
    expect(closedChinesePokerCasPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(closedChinesePokerCasPlugin.hint!(doneState)).toBeNull();

    // A scored state should yield a HintTarget with the expected selector.
    const scored: ClosedChinesePokerCasState = { ...fresh, phase: "scored" };
    const result = closedChinesePokerCasPlugin.hint!(scored);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-closed-chinese-poker-cas-secondary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
