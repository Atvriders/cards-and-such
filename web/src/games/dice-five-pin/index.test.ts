import { describe, it, expect } from "vitest";
import { diceFivePinPlugin } from "./index.js";
import type { DiceFivePinState } from "./state.js";

const S = { dummy: true } as never;

describe("dice-five-pin plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceFivePinPlugin.id).toBe("dice-five-pin");
    expect(diceFivePinPlugin.title).toBe("Dice Five-Pin Bowling");
    expect(diceFivePinPlugin.category).toBe("dice");
    expect(diceFivePinPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceFivePinPlugin.description).toBe("string");
    expect(diceFivePinPlugin.description.length).toBeGreaterThan(0);
    expect(diceFivePinPlugin.settings).toBeDefined();
    expect(typeof diceFivePinPlugin.settings).toBe("object");
    expect(typeof diceFivePinPlugin.initialState).toBe("function");
    expect(typeof diceFivePinPlugin.reducer).toBe("function");
    expect(typeof diceFivePinPlugin.isTerminal).toBe("function");
    expect(diceFivePinPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceFivePinPlugin.initialState(42, S);
    const b = diceFivePinPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("rolling");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.dice).toBeNull();
    expect(diceFivePinPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for in-progress phases and null when terminal", () => {
    expect(typeof diceFivePinPlugin.hint).toBe("function");

    const rolling = diceFivePinPlugin.initialState(7, S);
    const rollHint = diceFivePinPlugin.hint!(rolling);
    expect(rollHint).not.toBeNull();
    expect(rollHint!.selector).toBe('[data-testid="hint-target-dice-five-pin-roll"]');
    expect(rollHint!.pulses).toBe(3);

    const afterRoll = diceFivePinPlugin.reducer(rolling, { type: "roll" });
    if (afterRoll.phase === "rolled") {
      const nextHint = diceFivePinPlugin.hint!(afterRoll);
      expect(nextHint).not.toBeNull();
      expect(nextHint!.selector).toBe('[data-testid="hint-target-dice-five-pin-next"]');
      expect(nextHint!.pulses).toBe(3);
    }

    const terminalState: DiceFivePinState = { ...rolling, phase: "done" };
    expect(diceFivePinPlugin.isTerminal(terminalState)).not.toBeNull();
    expect(diceFivePinPlugin.hint!(terminalState)).toBeNull();
  });
});
