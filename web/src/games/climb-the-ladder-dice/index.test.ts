import { describe, it, expect } from "vitest";
import { climbTheLadderDicePlugin } from "./index.js";
import type { ClimbTheLadderSettings, ClimbTheLadderState } from "./state.js";

const S: ClimbTheLadderSettings = { rerolls: "1" };

describe("climbTheLadderDicePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(climbTheLadderDicePlugin.id).toBe("climb-the-ladder-dice");
    expect(climbTheLadderDicePlugin.title).toBe("Climb the Ladder Dice");
    expect(climbTheLadderDicePlugin.category).toBe("dice");
    expect(climbTheLadderDicePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof climbTheLadderDicePlugin.description).toBe("string");
    expect(climbTheLadderDicePlugin.description.length).toBeGreaterThan(0);
    expect(typeof climbTheLadderDicePlugin.howToPlay).toBe("string");
    expect(climbTheLadderDicePlugin.settings).toBeDefined();
    expect(climbTheLadderDicePlugin.settings.rerolls.kind).toBe("enum");
    expect(climbTheLadderDicePlugin.settings.rerolls.default).toBe("1");
    expect(climbTheLadderDicePlugin.settings.rerolls.options).toEqual(["0", "1", "2"]);
    expect(typeof climbTheLadderDicePlugin.initialState).toBe("function");
    expect(typeof climbTheLadderDicePlugin.reducer).toBe("function");
    expect(typeof climbTheLadderDicePlugin.isTerminal).toBe("function");
    expect(typeof climbTheLadderDicePlugin.hint).toBe("function");
    expect(climbTheLadderDicePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = climbTheLadderDicePlugin.initialState(42, S);
    const b = climbTheLadderDicePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rung).toBe(0);
    expect(a.dice).toHaveLength(2);
    expect(a.dice[0]).toBeGreaterThanOrEqual(1);
    expect(a.dice[0]).toBeLessThanOrEqual(6);
    expect(a.dice[1]).toBeGreaterThanOrEqual(1);
    expect(a.dice[1]).toBeLessThanOrEqual(6);
    expect(a.rerollsLeft).toBe(1);
    expect(a.maxRerolls).toBe(1);
    expect(a.held).toEqual([false, false]);
    expect(a.rolledOnce).toBe(true);
    expect(a.score).toBe(0);
    expect(a.rungScores).toEqual([null, null, null, null, null, null]);
    expect(a.phase).toBe("rolling");
    expect(climbTheLadderDicePlugin.isTerminal(a)).toBeNull();

    // A different seed should produce a different state in general (still valid dice).
    const c = climbTheLadderDicePlugin.initialState(99, S);
    expect(c.phase).toBe("rolling");
    expect(climbTheLadderDicePlugin.isTerminal(c)).toBeNull();
  });

  it("hint returns the accept HintTarget while rolling and null once terminal", () => {
    const fresh = climbTheLadderDicePlugin.initialState(7, S);
    const rolling = climbTheLadderDicePlugin.hint!(fresh);
    expect(rolling).not.toBeNull();
    expect(rolling!.selector).toBe('[data-testid="hint-target-climb-the-ladder-dice-accept"]');
    expect(rolling!.pulses).toBe(3);

    const finished: ClimbTheLadderState = { ...fresh, phase: "gameover" };
    expect(climbTheLadderDicePlugin.isTerminal(finished)).toEqual({ score: finished.score });
    expect(climbTheLadderDicePlugin.hint!(finished)).toBeNull();
  });
});
