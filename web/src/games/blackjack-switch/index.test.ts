import { describe, it, expect } from "vitest";
import { blackjackSwitchPlugin } from "./index.js";
import type { BlackjackSwitchSettings, BlackjackSwitchState } from "./state.js";

const settings: BlackjackSwitchSettings = {
  handsPerSession: 20,
  bet: "10",
  deckCount: "6",
};

describe("blackjack-switch plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(blackjackSwitchPlugin.id).toBe("blackjack-switch");
    expect(blackjackSwitchPlugin.title).toBe("Blackjack Switch");
    expect(blackjackSwitchPlugin.category).toBe("cards");
    expect(blackjackSwitchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof blackjackSwitchPlugin.description).toBe("string");
    expect(blackjackSwitchPlugin.description.length).toBeGreaterThan(0);
    expect(blackjackSwitchPlugin.settings).toBeDefined();
    expect(typeof blackjackSwitchPlugin.settings).toBe("object");
    expect(typeof blackjackSwitchPlugin.initialState).toBe("function");
    expect(typeof blackjackSwitchPlugin.reducer).toBe("function");
    expect(typeof blackjackSwitchPlugin.isTerminal).toBe("function");
    expect(blackjackSwitchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = blackjackSwitchPlugin.initialState(42, settings);
    const b = blackjackSwitchPlugin.initialState(42, settings);
    expect(a.phase).toBe("betting");
    expect(a.bankroll).toBe(1000);
    expect(a.handsPlayed).toBe(0);
    const aIds = a.shoe.map((c) => c.id).join("|");
    const bIds = b.shoe.map((c) => c.id).join("|");
    expect(aIds).toBe(bIds);
    expect(a.shoe.length).toBe(b.shoe.length);
    expect(blackjackSwitchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector in each phase and is callable", () => {
    expect(typeof blackjackSwitchPlugin.hint).toBe("function");
    const state = blackjackSwitchPlugin.initialState(7, settings);

    // betting phase -> deal hint target
    const bettingHint = blackjackSwitchPlugin.hint!(state);
    expect(bettingHint).not.toBeNull();
    if (bettingHint !== null) {
      expect(typeof bettingHint.selector).toBe("string");
      expect(bettingHint.selector.length).toBeGreaterThan(0);
      expect(bettingHint.selector).toContain("blackjack-switch-deal");
      if (bettingHint.pulses !== undefined) {
        expect(typeof bettingHint.pulses).toBe("number");
        expect(bettingHint.pulses).toBeGreaterThan(0);
      }
    }

    // switch-decision phase falls through (none of the matching branches) -> null
    const switchDecision: BlackjackSwitchState = { ...state, phase: "switch-decision" };
    expect(blackjackSwitchPlugin.hint!(switchDecision)).toBeNull();

    // settled phase -> deal hint target
    const settled: BlackjackSwitchState = { ...state, phase: "settled" };
    const settledHint = blackjackSwitchPlugin.hint!(settled);
    expect(settledHint).not.toBeNull();
    if (settledHint !== null) {
      expect(settledHint.selector).toContain("blackjack-switch-deal");
    }
  });
});
