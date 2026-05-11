import { describe, it, expect } from "vitest";
import { diceBridgePlugin } from "./index.js";

const S = { dummy: false } as never;

describe("dice-bridge plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(diceBridgePlugin.id).toBe("dice-bridge");
    expect(diceBridgePlugin.title).toBe("Dice Bridge");
    expect(diceBridgePlugin.category).toBe("dice");
    expect(diceBridgePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof diceBridgePlugin.description).toBe("string");
    expect(diceBridgePlugin.description.length).toBeGreaterThan(0);
    expect(diceBridgePlugin.settings).toBeDefined();
    expect(typeof diceBridgePlugin.settings).toBe("object");
    expect(typeof diceBridgePlugin.initialState).toBe("function");
    expect(typeof diceBridgePlugin.reducer).toBe("function");
    expect(typeof diceBridgePlugin.isTerminal).toBe("function");
    expect(diceBridgePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = diceBridgePlugin.initialState(42, S);
    const b = diceBridgePlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.segments).toBe(0);
    expect(a.rollsUsed).toBe(0);
    expect(a.dice).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("rolling");
    expect(diceBridgePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while rolling and null when done", () => {
    expect(typeof diceBridgePlugin.hint).toBe("function");
    const state = diceBridgePlugin.initialState(5, S);
    const hint = diceBridgePlugin.hint!(state);
    expect(hint).not.toBeNull();
    expect(typeof hint!.selector).toBe("string");
    expect(hint!.selector.length).toBeGreaterThan(0);
    expect(hint!.selector).toBe('[data-testid="hint-target-dice-bridge-roll"]');
    expect(hint!.pulses).toBe(3);

    const doneState = { ...state, phase: "done" as const };
    expect(diceBridgePlugin.hint!(doneState)).toBeNull();

    expect(diceBridgePlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
  });
});
