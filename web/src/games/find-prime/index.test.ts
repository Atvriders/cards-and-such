import { describe, it, expect } from "vitest";
import { findPrimePlugin } from "./index.js";

const S = { dummy: false };

describe("find-prime plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(findPrimePlugin.id).toBe("find-prime");
    expect(findPrimePlugin.title).toBe("Find the Prime");
    expect(findPrimePlugin.category).toBe("board");
    expect(findPrimePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof findPrimePlugin.description).toBe("string");
    expect(findPrimePlugin.description.length).toBeGreaterThan(0);
    expect(typeof findPrimePlugin.howToPlay).toBe("string");
    expect(findPrimePlugin.settings).toBeDefined();
    expect(typeof findPrimePlugin.initialState).toBe("function");
    expect(typeof findPrimePlugin.reducer).toBe("function");
    expect(typeof findPrimePlugin.isTerminal).toBe("function");
    expect(typeof findPrimePlugin.hint).toBe("function");
    expect(findPrimePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while playing", () => {
    const a = findPrimePlugin.initialState(123, S);
    const b = findPrimePlugin.initialState(123, S);
    const aIds = a.rounds.map((r) => `${r.numbers.join(",")}:${r.correct}`).join(";");
    const bIds = b.rounds.map((r) => `${r.numbers.join(",")}:${r.correct}`).join(";");
    expect(aIds).toBe(bIds);
    expect(a.rounds.length).toBe(20);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(findPrimePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    const state = findPrimePlugin.initialState(7, S);
    const playingHint = findPrimePlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(playingHint!.selector).toBe('[data-testid="hint-target-find-prime-answer-0"]');
    expect(playingHint!.pulses).toBe(3);

    const doneState = { ...state, phase: "done" as const };
    expect(findPrimePlugin.hint!(doneState)).toBeNull();
    expect(findPrimePlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
