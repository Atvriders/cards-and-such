import { describe, it, expect } from "vitest";
import { deadAreComingLogPlugin } from "./index.js";
import type { DeadAreComingLogSettings } from "./state.js";

const S: DeadAreComingLogSettings = { dummy: false };

describe("deadAreComingLogPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(deadAreComingLogPlugin.id).toBe("dead-are-coming-log");
    expect(deadAreComingLogPlugin.title).toBe("The Dead Are Coming");
    expect(deadAreComingLogPlugin.category).toBe("board");
    expect(deadAreComingLogPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof deadAreComingLogPlugin.description).toBe("string");
    expect(deadAreComingLogPlugin.description.length).toBeGreaterThan(0);
    expect(deadAreComingLogPlugin.settings).toBeDefined();
    expect(deadAreComingLogPlugin.settings.dummy.kind).toBe("boolean");
    expect(deadAreComingLogPlugin.settings.dummy.default).toBe(false);
    expect(typeof deadAreComingLogPlugin.initialState).toBe("function");
    expect(typeof deadAreComingLogPlugin.reducer).toBe("function");
    expect(typeof deadAreComingLogPlugin.isTerminal).toBe("function");
    expect(typeof deadAreComingLogPlugin.hint).toBe("function");
    expect(deadAreComingLogPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = deadAreComingLogPlugin.initialState(42, S);
    const b = deadAreComingLogPlugin.initialState(42, S);
    const c = deadAreComingLogPlugin.initialState(99, S);
    expect(a.phase).toBe("choose");
    expect(a.index).toBe(0);
    expect(a.selected).toBeNull();
    expect(a.lastPts).toBe(0);
    expect(a.score).toBe(0);
    expect(a.prompts.length).toBe(10);
    expect(a.rngSeed).toBe(42);
    // same seed -> identical state shape
    expect(b.rngSeed).toBe(a.rngSeed);
    expect(b.prompts[0]!.prompt).toBe(a.prompts[0]!.prompt);
    // different seed -> different rngSeed stored
    expect(c.rngSeed).not.toBe(a.rngSeed);
    // not terminal on fresh state
    expect(deadAreComingLogPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while in choose phase and null otherwise", () => {
    const choosing = deadAreComingLogPlugin.initialState(7, S);
    const target = deadAreComingLogPlugin.hint!(choosing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-dead-are-coming-log-primary"]');
    expect(target!.pulses).toBe(3);

    const result = { ...choosing, phase: "result" as const };
    expect(deadAreComingLogPlugin.hint!(result)).toBeNull();

    const done = { ...choosing, phase: "done" as const };
    expect(deadAreComingLogPlugin.hint!(done)).toBeNull();
    expect(deadAreComingLogPlugin.isTerminal(done)).toEqual({ score: 0 });
  });
});
