import { describe, it, expect } from "vitest";
import { archwayPlugin } from "./index.js";
import type { ArchwayState } from "./state.js";

const S = {} as never;

describe("archway plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(archwayPlugin.id).toBe("archway");
    expect(archwayPlugin.title).toBe("Archway");
    expect(archwayPlugin.category).toBe("solitaire");
    expect(archwayPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof archwayPlugin.description).toBe("string");
    expect(archwayPlugin.description.length).toBeGreaterThan(0);
    expect(archwayPlugin.settings).toBeDefined();
    expect(typeof archwayPlugin.settings).toBe("object");
    expect(typeof archwayPlugin.initialState).toBe("function");
    expect(typeof archwayPlugin.reducer).toBe("function");
    expect(typeof archwayPlugin.isTerminal).toBe("function");
    expect(archwayPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = archwayPlugin.initialState(42, S);
    const b = archwayPlugin.initialState(42, S);
    const aIds = a.fans.map((f) => f.map((c) => c.id).join("|")).join(";");
    const bIds = b.fans.map((f) => f.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    // Fresh deal: 12 fans of 4 cards, stock not empty -> not terminal
    expect(a.fans).toHaveLength(12);
    a.fans.forEach((f) => expect(f).toHaveLength(4));
    expect(a.foundations).toHaveLength(8);
    expect(a.stock.length).toBeGreaterThan(0);
    expect(a.score).toBe(0);
    expect(a.won).toBe(false);
    expect(archwayPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when in-progress and null when terminal", () => {
    expect(typeof archwayPlugin.hint).toBe("function");
    const state = archwayPlugin.initialState(7, S);
    const result = archwayPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force terminal: mark as won. hint() must return null.
    const wonState: ArchwayState = { ...state, won: true };
    expect(archwayPlugin.isTerminal(wonState)).not.toBeNull();
    expect(archwayPlugin.hint!(wonState)).toBeNull();
  });
});
