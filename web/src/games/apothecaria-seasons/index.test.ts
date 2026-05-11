import { describe, it, expect } from "vitest";
import { apothecariaSeasonsPlugin } from "./index.js";
import type { ApothecariaSeasonsSettings, ApothecariaSeasonsState } from "./state.js";

const S: ApothecariaSeasonsSettings = { difficulty: "Standard" };

describe("apothecariaSeasonsPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(apothecariaSeasonsPlugin.id).toBe("apothecaria-seasons");
    expect(apothecariaSeasonsPlugin.title).toBe("Apothecaria: Seasons");
    expect(apothecariaSeasonsPlugin.category).toBe("board");
    expect(apothecariaSeasonsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof apothecariaSeasonsPlugin.description).toBe("string");
    expect(apothecariaSeasonsPlugin.description.length).toBeGreaterThan(0);
    expect(apothecariaSeasonsPlugin.settings).toBeDefined();
    expect(apothecariaSeasonsPlugin.settings.difficulty.kind).toBe("enum");
    expect(apothecariaSeasonsPlugin.settings.difficulty.default).toBe("Standard");
    expect(apothecariaSeasonsPlugin.settings.difficulty.options).toEqual(["Easy", "Standard", "Hard"]);
    expect(typeof apothecariaSeasonsPlugin.initialState).toBe("function");
    expect(typeof apothecariaSeasonsPlugin.reducer).toBe("function");
    expect(typeof apothecariaSeasonsPlugin.isTerminal).toBe("function");
    expect(typeof apothecariaSeasonsPlugin.hint).toBe("function");
    expect(apothecariaSeasonsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = apothecariaSeasonsPlugin.initialState(42, S);
    const b = apothecariaSeasonsPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.progress).toBe(0);
    expect(a.threat).toBe(0);
    expect(a.morale).toBe(4);
    expect(a.phase).toBe("choose");
    expect(a.lastTactic).toBeNull();
    expect(a.difficulty).toBe(1.0);
    expect(apothecariaSeasonsPlugin.isTerminal(a)).toBeNull();

    const easy = apothecariaSeasonsPlugin.initialState(42, { difficulty: "Easy" });
    expect(easy.difficulty).toBe(0.8);
    const hard = apothecariaSeasonsPlugin.initialState(42, { difficulty: "Hard" });
    expect(hard.difficulty).toBe(1.3);
  });

  it("hint returns a HintTarget in choose phase and null in done phase", () => {
    const playing = apothecariaSeasonsPlugin.initialState(7, S);
    const target = apothecariaSeasonsPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.pulses).toBe(3);
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector).toMatch(/^\[data-testid="hint-target-coop-tactic-(forage|brew|deliver|rest)"\]$/);

    const done: ApothecariaSeasonsState = { ...playing, phase: "done" };
    expect(apothecariaSeasonsPlugin.hint!(done)).toBeNull();
  });
});
