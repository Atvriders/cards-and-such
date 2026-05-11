import { describe, it, expect } from "vitest";
import { cinematrixYrPlugin } from "./index.js";
import { TOTAL_ROUNDS } from "./state.js";
import type { CinematrixYrSettings } from "./state.js";

const S: CinematrixYrSettings = { dummy: false };

describe("cinematrixYrPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cinematrixYrPlugin.id).toBe("cinematrix-yr");
    expect(cinematrixYrPlugin.title).toBe("Cinematrix Year");
    expect(cinematrixYrPlugin.category).toBe("board");
    expect(cinematrixYrPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cinematrixYrPlugin.description).toBe("string");
    expect(cinematrixYrPlugin.description.length).toBeGreaterThan(0);
    expect(cinematrixYrPlugin.settings).toBeDefined();
    expect(cinematrixYrPlugin.settings.dummy.kind).toBe("boolean");
    expect(cinematrixYrPlugin.settings.dummy.default).toBe(false);
    expect(typeof cinematrixYrPlugin.initialState).toBe("function");
    expect(typeof cinematrixYrPlugin.reducer).toBe("function");
    expect(typeof cinematrixYrPlugin.isTerminal).toBe("function");
    expect(typeof cinematrixYrPlugin.hint).toBe("function");
    expect(cinematrixYrPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cinematrixYrPlugin.initialState(42, S);
    const b = cinematrixYrPlugin.initialState(42, S);
    const c = cinematrixYrPlugin.initialState(43, S);
    expect(a.rounds.length).toBe(TOTAL_ROUNDS);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    // Same seed -> same first question text and same choices
    expect(b.rounds[0]!.question).toBe(a.rounds[0]!.question);
    expect(b.rounds[0]!.choices).toEqual(a.rounds[0]!.choices);
    expect(b.rounds[0]!.correct).toBe(a.rounds[0]!.correct);
    // Different seed should (very likely) produce a different ordering
    const sameOrder = a.rounds.every((q, i) => q.question === c.rounds[i]!.question);
    expect(sameOrder).toBe(false);
    expect(cinematrixYrPlugin.isTerminal(a)).toBeNull();
    // correct index is within [0,3] for all rounds
    for (const r of a.rounds) {
      expect(r.correct).toBeGreaterThanOrEqual(0);
      expect(r.correct).toBeLessThanOrEqual(3);
      expect(r.choices.length).toBe(4);
    }
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = cinematrixYrPlugin.initialState(7, S);
    const target = cinematrixYrPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-cinematrix-yr-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(cinematrixYrPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(cinematrixYrPlugin.hint!(result)).toBeNull();
  });
});
