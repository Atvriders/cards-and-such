import { describe, it, expect } from "vitest";
import { barboothPlugin } from "./index.js";
import type { BarboothState } from "./state.js";

const S = { dummy: false } as const;

describe("barbooth plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(barboothPlugin.id).toBe("barbooth");
    expect(barboothPlugin.title).toBe("Barbooth");
    expect(barboothPlugin.category).toBe("dice");
    expect(barboothPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof barboothPlugin.description).toBe("string");
    expect(barboothPlugin.description.length).toBeGreaterThan(0);
    expect(barboothPlugin.settings).toBeDefined();
    expect(typeof barboothPlugin.settings).toBe("object");
    expect(typeof barboothPlugin.initialState).toBe("function");
    expect(typeof barboothPlugin.reducer).toBe("function");
    expect(typeof barboothPlugin.isTerminal).toBe("function");
    expect(barboothPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = barboothPlugin.initialState(42, S);
    const b = barboothPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("roll");
    expect(a.dice).toEqual([]);
    expect(barboothPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for roll/result phases and null when terminal", () => {
    expect(typeof barboothPlugin.hint).toBe("function");
    const state = barboothPlugin.initialState(5, S);

    // Fresh state is "roll" phase: should yield a non-empty selector.
    const rollHint = barboothPlugin.hint!(state);
    expect(rollHint).not.toBeNull();
    expect(typeof rollHint!.selector).toBe("string");
    expect(rollHint!.selector.length).toBeGreaterThan(0);
    expect(rollHint!.selector).toContain("hint-target-barbooth-roll");
    if (rollHint!.pulses !== undefined) {
      expect(typeof rollHint!.pulses).toBe("number");
      expect(rollHint!.pulses).toBeGreaterThan(0);
    }

    // "result" phase: should yield the next-button selector.
    const resultState: BarboothState = { ...state, phase: "result" };
    const resultHint = barboothPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toContain("hint-target-barbooth-next");

    // "done" phase: isTerminal short-circuits hint to null.
    const doneState: BarboothState = { ...state, phase: "done" };
    expect(barboothPlugin.isTerminal(doneState)).not.toBeNull();
    expect(barboothPlugin.hint!(doneState)).toBeNull();
  });
});
