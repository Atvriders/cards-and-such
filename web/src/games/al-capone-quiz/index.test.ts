import { describe, it, expect } from "vitest";
import { alCaponeQuizPlugin } from "./index.js";

describe("alCaponeQuizPlugin", () => {
  it("exposes correct plugin shape", () => {
    expect(alCaponeQuizPlugin.id).toBe("al-capone-quiz");
    expect(alCaponeQuizPlugin.title).toBe("Al Capone Quiz");
    expect(alCaponeQuizPlugin.category).toBe("board");
    expect(alCaponeQuizPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof alCaponeQuizPlugin.initialState).toBe("function");
    expect(typeof alCaponeQuizPlugin.reducer).toBe("function");
    expect(typeof alCaponeQuizPlugin.isTerminal).toBe("function");
    expect(typeof alCaponeQuizPlugin.hint).toBe("function");
    expect(alCaponeQuizPlugin.settings.questions.default).toBe("10");
  });

  it("initialState is deterministic for same seed and isTerminal returns null at start", () => {
    const s = { questions: "10" as const };
    const a = alCaponeQuizPlugin.initialState(42, s);
    const b = alCaponeQuizPlugin.initialState(42, s);
    expect(a).toEqual(b);
    expect(a.phase).toBe("playing");
    expect(a.questions.length).toBeGreaterThan(0);
    expect(alCaponeQuizPlugin.isTerminal!(a)).toBeNull();
  });

  it("hint returns HintTarget while playing and null when done", () => {
    const s = { questions: "10" as const };
    const playing = alCaponeQuizPlugin.initialState(7, s);
    const target = alCaponeQuizPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-quiz-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(alCaponeQuizPlugin.hint!(done)).toBeNull();
  });
});
