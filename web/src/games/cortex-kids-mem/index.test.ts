import { describe, it, expect } from "vitest";
import { cortexKidsMemPlugin } from "./index.js";
import type { cortexKidsMemSettings, cortexKidsMemState } from "./state.js";
import { TOTAL_ROUNDS } from "./state.js";

const S: cortexKidsMemSettings = { dummy: false };

describe("cortexKidsMemPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cortexKidsMemPlugin.id).toBe("cortex-kids-mem");
    expect(cortexKidsMemPlugin.title).toBe("Cortex Challenge: Kids");
    expect(cortexKidsMemPlugin.category).toBe("board");
    expect(cortexKidsMemPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cortexKidsMemPlugin.description).toBe("string");
    expect(cortexKidsMemPlugin.description.length).toBeGreaterThan(0);
    expect(cortexKidsMemPlugin.settings).toBeDefined();
    expect(cortexKidsMemPlugin.settings.dummy.kind).toBe("boolean");
    expect(cortexKidsMemPlugin.settings.dummy.default).toBe(false);
    expect(typeof cortexKidsMemPlugin.initialState).toBe("function");
    expect(typeof cortexKidsMemPlugin.reducer).toBe("function");
    expect(typeof cortexKidsMemPlugin.isTerminal).toBe("function");
    expect(typeof cortexKidsMemPlugin.hint).toBe("function");
    expect(cortexKidsMemPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cortexKidsMemPlugin.initialState(42, S);
    const b = cortexKidsMemPlugin.initialState(42, S);
    const c = cortexKidsMemPlugin.initialState(43, S);
    expect(a.rounds.length).toBe(TOTAL_ROUNDS);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    // same seed -> same first round question/choices/correct
    expect(b.rounds[0]!.question).toBe(a.rounds[0]!.question);
    expect(b.rounds[0]!.choices).toEqual(a.rounds[0]!.choices);
    expect(b.rounds[0]!.correct).toBe(a.rounds[0]!.correct);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.rounds.every((r, i) => r.question === c.rounds[i]!.question && r.correct === c.rounds[i]!.correct);
    expect(sameOrder).toBe(false);
    expect(cortexKidsMemPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done and null when phase is done", () => {
    const playing = cortexKidsMemPlugin.initialState(7, S);
    const target = cortexKidsMemPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe(".gmem-btn.submit, .gmem-btn.next");
    expect(target!.pulses).toBe(3);

    const done: cortexKidsMemState = { ...playing, phase: "done" };
    expect(cortexKidsMemPlugin.hint!(done)).toBeNull();
    expect(cortexKidsMemPlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
