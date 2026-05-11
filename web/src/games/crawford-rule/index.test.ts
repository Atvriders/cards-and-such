import { describe, it, expect } from "vitest";
import { crawfordRulePlugin } from "./index.js";
import type { RaceState } from "./state.js";

const S = { dummy: false } as never;

describe("crawford-rule plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(crawfordRulePlugin.id).toBe("crawford-rule");
    expect(crawfordRulePlugin.title).toBe("Crawford Rule Backgammon");
    expect(crawfordRulePlugin.category).toBe("board");
    expect(crawfordRulePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crawfordRulePlugin.description).toBe("string");
    expect(crawfordRulePlugin.description.length).toBeGreaterThan(0);
    expect(crawfordRulePlugin.settings).toBeDefined();
    expect(typeof crawfordRulePlugin.settings).toBe("object");
    expect(typeof crawfordRulePlugin.initialState).toBe("function");
    expect(typeof crawfordRulePlugin.reducer).toBe("function");
    expect(typeof crawfordRulePlugin.isTerminal).toBe("function");
    expect(crawfordRulePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = crawfordRulePlugin.initialState(42, S);
    const b = crawfordRulePlugin.initialState(42, S);
    expect(a.pPositions).toEqual(b.pPositions);
    expect(a.cPositions).toEqual(b.cPositions);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.winner).toBe(b.winner);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.pPositions).toHaveLength(15);
    expect(a.cPositions).toHaveLength(15);
    expect(a.phase).toBe("rolling");
    expect(a.winner).toBeNull();
    expect(crawfordRulePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling and null otherwise", () => {
    expect(typeof crawfordRulePlugin.hint).toBe("function");
    const state = crawfordRulePlugin.initialState(7, S);
    const result = crawfordRulePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-crawford-rule-primary"]');
    expect(result!.pulses).toBe(3);

    const moving: RaceState = { ...state, phase: "moving" };
    expect(crawfordRulePlugin.hint!(moving)).toBeNull();

    const done: RaceState = { ...state, phase: "done", winner: "P", score: 100 };
    expect(crawfordRulePlugin.hint!(done)).toBeNull();
    expect(crawfordRulePlugin.isTerminal(done)).toEqual({ score: 100 });
  });
});
