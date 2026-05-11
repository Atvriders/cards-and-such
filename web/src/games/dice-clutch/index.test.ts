import { describe, it, expect } from "vitest";
import { diceClutchPlugin } from "./index.js";
import { TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false };

describe("dice-clutch plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceClutchPlugin.id).toBe("dice-clutch");
    expect(diceClutchPlugin.title).toBe("Dice Clutch");
    expect(diceClutchPlugin.category).toBe("dice");
    expect(diceClutchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceClutchPlugin.description).toBe("string");
    expect(diceClutchPlugin.description.length).toBeGreaterThan(0);
    expect(diceClutchPlugin.settings).toBeDefined();
    expect(typeof diceClutchPlugin.settings).toBe("object");
    expect(typeof diceClutchPlugin.initialState).toBe("function");
    expect(typeof diceClutchPlugin.reducer).toBe("function");
    expect(typeof diceClutchPlugin.isTerminal).toBe("function");
    expect(diceClutchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceClutchPlugin.initialState(42, S);
    const b = diceClutchPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.phase).toBe("rolling");
    expect(diceClutchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/scored phases and null when terminal", () => {
    expect(typeof diceClutchPlugin.hint).toBe("function");

    // Fresh state is in "rolling" phase -> hint should return roll target.
    const rolling = diceClutchPlugin.initialState(7, S);
    const rollHint = diceClutchPlugin.hint!(rolling);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-clutch-roll"]');
    expect(rollHint!.pulses).toBe(3);

    // After a roll (not the last round) phase becomes "scored" -> hint returns next target.
    const scored = diceClutchPlugin.reducer(rolling, { type: "roll" });
    expect(scored.phase).toBe("scored");
    const scoredHint = diceClutchPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-dice-clutch-next"]');
    expect(scoredHint!.pulses).toBe(3);

    // Play out all rounds to reach the terminal "done" phase -> hint returns null.
    let s = diceClutchPlugin.initialState(7, S);
    for (let i = 0; i < TOTAL_ROUNDS - 1; i++) {
      s = diceClutchPlugin.reducer(s, { type: "roll" });
      s = diceClutchPlugin.reducer(s, { type: "next" });
    }
    s = diceClutchPlugin.reducer(s, { type: "roll" });
    expect(s.phase).toBe("done");
    expect(diceClutchPlugin.isTerminal(s)).toEqual({ score: s.score });
    expect(diceClutchPlugin.hint!(s)).toBeNull();
  });
});
