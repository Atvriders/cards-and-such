import { describe, it, expect } from "vitest";
import { cardCrawlerPlugin } from "./index.js";
import type { CardCrawlerState } from "./state.js";

const S = {} as never;

describe("card-crawler plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardCrawlerPlugin.id).toBe("card-crawler");
    expect(cardCrawlerPlugin.title).toBe("Card Crawler");
    expect(cardCrawlerPlugin.category).toBe("cards");
    expect(cardCrawlerPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardCrawlerPlugin.description).toBe("string");
    expect(cardCrawlerPlugin.description.length).toBeGreaterThan(0);
    expect(cardCrawlerPlugin.settings).toBeDefined();
    expect(typeof cardCrawlerPlugin.settings).toBe("object");
    expect(typeof cardCrawlerPlugin.initialState).toBe("function");
    expect(typeof cardCrawlerPlugin.reducer).toBe("function");
    expect(typeof cardCrawlerPlugin.isTerminal).toBe("function");
    expect(cardCrawlerPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh board", () => {
    const a = cardCrawlerPlugin.initialState(42, S) as CardCrawlerState;
    const b = cardCrawlerPlugin.initialState(42, S) as CardCrawlerState;
    const aKinds = a.grid.map((c) => `${c.kind}:${c.value}:${c.label}:${c.revealed}`).join("|");
    const bKinds = b.grid.map((c) => `${c.kind}:${c.value}:${c.label}:${c.revealed}`).join("|");
    expect(aKinds).toBe(bKinds);
    expect(a.grid.length).toBe(16);
    expect(a.playerHp).toBe(40);
    expect(a.playerMaxHp).toBe(40);
    expect(a.gold).toBe(0);
    expect(a.score).toBe(0);
    expect(a.turnCount).toBe(0);
    expect(a.phase).toBe("playing");
    expect(cardCrawlerPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once the run terminates", () => {
    expect(typeof cardCrawlerPlugin.hint).toBe("function");
    const state = cardCrawlerPlugin.initialState(7, S) as CardCrawlerState;
    const result = cardCrawlerPlugin.hint!(state);
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

    // Force the terminal branch (cleared) so hint() falls through to null.
    const cleared: CardCrawlerState = {
      ...state,
      grid: state.grid.map((c) => ({ ...c, revealed: true })),
      phase: "cleared",
    };
    expect(cardCrawlerPlugin.isTerminal(cleared)).not.toBeNull();
    expect(cardCrawlerPlugin.hint!(cleared)).toBeNull();

    // And also the dead branch.
    const dead: CardCrawlerState = { ...state, phase: "dead", playerHp: 0 };
    expect(cardCrawlerPlugin.isTerminal(dead)).not.toBeNull();
    expect(cardCrawlerPlugin.hint!(dead)).toBeNull();
  });
});
