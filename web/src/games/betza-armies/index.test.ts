import { describe, it, expect } from "vitest";
import { betzaArmiesPlugin } from "./index.js";

const S = { questions: "10" } as const;

describe("betza-armies plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(betzaArmiesPlugin.id).toBe("betza-armies");
    expect(betzaArmiesPlugin.title).toBe("Chess with Different Armies (Betza)");
    expect(betzaArmiesPlugin.category).toBe("board");
    expect(betzaArmiesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof betzaArmiesPlugin.description).toBe("string");
    expect(betzaArmiesPlugin.description.length).toBeGreaterThan(0);
    expect(betzaArmiesPlugin.settings).toBeDefined();
    expect(typeof betzaArmiesPlugin.settings).toBe("object");
    expect(typeof betzaArmiesPlugin.initialState).toBe("function");
    expect(typeof betzaArmiesPlugin.reducer).toBe("function");
    expect(typeof betzaArmiesPlugin.isTerminal).toBe("function");
    expect(betzaArmiesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = betzaArmiesPlugin.initialState(42, S);
    const b = betzaArmiesPlugin.initialState(42, S);
    const aSig = a.questions.map((q) => `${q.question}|${q.choices.join(",")}|${q.correct}`).join(";");
    const bSig = b.questions.map((q) => `${q.question}|${q.choices.join(",")}|${q.correct}`).join(";");
    expect(aSig).toBe(bSig);
    expect(a.questions.length).toBe(10);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(betzaArmiesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    expect(typeof betzaArmiesPlugin.hint).toBe("function");
    const state = betzaArmiesPlugin.initialState(5, S);
    const result = betzaArmiesPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-betza-armies-answer-/);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const doneState = { ...state, phase: "done" as const };
    expect(betzaArmiesPlugin.hint!(doneState)).toBeNull();

    const resultState = { ...state, phase: "result" as const };
    expect(betzaArmiesPlugin.hint!(resultState)).toBeNull();
  });
});
