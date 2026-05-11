import { describe, it, expect } from "vitest";
import { cassettePlugin } from "./index.js";

const S = { dummy: false } as never;

describe("cassette plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cassettePlugin.id).toBe("cassette");
    expect(cassettePlugin.title).toBe("Cassette (Agnes Bernauer)");
    expect(cassettePlugin.category).toBe("solitaire");
    expect(cassettePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cassettePlugin.description).toBe("string");
    expect(cassettePlugin.description.length).toBeGreaterThan(0);
    expect(cassettePlugin.settings).toBeDefined();
    expect(typeof cassettePlugin.settings).toBe("object");
    expect(typeof cassettePlugin.initialState).toBe("function");
    expect(typeof cassettePlugin.reducer).toBe("function");
    expect(typeof cassettePlugin.isTerminal).toBe("function");
    expect(cassettePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cassettePlugin.initialState(42, S);
    const b = cassettePlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.hand.join(",")).toBe(b.hand.join(","));
    expect(a.pos).toBe(b.pos);
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.hand.length).toBe(5);
    expect(cassettePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with a non-empty selector during play and null when terminal", () => {
    expect(typeof cassettePlugin.hint).toBe("function");
    const state = cassettePlugin.initialState(7, S);
    const result = cassettePlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force terminal phase: hint() must return null.
    const done = { ...state, phase: "done" as const };
    expect(cassettePlugin.hint!(done)).toBeNull();
    expect(cassettePlugin.isTerminal(done)).toEqual({ score: done.score });
  });
});
