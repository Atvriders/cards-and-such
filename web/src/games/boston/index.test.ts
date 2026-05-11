import { describe, it, expect } from "vitest";
import { bostonPlugin } from "./index.js";
import type { BostonState } from "./state.js";

describe("boston plugin", () => {
  const settings = { botDifficulty: "hard" as const };

  it("exposes the expected plugin shape", () => {
    expect(bostonPlugin.id).toBe("boston");
    expect(bostonPlugin.title).toBe("Boston Whist");
    expect(bostonPlugin.category).toBe("cards");
    expect(bostonPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bostonPlugin.description).toBe("string");
    expect(bostonPlugin.description.length).toBeGreaterThan(0);
    expect(bostonPlugin.settings).toBeDefined();
    expect(typeof bostonPlugin.settings).toBe("object");
    expect(typeof bostonPlugin.initialState).toBe("function");
    expect(typeof bostonPlugin.reducer).toBe("function");
    expect(typeof bostonPlugin.isTerminal).toBe("function");
    expect(bostonPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bostonPlugin.initialState(42, settings);
    const b = bostonPlugin.initialState(42, settings);
    const aIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.trumpSuit).toBe(b.trumpSuit);
    expect(a.phase).toBe("bidding");
    expect(a.bid).toBeNull();
    expect(a.tricks).toEqual([0, 0, 0, 0]);
    expect(a.score).toEqual([0, 0]);
    expect(bostonPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof bostonPlugin.hint).toBe("function");
    const state = bostonPlugin.initialState(7, settings);
    const result = bostonPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-boston-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    const finished: BostonState = { ...state, phase: "done" };
    expect(bostonPlugin.isTerminal(finished)).not.toBeNull();
    expect(bostonPlugin.hint!(finished)).toBeNull();
  });
});
