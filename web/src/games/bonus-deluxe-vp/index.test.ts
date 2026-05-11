import { describe, it, expect } from "vitest";
import { bonusDeluxeVpPlugin } from "./index.js";
import type { BonusDeluxeVpState } from "./state.js";

const S = { rounds: "10" as const };

describe("bonus-deluxe-vp plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bonusDeluxeVpPlugin.id).toBe("bonus-deluxe-vp");
    expect(bonusDeluxeVpPlugin.title).toBe("Bonus Deluxe Video Poker");
    expect(bonusDeluxeVpPlugin.category).toBe("cards");
    expect(bonusDeluxeVpPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bonusDeluxeVpPlugin.description).toBe("string");
    expect(bonusDeluxeVpPlugin.description.length).toBeGreaterThan(0);
    expect(bonusDeluxeVpPlugin.settings).toBeDefined();
    expect(typeof bonusDeluxeVpPlugin.settings).toBe("object");
    expect(typeof bonusDeluxeVpPlugin.initialState).toBe("function");
    expect(typeof bonusDeluxeVpPlugin.reducer).toBe("function");
    expect(typeof bonusDeluxeVpPlugin.isTerminal).toBe("function");
    expect(bonusDeluxeVpPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = bonusDeluxeVpPlugin.initialState(42, S);
    const b = bonusDeluxeVpPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.hand).toEqual([]);
    expect(a.phase).toBe("ready");
    expect(bonusDeluxeVpPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof bonusDeluxeVpPlugin.hint).toBe("function");
    const state = bonusDeluxeVpPlugin.initialState(5, S);
    const result = bonusDeluxeVpPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bonus-deluxe-vp-primary"]');
      expect(result.pulses).toBe(3);
    }

    const terminal: BonusDeluxeVpState = { ...state, phase: "gameover" };
    expect(bonusDeluxeVpPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(bonusDeluxeVpPlugin.hint!(terminal)).toBeNull();
  });
});
