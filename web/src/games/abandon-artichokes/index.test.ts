import { describe, it, expect } from "vitest";
import { abandonArtichokesPlugin } from "./index.js";
import type { AbandonArtichokesState } from "./state.js";

const S = { dummy: false } as never;

describe("abandon-artichokes plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(abandonArtichokesPlugin.id).toBe("abandon-artichokes");
    expect(abandonArtichokesPlugin.title).toBe("Abandon All Artichokes");
    expect(abandonArtichokesPlugin.category).toBe("board");
    expect(abandonArtichokesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof abandonArtichokesPlugin.description).toBe("string");
    expect(abandonArtichokesPlugin.description.length).toBeGreaterThan(0);
    expect(abandonArtichokesPlugin.settings).toBeDefined();
    expect(typeof abandonArtichokesPlugin.settings).toBe("object");
    expect(typeof abandonArtichokesPlugin.initialState).toBe("function");
    expect(typeof abandonArtichokesPlugin.reducer).toBe("function");
    expect(typeof abandonArtichokesPlugin.isTerminal).toBe("function");
    expect(abandonArtichokesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = abandonArtichokesPlugin.initialState(42, S);
    const b = abandonArtichokesPlugin.initialState(42, S);
    const serialize = (st: AbandonArtichokesState) =>
      st.rounds.map((r) => r.choices.join("|") + "#" + r.correct).join(";");
    expect(serialize(a)).toBe(serialize(b));
    expect(a.rounds.length).toBe(15);
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(abandonArtichokesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    expect(typeof abandonArtichokesPlugin.hint).toBe("function");
    const state = abandonArtichokesPlugin.initialState(7, S);
    const playingHint = abandonArtichokesPlugin.hint!(state);
    expect(playingHint).not.toBeNull();
    expect(typeof playingHint!.selector).toBe("string");
    expect(playingHint!.selector.length).toBeGreaterThan(0);
    expect(playingHint!.selector).toBe('[data-testid="hint-target-abandon-artichokes-answer-0"]');
    if (playingHint!.pulses !== undefined) {
      expect(typeof playingHint!.pulses).toBe("number");
      expect(playingHint!.pulses).toBeGreaterThan(0);
    }

    const doneState: AbandonArtichokesState = { ...state, phase: "done" };
    expect(abandonArtichokesPlugin.hint!(doneState)).toBeNull();

    const resultState: AbandonArtichokesState = { ...state, phase: "result" };
    expect(abandonArtichokesPlugin.hint!(resultState)).toBeNull();
  });
});
