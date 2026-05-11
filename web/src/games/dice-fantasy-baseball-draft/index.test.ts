import { describe, it, expect } from "vitest";
import { diceFantasyBaseballDraftPlugin } from "./index.js";
import type { DiceFantasyBaseballDraftState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-fantasy-baseball-draft plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceFantasyBaseballDraftPlugin.id).toBe("dice-fantasy-baseball-draft");
    expect(diceFantasyBaseballDraftPlugin.title).toBe("Fantasy Baseball Draft");
    expect(diceFantasyBaseballDraftPlugin.category).toBe("dice");
    expect(diceFantasyBaseballDraftPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceFantasyBaseballDraftPlugin.description).toBe("string");
    expect(diceFantasyBaseballDraftPlugin.description.length).toBeGreaterThan(0);
    expect(diceFantasyBaseballDraftPlugin.settings).toBeDefined();
    expect(typeof diceFantasyBaseballDraftPlugin.settings).toBe("object");
    expect(typeof diceFantasyBaseballDraftPlugin.initialState).toBe("function");
    expect(typeof diceFantasyBaseballDraftPlugin.reducer).toBe("function");
    expect(typeof diceFantasyBaseballDraftPlugin.isTerminal).toBe("function");
    expect(diceFantasyBaseballDraftPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceFantasyBaseballDraftPlugin.initialState(42, S);
    const b = diceFantasyBaseballDraftPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.history).toEqual([]);
    expect(a.log).toEqual([]);
    expect(a.picks).toEqual([]);
    expect(a.totalRating).toBe(0);
    expect(diceFantasyBaseballDraftPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for each non-terminal phase and null when terminal", () => {
    expect(typeof diceFantasyBaseballDraftPlugin.hint).toBe("function");
    const fresh = diceFantasyBaseballDraftPlugin.initialState(7, S);
    const rollingHint = diceFantasyBaseballDraftPlugin.hint!(fresh);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-fantasy-baseball-draft-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const rolled: DiceFantasyBaseballDraftState = { ...fresh, phase: "rolled" };
    const rolledHint = diceFantasyBaseballDraftPlugin.hint!(rolled);
    expect(rolledHint).not.toBeNull();
    expect(rolledHint!.selector).toBe('[data-testid="hint-target-dice-fantasy-baseball-draft-next"]');
    expect(rolledHint!.pulses).toBe(3);

    const done: DiceFantasyBaseballDraftState = { ...fresh, phase: "done", score: 99 };
    expect(diceFantasyBaseballDraftPlugin.hint!(done)).toBeNull();
    expect(diceFantasyBaseballDraftPlugin.isTerminal(done)).toEqual({ score: 99 });
  });
});
