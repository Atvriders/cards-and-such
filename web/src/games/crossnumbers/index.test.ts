import { describe, it, expect } from "vitest";
import { crossnumbersPlugin } from "./index.js";
import type { GameSettings } from "./state.js";

const S: GameSettings = { rounds: "8" };

describe("crossnumbersPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(crossnumbersPlugin.id).toBe("crossnumbers");
    expect(crossnumbersPlugin.title).toBe("Crossnumbers");
    expect(crossnumbersPlugin.category).toBe("board");
    expect(crossnumbersPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crossnumbersPlugin.description).toBe("string");
    expect(crossnumbersPlugin.description.length).toBeGreaterThan(0);
    expect(crossnumbersPlugin.settings).toBeDefined();
    expect(crossnumbersPlugin.settings.rounds.kind).toBe("enum");
    expect(crossnumbersPlugin.settings.rounds.default).toBe("8");
    expect(crossnumbersPlugin.settings.rounds.options).toEqual(["5", "8", "10"]);
    expect(typeof crossnumbersPlugin.initialState).toBe("function");
    expect(typeof crossnumbersPlugin.reducer).toBe("function");
    expect(typeof crossnumbersPlugin.isTerminal).toBe("function");
    expect(typeof crossnumbersPlugin.hint).toBe("function");
    expect(crossnumbersPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = crossnumbersPlugin.initialState(42, S);
    const b = crossnumbersPlugin.initialState(42, S);
    const c = crossnumbersPlugin.initialState(43, S);
    expect(a.rounds.length).toBe(8);
    expect(a.phase).toBe("playing");
    expect(a.currentIndex).toBe(0);
    expect(a.score).toBe(0);
    expect(a.correctCount).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    // same seed -> same first prompt
    expect(b.rounds[0]!.prompt).toBe(a.rounds[0]!.prompt);
    expect(b.rounds.map(r => r.prompt)).toEqual(a.rounds.map(r => r.prompt));
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.rounds.every((r, i) => r.prompt === c.rounds[i]!.prompt);
    expect(sameOrder).toBe(false);
    expect(crossnumbersPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = crossnumbersPlugin.initialState(7, S);
    const target = crossnumbersPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-crossnumbers-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(crossnumbersPlugin.hint!(done)).toBeNull();

    const result = { ...playing, phase: "result" as const };
    expect(crossnumbersPlugin.hint!(result)).toBeNull();
  });
});
