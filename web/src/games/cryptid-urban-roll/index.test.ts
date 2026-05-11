import { describe, it, expect } from "vitest";
import { cryptidUrbanRollPlugin } from "./index.js";
import { CryptidUrbanRoll_CFG } from "./state.js";

const S = { dummy: false } as never;

describe("cryptid-urban-roll plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cryptidUrbanRollPlugin.id).toBe("cryptid-urban-roll");
    expect(cryptidUrbanRollPlugin.title).toBe("Cryptid: Urban Roll");
    expect(cryptidUrbanRollPlugin.category).toBe("board");
    expect(cryptidUrbanRollPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cryptidUrbanRollPlugin.description).toBe("string");
    expect(cryptidUrbanRollPlugin.description.length).toBeGreaterThan(0);
    expect(cryptidUrbanRollPlugin.settings).toBeDefined();
    expect(typeof cryptidUrbanRollPlugin.settings).toBe("object");
    expect(typeof cryptidUrbanRollPlugin.initialState).toBe("function");
    expect(typeof cryptidUrbanRollPlugin.reducer).toBe("function");
    expect(typeof cryptidUrbanRollPlugin.isTerminal).toBe("function");
    expect(cryptidUrbanRollPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cryptidUrbanRollPlugin.initialState(42, S);
    const b = cryptidUrbanRollPlugin.initialState(42, S);
    expect(a.answer).toEqual(b.answer);
    expect(a.current).toEqual(b.current);
    expect(a.guesses).toEqual(b.guesses);
    expect(a.phase).toBe(b.phase);
    expect(a.phase).toBe("guess");
    expect(a.answer).toHaveLength(CryptidUrbanRoll_CFG.answerLength);
    expect(a.current).toHaveLength(CryptidUrbanRoll_CFG.answerLength);
    expect(a.guesses).toEqual([]);
    expect(cryptidUrbanRollPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cryptidUrbanRollPlugin.hint).toBe("function");
    const state = cryptidUrbanRollPlugin.initialState(5, S);
    const result = cryptidUrbanRollPlugin.hint!(state);
    // Fresh state has guesses === [] and current === [0,0,0] so engine pulses slot-0.
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force phase to a terminal state to drive hint() through the null branch.
    const ended = { ...state, phase: "won" as const };
    expect(cryptidUrbanRollPlugin.hint!(ended)).toBeNull();
  });
});
