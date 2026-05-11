import { describe, it, expect } from "vitest";
import { contextoCluePlugin } from "./index.js";
import type { ContextoClueSettings } from "./state.js";

const S: ContextoClueSettings = { rounds: "8" };

describe("contextoCluePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(contextoCluePlugin.id).toBe("contexto-clue");
    expect(contextoCluePlugin.title).toBe("Contexto Clue");
    expect(contextoCluePlugin.category).toBe("board");
    expect(contextoCluePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof contextoCluePlugin.description).toBe("string");
    expect(contextoCluePlugin.description.length).toBeGreaterThan(0);
    expect(contextoCluePlugin.settings).toBeDefined();
    expect(contextoCluePlugin.settings.rounds.kind).toBe("enum");
    expect(contextoCluePlugin.settings.rounds.default).toBe("8");
    expect(contextoCluePlugin.settings.rounds.options).toEqual(["5", "8", "10"]);
    expect(typeof contextoCluePlugin.initialState).toBe("function");
    expect(typeof contextoCluePlugin.reducer).toBe("function");
    expect(typeof contextoCluePlugin.isTerminal).toBe("function");
    expect(typeof contextoCluePlugin.hint).toBe("function");
    expect(contextoCluePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = contextoCluePlugin.initialState(42, S);
    const b = contextoCluePlugin.initialState(42, S);
    const c = contextoCluePlugin.initialState(43, S);
    expect(a.rounds.length).toBe(8);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same first round prompt and same first choice
    expect(b.rounds[0]!.prompt).toBe(a.rounds[0]!.prompt);
    expect(b.rounds[0]!.choices[0]).toBe(a.rounds[0]!.choices[0]);
    // different seed should (very likely) produce a different ordering of prompts
    const samePromptOrder = a.rounds.every((r, i) => r.prompt === c.rounds[i]!.prompt);
    expect(samePromptOrder).toBe(false);
    expect(contextoCluePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = contextoCluePlugin.initialState(7, S);
    const target = contextoCluePlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-contexto-clue-answer-0"]');
    expect(target!.pulses).toBe(3);

    // Force phase out of "playing" — hint should return null.
    const done = { ...playing, phase: "done" as const };
    expect(contextoCluePlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(contextoCluePlugin.hint!(result)).toBeNull();
  });
});
