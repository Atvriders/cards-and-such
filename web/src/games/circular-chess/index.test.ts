import { describe, it, expect } from "vitest";
import { circularChessPlugin } from "./index.js";

const S = { questions: "10" as const };

describe("circular-chess plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(circularChessPlugin.id).toBe("circular-chess");
    expect(circularChessPlugin.title).toBe("Circular Chess");
    expect(circularChessPlugin.category).toBe("board");
    expect(circularChessPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof circularChessPlugin.description).toBe("string");
    expect(circularChessPlugin.description.length).toBeGreaterThan(0);
    expect(typeof circularChessPlugin.howToPlay).toBe("string");
    expect(circularChessPlugin.settings).toBeDefined();
    expect(typeof circularChessPlugin.initialState).toBe("function");
    expect(typeof circularChessPlugin.reducer).toBe("function");
    expect(typeof circularChessPlugin.isTerminal).toBe("function");
    expect(typeof circularChessPlugin.hint).toBe("function");
    expect(circularChessPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = circularChessPlugin.initialState(123, S);
    const b = circularChessPlugin.initialState(123, S);
    const aIds = a.questions.map((q) => `${q.question}:${q.correct}:${q.choices.join("|")}`).join(";");
    const bIds = b.questions.map((q) => `${q.question}:${q.correct}:${q.choices.join("|")}`).join(";");
    expect(aIds).toBe(bIds);
    expect(a.questions.length).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.timeLeft).toBe(15);
    expect(circularChessPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    const state = circularChessPlugin.initialState(7, S);
    const playingHint = circularChessPlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-circular-chess-answer-0"]');
    expect(playingHint!.pulses).toBe(3);

    const doneState = { ...state, phase: "done" as const };
    expect(circularChessPlugin.hint!(doneState)).toBeNull();
    expect(circularChessPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
