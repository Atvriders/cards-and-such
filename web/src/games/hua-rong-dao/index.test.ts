import { describe, it, expect } from "vitest";
import { huaRongDaoPlugin } from "./index.js";
import type { HuaRongDaoState } from "./state.js";

const S = { puzzles: "8" } as const;

describe("hua-rong-dao plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(huaRongDaoPlugin.id).toBe("hua-rong-dao");
    expect(huaRongDaoPlugin.title).toBe("Hua Rong Dao");
    expect(huaRongDaoPlugin.category).toBe("board");
    expect(huaRongDaoPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof huaRongDaoPlugin.description).toBe("string");
    expect(huaRongDaoPlugin.description.length).toBeGreaterThan(0);
    expect(huaRongDaoPlugin.settings).toBeDefined();
    expect(typeof huaRongDaoPlugin.settings).toBe("object");
    expect(typeof huaRongDaoPlugin.initialState).toBe("function");
    expect(typeof huaRongDaoPlugin.reducer).toBe("function");
    expect(typeof huaRongDaoPlugin.isTerminal).toBe("function");
    expect(huaRongDaoPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = huaRongDaoPlugin.initialState(42, S);
    const b = huaRongDaoPlugin.initialState(42, S);
    const aKey = a.puzzles.map((p) => p.scenario).join("||");
    const bKey = b.puzzles.map((p) => p.scenario).join("||");
    expect(aKey).toBe(bKey);
    expect(a.puzzles.length).toBeGreaterThan(0);
    expect(a.puzzles.length).toBeLessThanOrEqual(8);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.resolved).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(huaRongDaoPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with selector while playing and null otherwise", () => {
    expect(typeof huaRongDaoPlugin.hint).toBe("function");
    const state = huaRongDaoPlugin.initialState(7, S);
    const result = huaRongDaoPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-hua-rong-dao-answer-0"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const doneState: HuaRongDaoState = { ...state, phase: "done" };
    expect(huaRongDaoPlugin.hint!(doneState)).toBeNull();
    expect(huaRongDaoPlugin.isTerminal(doneState)).toEqual({ score: state.score });
  });
});
