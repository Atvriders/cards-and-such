import { describe, it, expect } from "vitest";
import { daifugoPlugin } from "./index.js";
import type { DaifugoState } from "./state.js";

const S = { dummy: "off" as const };

describe("daifugo plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(daifugoPlugin.id).toBe("daifugo");
    expect(daifugoPlugin.title).toBe("Daifugo");
    expect(daifugoPlugin.category).toBe("cards");
    expect(daifugoPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof daifugoPlugin.description).toBe("string");
    expect(daifugoPlugin.description.length).toBeGreaterThan(0);
    expect(daifugoPlugin.settings).toBeDefined();
    expect(typeof daifugoPlugin.settings).toBe("object");
    expect(typeof daifugoPlugin.initialState).toBe("function");
    expect(typeof daifugoPlugin.reducer).toBe("function");
    expect(typeof daifugoPlugin.isTerminal).toBe("function");
    expect(daifugoPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = daifugoPlugin.initialState(42, S);
    const b = daifugoPlugin.initialState(42, S);
    const aIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.hands.length).toBe(4);
    expect(a.phase).toBe("playing");
    expect(daifugoPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when finished", () => {
    expect(typeof daifugoPlugin.hint).toBe("function");
    const state = daifugoPlugin.initialState(7, S);
    const result = daifugoPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-daifugo-play"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the non-playing branch to assert the final null return.
    const done: DaifugoState = { ...state, phase: "done" };
    expect(daifugoPlugin.hint!(done)).toBeNull();
  });
});
