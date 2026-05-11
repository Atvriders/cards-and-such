import { describe, it, expect } from "vitest";
import { architectsRollAnnexPlugin } from "./index.js";
import type { ArchitectsRollAnnexSettings } from "./state.js";
import { CELL_COUNT } from "./state.js";

const S: ArchitectsRollAnnexSettings = { dummy: false };

describe("architectsRollAnnexPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(architectsRollAnnexPlugin.id).toBe("architects-roll-annex");
    expect(architectsRollAnnexPlugin.title).toBe("Architects: Roll Annex");
    expect(architectsRollAnnexPlugin.category).toBe("board");
    expect(architectsRollAnnexPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof architectsRollAnnexPlugin.description).toBe("string");
    expect(architectsRollAnnexPlugin.description.length).toBeGreaterThan(0);
    expect(architectsRollAnnexPlugin.settings).toBeDefined();
    expect(architectsRollAnnexPlugin.settings.dummy.kind).toBe("boolean");
    expect(architectsRollAnnexPlugin.settings.dummy.default).toBe(false);
    expect(typeof architectsRollAnnexPlugin.initialState).toBe("function");
    expect(typeof architectsRollAnnexPlugin.reducer).toBe("function");
    expect(typeof architectsRollAnnexPlugin.isTerminal).toBe("function");
    expect(typeof architectsRollAnnexPlugin.hint).toBe("function");
    expect(architectsRollAnnexPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = architectsRollAnnexPlugin.initialState(42, S);
    const b = architectsRollAnnexPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.cells.length).toBe(CELL_COUNT);
    expect(a.cells.every((v) => v === false)).toBe(true);
    expect(a.cellValues.length).toBe(CELL_COUNT);
    expect(a.cellValues.every((v) => v === 0)).toBe(true);
    expect(a.rolls).toBe(0);
    expect(a.lastRoll).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(architectsRollAnnexPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while not done, and null in done phase", () => {
    const rolling = architectsRollAnnexPlugin.initialState(7, S);
    const rollingTarget = architectsRollAnnexPlugin.hint!(rolling);
    expect(rollingTarget).not.toBeNull();
    expect(rollingTarget!.selector).toBe('[data-testid="hint-target-architects-roll-annex-roll"]');
    expect(rollingTarget!.pulses).toBe(3);

    const marking = { ...rolling, phase: "marking" as const, lastRoll: 4 };
    const markingTarget = architectsRollAnnexPlugin.hint!(marking);
    expect(markingTarget).not.toBeNull();
    expect(markingTarget!.selector).toBe('[data-testid="hint-target-architects-roll-annex-skip"]');
    expect(markingTarget!.pulses).toBe(3);

    const done = { ...rolling, phase: "done" as const };
    expect(architectsRollAnnexPlugin.hint!(done)).toBeNull();
  });
});
