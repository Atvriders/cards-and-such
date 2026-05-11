import { describe, it, expect } from "vitest";
import { cardMusicShopPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("card-music-shop plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardMusicShopPlugin.id).toBe("card-music-shop");
    expect(cardMusicShopPlugin.title).toBe("Card Music Shop");
    expect(cardMusicShopPlugin.category).toBe("cards");
    expect(cardMusicShopPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardMusicShopPlugin.description).toBe("string");
    expect(cardMusicShopPlugin.description.length).toBeGreaterThan(0);
    expect(cardMusicShopPlugin.settings).toBeDefined();
    expect(typeof cardMusicShopPlugin.settings).toBe("object");
    expect(typeof cardMusicShopPlugin.initialState).toBe("function");
    expect(typeof cardMusicShopPlugin.reducer).toBe("function");
    expect(typeof cardMusicShopPlugin.isTerminal).toBe("function");
    expect(cardMusicShopPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardMusicShopPlugin.initialState(42, S);
    const b = cardMusicShopPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.drawCount).toBe(0);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.phase).toBe("drawing");
    expect(cardMusicShopPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh state and null when terminal", () => {
    expect(typeof cardMusicShopPlugin.hint).toBe("function");
    const state = cardMusicShopPlugin.initialState(7, S);
    const result = cardMusicShopPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-music-shop-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const terminal = { ...state, phase: "done" as const };
    expect(cardMusicShopPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(cardMusicShopPlugin.hint!(terminal)).toBeNull();
  });
});
