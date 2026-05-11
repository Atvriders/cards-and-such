import { describe, it, expect } from "vitest";
import { atlanticCityBjPlugin } from "./index.js";
import type { AtlanticCityBjState } from "./state.js";

const S = { dummy: false } as never;

describe("atlantic-city-bj plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(atlanticCityBjPlugin.id).toBe("atlantic-city-bj");
    expect(atlanticCityBjPlugin.title).toBe("Atlantic City Blackjack");
    expect(atlanticCityBjPlugin.category).toBe("cards");
    expect(atlanticCityBjPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof atlanticCityBjPlugin.description).toBe("string");
    expect(atlanticCityBjPlugin.description.length).toBeGreaterThan(0);
    expect(atlanticCityBjPlugin.settings).toBeDefined();
    expect(typeof atlanticCityBjPlugin.settings).toBe("object");
    expect(typeof atlanticCityBjPlugin.initialState).toBe("function");
    expect(typeof atlanticCityBjPlugin.reducer).toBe("function");
    expect(typeof atlanticCityBjPlugin.isTerminal).toBe("function");
    expect(atlanticCityBjPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = atlanticCityBjPlugin.initialState(42, S);
    const b = atlanticCityBjPlugin.initialState(42, S);
    expect(a.you.join(",")).toBe(b.you.join(","));
    expect(a.dealer.join(",")).toBe(b.dealer.join(","));
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("play");
    expect(atlanticCityBjPlugin.isTerminal(a)).toBeNull();

    const finished: AtlanticCityBjState = { ...a, phase: "done", score: 77 };
    expect(atlanticCityBjPlugin.isTerminal(finished)).toEqual({ score: 77 });
  });

  it("hint returns a HintTarget with non-empty selector across phases, or null when unreachable", () => {
    expect(typeof atlanticCityBjPlugin.hint).toBe("function");
    const state = atlanticCityBjPlugin.initialState(5, S);
    const result = atlanticCityBjPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-atlantic-city-bj-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // scored phase -> hint should point at the "next" target.
    const scored: AtlanticCityBjState = { ...state, phase: "scored" };
    const scoredHint = atlanticCityBjPlugin.hint!(scored);
    expect(scoredHint).not.toBeNull();
    if (scoredHint !== null) {
      expect(scoredHint.selector).toContain("next");
    }

    // Low total in play -> should suggest hit.
    const lowTotal: AtlanticCityBjState = { ...state, phase: "play", yourTotal: 8 };
    const lowHint = atlanticCityBjPlugin.hint!(lowTotal);
    expect(lowHint).not.toBeNull();
    if (lowHint !== null) {
      expect(lowHint.selector).toContain("hit");
    }

    // High total in play -> should suggest stand.
    const highTotal: AtlanticCityBjState = { ...state, phase: "play", yourTotal: 19 };
    const highHint = atlanticCityBjPlugin.hint!(highTotal);
    expect(highHint).not.toBeNull();
    if (highHint !== null) {
      expect(highHint.selector).toContain("stand");
    }

    // done phase: neither "scored" nor "play" -> falls through to null.
    const done: AtlanticCityBjState = { ...state, phase: "done" };
    expect(atlanticCityBjPlugin.hint!(done)).toBeNull();
  });
});
