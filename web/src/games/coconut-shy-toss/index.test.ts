import { describe, it, expect } from "vitest";
import { coconutShyTossPlugin } from "./index.js";
import type { GameState, GameSettings } from "./state.js";

const S: GameSettings = { rounds: "8" };

describe("coconut-shy-toss plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(coconutShyTossPlugin.id).toBe("coconut-shy-toss");
    expect(coconutShyTossPlugin.title).toBe("Coconut Shy Toss");
    expect(coconutShyTossPlugin.category).toBe("board");
    expect(coconutShyTossPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof coconutShyTossPlugin.description).toBe("string");
    expect(coconutShyTossPlugin.description.length).toBeGreaterThan(0);
    expect(coconutShyTossPlugin.settings).toBeDefined();
    expect(typeof coconutShyTossPlugin.settings).toBe("object");
    expect(typeof coconutShyTossPlugin.initialState).toBe("function");
    expect(typeof coconutShyTossPlugin.reducer).toBe("function");
    expect(typeof coconutShyTossPlugin.isTerminal).toBe("function");
    expect(coconutShyTossPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = coconutShyTossPlugin.initialState(42, S);
    const b = coconutShyTossPlugin.initialState(42, S);
    const aSig = a.rounds.map((r) => `${r.prompt}|${r.choices.join(",")}|${r.correct}`).join(";");
    const bSig = b.rounds.map((r) => `${r.prompt}|${r.choices.join(",")}|${r.correct}`).join(";");
    expect(aSig).toBe(bSig);
    expect(a.rounds.length).toBe(8);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(coconutShyTossPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once done", () => {
    expect(typeof coconutShyTossPlugin.hint).toBe("function");
    const state = coconutShyTossPlugin.initialState(7, S);
    const result = coconutShyTossPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-coconut-shy-toss-answer-0"]');
    expect(result!.pulses).toBe(3);

    const finished: GameState = { ...state, phase: "done" };
    expect(coconutShyTossPlugin.hint!(finished)).toBeNull();
    expect(coconutShyTossPlugin.isTerminal(finished)).toEqual({ score: state.score });
  });
});
