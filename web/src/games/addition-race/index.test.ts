import { describe, it, expect } from "vitest";
import { additionRacePlugin } from "./index.js";
import type { AdditionRaceState } from "./state.js";

const S = { dummy: false } as never;

describe("addition-race plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(additionRacePlugin.id).toBe("addition-race");
    expect(additionRacePlugin.title).toBe("Addition Race");
    expect(additionRacePlugin.category).toBe("board");
    expect(additionRacePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof additionRacePlugin.description).toBe("string");
    expect(additionRacePlugin.description.length).toBeGreaterThan(0);
    expect(additionRacePlugin.settings).toBeDefined();
    expect(typeof additionRacePlugin.settings).toBe("object");
    expect(typeof additionRacePlugin.initialState).toBe("function");
    expect(typeof additionRacePlugin.reducer).toBe("function");
    expect(typeof additionRacePlugin.isTerminal).toBe("function");
    expect(additionRacePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh deal", () => {
    const a = additionRacePlugin.initialState(42, S);
    const b = additionRacePlugin.initialState(42, S);
    const aSig = a.questions
      .map((q) => `${q.a}+${q.b}=${q.correct}:${q.choices.join(",")}`)
      .join(";");
    const bSig = b.questions
      .map((q) => `${q.a}+${q.b}=${q.correct}:${q.choices.join(",")}`)
      .join(";");
    expect(aSig).toBe(bSig);
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.questions.length).toBe(20);
    expect(a.timeLeft).toBe(60);
    expect(additionRacePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when phase is done", () => {
    expect(typeof additionRacePlugin.hint).toBe("function");
    const state = additionRacePlugin.initialState(7, S);
    const result = additionRacePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe(".mr-choice");
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const finished: AdditionRaceState = { ...state, phase: "done" };
    expect(additionRacePlugin.hint!(finished)).toBeNull();
    expect(additionRacePlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
