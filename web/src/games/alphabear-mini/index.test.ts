import { describe, it, expect } from "vitest";
import { alphabearMiniPlugin } from "./index.js";
import type { AlphabearMiniSettings } from "./state.js";

const S: AlphabearMiniSettings = { rounds: "8" };

describe("alphabearMiniPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(alphabearMiniPlugin.id).toBe("alphabear-mini");
    expect(alphabearMiniPlugin.title).toBe("Alphabear Mini");
    expect(alphabearMiniPlugin.category).toBe("board");
    expect(alphabearMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof alphabearMiniPlugin.description).toBe("string");
    expect(alphabearMiniPlugin.description.length).toBeGreaterThan(0);
    expect(alphabearMiniPlugin.settings).toBeDefined();
    expect(alphabearMiniPlugin.settings.rounds.kind).toBe("enum");
    expect(alphabearMiniPlugin.settings.rounds.default).toBe("8");
    expect(alphabearMiniPlugin.settings.rounds.options).toEqual(["5", "8", "10"]);
    expect(typeof alphabearMiniPlugin.initialState).toBe("function");
    expect(typeof alphabearMiniPlugin.reducer).toBe("function");
    expect(typeof alphabearMiniPlugin.isTerminal).toBe("function");
    expect(typeof alphabearMiniPlugin.hint).toBe("function");
    expect(alphabearMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = alphabearMiniPlugin.initialState(42, S);
    const b = alphabearMiniPlugin.initialState(42, S);
    const c = alphabearMiniPlugin.initialState(43, S);
    expect(a.rounds.length).toBe(8);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    // same seed -> identical prompt ordering and choices
    expect(b.rounds[0]!.prompt).toBe(a.rounds[0]!.prompt);
    expect(b.rounds[0]!.choices).toEqual(a.rounds[0]!.choices);
    // different seed should (very likely) yield a different ordering of prompts
    const sameOrder = a.rounds.every((r, i) => r.prompt === c.rounds[i]!.prompt);
    expect(sameOrder).toBe(false);
    expect(alphabearMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when done or submitted", () => {
    const playing = alphabearMiniPlugin.initialState(7, S);
    const target = alphabearMiniPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe(".word-choices button:first-child");
    expect(target!.pulses).toBe(3);

    // submitted -> hint suppressed
    const submitted = { ...playing, submitted: true };
    expect(alphabearMiniPlugin.hint!(submitted)).toBeNull();

    // done phase -> hint suppressed
    const done = { ...playing, phase: "done" as const };
    expect(alphabearMiniPlugin.hint!(done)).toBeNull();
  });
});
