import { describe, it, expect } from "vitest";
import { diceRelayPlugin } from "./index.js";
import type { DiceRelayState } from "./state.js";

const S = { dummy: false };

describe("dice-relay plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceRelayPlugin.id).toBe("dice-relay");
    expect(diceRelayPlugin.title).toBe("Dice Relay");
    expect(diceRelayPlugin.category).toBe("dice");
    expect(diceRelayPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceRelayPlugin.description).toBe("string");
    expect(diceRelayPlugin.description.length).toBeGreaterThan(0);
    expect(diceRelayPlugin.settings).toBeDefined();
    expect(typeof diceRelayPlugin.settings).toBe("object");
    expect(typeof diceRelayPlugin.initialState).toBe("function");
    expect(typeof diceRelayPlugin.reducer).toBe("function");
    expect(typeof diceRelayPlugin.isTerminal).toBe("function");
    expect(diceRelayPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null at start", () => {
    const a = diceRelayPlugin.initialState(123, S);
    const b = diceRelayPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.stage).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(a.lastRoll).toBeNull();
    expect(diceRelayPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for rolling/result phases and null when terminal", () => {
    expect(typeof diceRelayPlugin.hint).toBe("function");

    const rolling = diceRelayPlugin.initialState(7, S);
    const rollingHint = diceRelayPlugin.hint!(rolling);
    expect(rollingHint).not.toBeNull();
    expect(rollingHint!.selector).toBe('[data-testid="hint-target-dice-relay-roll"]');
    expect(rollingHint!.pulses).toBe(3);

    const resultState: DiceRelayState = { ...rolling, phase: "result", lastRoll: [3, 4], lastCleared: true };
    const resultHint = diceRelayPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-dice-relay-next"]');
    expect(resultHint!.pulses).toBe(3);

    const doneState: DiceRelayState = { ...rolling, phase: "done" };
    expect(diceRelayPlugin.isTerminal(doneState)).toEqual({ score: 0 });
    expect(diceRelayPlugin.hint!(doneState)).toBeNull();
  });
});
