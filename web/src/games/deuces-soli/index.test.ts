import { describe, it, expect } from "vitest";
import { deucesSoliPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("deuces-soli plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(deucesSoliPlugin.id).toBe("deuces-soli");
    expect(deucesSoliPlugin.title).toBe("Deuces");
    expect(deucesSoliPlugin.category).toBe("solitaire");
    expect(deucesSoliPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof deucesSoliPlugin.description).toBe("string");
    expect(deucesSoliPlugin.description.length).toBeGreaterThan(0);
    expect(deucesSoliPlugin.settings).toBeDefined();
    expect(typeof deucesSoliPlugin.settings).toBe("object");
    expect(typeof deucesSoliPlugin.initialState).toBe("function");
    expect(typeof deucesSoliPlugin.reducer).toBe("function");
    expect(typeof deucesSoliPlugin.isTerminal).toBe("function");
    expect(deucesSoliPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = deucesSoliPlugin.initialState(42, S);
    const b = deucesSoliPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.hand.join(",")).toBe(b.hand.join(","));
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.hand.length).toBe(5);
    expect(deucesSoliPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when terminal", () => {
    expect(typeof deucesSoliPlugin.hint).toBe("function");
    const fresh = deucesSoliPlugin.initialState(5, S);
    const result = deucesSoliPlugin.hint!(fresh);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="play-restart-btn"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done = { ...fresh, phase: "done" as const };
    expect(deucesSoliPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(deucesSoliPlugin.hint!(done)).toBeNull();
  });
});
