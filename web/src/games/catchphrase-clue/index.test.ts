import { describe, it, expect } from "vitest";
import { catchphraseCluePlugin } from "./index.js";
import type { CatchphraseClueState } from "./state.js";

const S = { rounds: "8" } as const;

describe("catchphrase-clue plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(catchphraseCluePlugin.id).toBe("catchphrase-clue");
    expect(catchphraseCluePlugin.title).toBe("Catchphrase Clue");
    expect(catchphraseCluePlugin.category).toBe("board");
    expect(catchphraseCluePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof catchphraseCluePlugin.description).toBe("string");
    expect(catchphraseCluePlugin.description.length).toBeGreaterThan(0);
    expect(catchphraseCluePlugin.settings).toBeDefined();
    expect(typeof catchphraseCluePlugin.settings).toBe("object");
    expect(typeof catchphraseCluePlugin.initialState).toBe("function");
    expect(typeof catchphraseCluePlugin.reducer).toBe("function");
    expect(typeof catchphraseCluePlugin.isTerminal).toBe("function");
    expect(catchphraseCluePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = catchphraseCluePlugin.initialState(42, S);
    const b = catchphraseCluePlugin.initialState(42, S);
    const aKey = a.rounds.map((r) => `${r.prompt}|${r.choices.join(",")}|${r.correct}`).join(";");
    const bKey = b.rounds.map((r) => `${r.prompt}|${r.choices.join(",")}|${r.correct}`).join(";");
    expect(aKey).toBe(bKey);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.rounds.length).toBeGreaterThan(0);
    expect(catchphraseCluePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null after the game is done", () => {
    expect(typeof catchphraseCluePlugin.hint).toBe("function");
    const state = catchphraseCluePlugin.initialState(5, S);
    const result = catchphraseCluePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toMatch(/hint-target-catchphrase-clue-answer-/);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const finished: CatchphraseClueState = { ...state, phase: "done" };
    expect(catchphraseCluePlugin.hint!(finished)).toBeNull();
    expect(catchphraseCluePlugin.isTerminal(finished)).toEqual({ score: finished.score });
  });
});
