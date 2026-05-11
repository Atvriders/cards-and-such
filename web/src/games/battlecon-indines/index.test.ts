import { describe, it, expect } from "vitest";
import { battleconIndinesPlugin } from "./index.js";
import type { BattleconIndinesSettings, BattleconIndinesState } from "./state.js";

const S: BattleconIndinesSettings = { difficulty: "Standard" };

describe("battleconIndinesPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(battleconIndinesPlugin.id).toBe("battlecon-indines");
    expect(battleconIndinesPlugin.title).toBe("BattleCON: Indines");
    expect(battleconIndinesPlugin.category).toBe("board");
    expect(battleconIndinesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof battleconIndinesPlugin.description).toBe("string");
    expect(battleconIndinesPlugin.description.length).toBeGreaterThan(0);
    expect(battleconIndinesPlugin.settings).toBeDefined();
    expect(battleconIndinesPlugin.settings.difficulty.kind).toBe("enum");
    expect(battleconIndinesPlugin.settings.difficulty.default).toBe("Standard");
    expect(battleconIndinesPlugin.settings.difficulty.options).toEqual(["Easy", "Standard", "Hard"]);
    expect(typeof battleconIndinesPlugin.initialState).toBe("function");
    expect(typeof battleconIndinesPlugin.reducer).toBe("function");
    expect(typeof battleconIndinesPlugin.isTerminal).toBe("function");
    expect(typeof battleconIndinesPlugin.hint).toBe("function");
    expect(battleconIndinesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = battleconIndinesPlugin.initialState(42, S);
    const b = battleconIndinesPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.progress).toBe(0);
    expect(a.threat).toBe(0);
    expect(a.morale).toBe(4);
    expect(a.phase).toBe("choose");
    expect(a.lastTactic).toBeNull();
    expect(a.difficulty).toBe(1.0);
    expect(battleconIndinesPlugin.isTerminal(a)).toBeNull();

    const easy = battleconIndinesPlugin.initialState(42, { difficulty: "Easy" });
    expect(easy.difficulty).toBe(0.8);
    const hard = battleconIndinesPlugin.initialState(42, { difficulty: "Hard" });
    expect(hard.difficulty).toBe(1.3);
  });

  it("hint returns a HintTarget in choose phase and null in done phase", () => {
    const playing = battleconIndinesPlugin.initialState(7, S);
    const target = battleconIndinesPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.pulses).toBe(3);
    expect(typeof target!.selector).toBe("string");
    expect(target!.selector).toMatch(/^\[data-testid="hint-target-coop-tactic-(attack|dodge|special|block)"\]$/);

    const done: BattleconIndinesState = { ...playing, phase: "done" };
    expect(battleconIndinesPlugin.hint!(done)).toBeNull();
  });
});
