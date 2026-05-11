import { describe, it, expect } from "vitest";
import { agricolaCreaturesPlugin } from "./index.js";
import type { AgricolaCreaturesState } from "./state.js";

const S = { dummy: false } as never;

describe("agricola-creatures plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(agricolaCreaturesPlugin.id).toBe("agricola-creatures");
    expect(agricolaCreaturesPlugin.title).toBe("Agricola All Creatures");
    expect(agricolaCreaturesPlugin.category).toBe("board");
    expect(agricolaCreaturesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof agricolaCreaturesPlugin.description).toBe("string");
    expect(agricolaCreaturesPlugin.description.length).toBeGreaterThan(0);
    expect(agricolaCreaturesPlugin.settings).toBeDefined();
    expect(typeof agricolaCreaturesPlugin.settings).toBe("object");
    expect(typeof agricolaCreaturesPlugin.initialState).toBe("function");
    expect(typeof agricolaCreaturesPlugin.reducer).toBe("function");
    expect(typeof agricolaCreaturesPlugin.isTerminal).toBe("function");
    expect(agricolaCreaturesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = agricolaCreaturesPlugin.initialState(42, S);
    const b = agricolaCreaturesPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.turn).toBe(1);
    expect(a.cash).toBe(200);
    expect(a.assets).toBe(0);
    expect(a.workers).toBe(0);
    expect(a.phase).toBe("choosing");
    expect(agricolaCreaturesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null otherwise", () => {
    expect(typeof agricolaCreaturesPlugin.hint).toBe("function");
    const state = agricolaCreaturesPlugin.initialState(7, S);
    const result = agricolaCreaturesPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-agricola-creatures-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const resolved: AgricolaCreaturesState = { ...state, phase: "resolved" };
    expect(agricolaCreaturesPlugin.hint!(resolved)).toBeNull();

    const done: AgricolaCreaturesState = { ...state, phase: "done" };
    expect(agricolaCreaturesPlugin.hint!(done)).toBeNull();
  });
});
