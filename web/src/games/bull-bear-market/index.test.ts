import { describe, it, expect } from "vitest";
import { bullBearMarketPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("bull-bear-market plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bullBearMarketPlugin.id).toBe("bull-bear-market");
    expect(bullBearMarketPlugin.title).toBe("Bull & Bear Market");
    expect(bullBearMarketPlugin.category).toBe("board");
    expect(bullBearMarketPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bullBearMarketPlugin.description).toBe("string");
    expect(bullBearMarketPlugin.description.length).toBeGreaterThan(0);
    expect(bullBearMarketPlugin.settings).toBeDefined();
    expect(typeof bullBearMarketPlugin.settings).toBe("object");
    expect(typeof bullBearMarketPlugin.initialState).toBe("function");
    expect(typeof bullBearMarketPlugin.reducer).toBe("function");
    expect(typeof bullBearMarketPlugin.isTerminal).toBe("function");
    expect(bullBearMarketPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = bullBearMarketPlugin.initialState(42, S);
    const b = bullBearMarketPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.turn).toBe(1);
    expect(a.cash).toBe(200);
    expect(a.assets).toBe(0);
    expect(a.workers).toBe(0);
    expect(a.phase).toBe("choosing");
    expect(bullBearMarketPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while choosing and null otherwise", () => {
    expect(typeof bullBearMarketPlugin.hint).toBe("function");
    const state = bullBearMarketPlugin.initialState(5, S);
    const result = bullBearMarketPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bull-bear-market-primary"]');
      expect(result.pulses).toBe(3);
    }

    // When not choosing, hint returns null.
    const resolved = { ...state, phase: "resolved" as const };
    expect(bullBearMarketPlugin.hint!(resolved)).toBeNull();
    const done = { ...state, phase: "done" as const };
    expect(bullBearMarketPlugin.hint!(done)).toBeNull();
  });
});
