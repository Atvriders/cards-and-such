import { describe, it, expect } from "vitest";
import { chronogramPuzzlePlugin } from "./index.js";

describe("chronogramPuzzlePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(chronogramPuzzlePlugin.id).toBe("chronogram-puzzle");
    expect(chronogramPuzzlePlugin.title).toBe("Chronogram Puzzle");
    expect(chronogramPuzzlePlugin.category).toBe("board");
    expect(chronogramPuzzlePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chronogramPuzzlePlugin.description).toBe("string");
    expect(chronogramPuzzlePlugin.description.length).toBeGreaterThan(0);
    expect(chronogramPuzzlePlugin.settings).toBeDefined();
    expect(chronogramPuzzlePlugin.settings.dummy.kind).toBe("boolean");
    expect(chronogramPuzzlePlugin.settings.dummy.default).toBe(false);
    expect(typeof chronogramPuzzlePlugin.initialState).toBe("function");
    expect(typeof chronogramPuzzlePlugin.reducer).toBe("function");
    expect(typeof chronogramPuzzlePlugin.isTerminal).toBe("function");
    expect(typeof chronogramPuzzlePlugin.hint).toBe("function");
    expect(chronogramPuzzlePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const s = { dummy: false };
    const a = chronogramPuzzlePlugin.initialState(42, s);
    const b = chronogramPuzzlePlugin.initialState(42, s);
    const c = chronogramPuzzlePlugin.initialState(43, s);
    expect(a.puzzles.length).toBe(6);
    expect(a.idx).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.submitted).toBe(false);
    expect(a.score).toBe(0);
    expect(a.correct).toBe(0);
    expect(a.phase).toBe("playing");
    // same seed -> same puzzle ordering
    expect(b.puzzles.map((p) => p.prompt)).toEqual(a.puzzles.map((p) => p.prompt));
    // different seed -> very likely different ordering
    const sameOrder = a.puzzles.every((p, i) => p.prompt === c.puzzles[i]!.prompt);
    expect(sameOrder).toBe(false);
    expect(chronogramPuzzlePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when not in playing phase", () => {
    const playing = chronogramPuzzlePlugin.initialState(7, { dummy: false });
    const target = chronogramPuzzlePlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-chronogram-puzzle-answer-0"]');
    expect(target!.pulses).toBe(3);

    const done = { ...playing, phase: "done" as const };
    expect(chronogramPuzzlePlugin.hint!(done)).toBeNull();
    expect(chronogramPuzzlePlugin.isTerminal(done)).toEqual({ score: 0 });

    const result = { ...playing, phase: "result" as const };
    expect(chronogramPuzzlePlugin.hint!(result)).toBeNull();
  });
});
