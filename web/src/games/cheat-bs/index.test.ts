import { describe, it, expect } from "vitest";
import { cheatBsPlugin } from "./index.js";
import { CheatBs_CFG } from "./state.js";

const S = {} as never;

describe("cheat-bs plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cheatBsPlugin.id).toBe("cheat-bs");
    expect(cheatBsPlugin.title).toBe("Cheat / BS");
    expect(cheatBsPlugin.category).toBe("board");
    expect(cheatBsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cheatBsPlugin.description).toBe("string");
    expect(cheatBsPlugin.description.length).toBeGreaterThan(0);
    expect(cheatBsPlugin.settings).toBeDefined();
    expect(typeof cheatBsPlugin.settings).toBe("object");
    expect(typeof cheatBsPlugin.initialState).toBe("function");
    expect(typeof cheatBsPlugin.reducer).toBe("function");
    expect(typeof cheatBsPlugin.isTerminal).toBe("function");
    expect(cheatBsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cheatBsPlugin.initialState(42, S);
    const b = cheatBsPlugin.initialState(42, S);
    expect(a.answer).toEqual(b.answer);
    expect(a.current).toEqual(b.current);
    expect(a.guesses).toEqual([]);
    expect(a.phase).toBe("guess");
    expect(a.answer.length).toBe(CheatBs_CFG.answerLength);
    expect(a.current.length).toBe(CheatBs_CFG.answerLength);
    // pool bounds
    for (const v of a.answer) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(CheatBs_CFG.poolSize);
    }
    expect(cheatBsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while in guess phase and null when the round is over", () => {
    expect(typeof cheatBsPlugin.hint).toBe("function");
    const state = cheatBsPlugin.initialState(5, S);
    const result = cheatBsPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
    expect(result!.pulses).toBe(3);

    // Force a non-guess phase to exercise the null branch.
    const won = { ...state, phase: "won" as const };
    expect(cheatBsPlugin.hint!(won)).toBeNull();
  });
});
