import { describe, it, expect } from "vitest";
import { cardBlastPlugin, cardBlastSettings } from "./index.js";

const S = { rounds: "8" as const };

describe("card-blast plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardBlastPlugin.id).toBe("card-blast");
    expect(cardBlastPlugin.title).toBe("Card Blast");
    expect(cardBlastPlugin.category).toBe("cards");
    expect(cardBlastPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardBlastPlugin.description).toBe("string");
    expect(cardBlastPlugin.description.length).toBeGreaterThan(0);
    expect(cardBlastPlugin.settings).toBe(cardBlastSettings);
    expect(typeof cardBlastPlugin.initialState).toBe("function");
    expect(typeof cardBlastPlugin.reducer).toBe("function");
    expect(typeof cardBlastPlugin.isTerminal).toBe("function");
    expect(cardBlastPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardBlastPlugin.initialState(42, S);
    const b = cardBlastPlugin.initialState(42, S);
    const aIds = a.hand.map((c) => c.id).join("|");
    const bIds = b.hand.map((c) => c.id).join("|");
    expect(aIds).toBe(bIds);
    expect(a.hand.length).toBe(7);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.totalRounds).toBe(8);
    expect(a.gameOver).toBe(false);
    expect(cardBlastPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a live state and null after game over", () => {
    expect(typeof cardBlastPlugin.hint).toBe("function");
    const state = cardBlastPlugin.initialState(5, S);
    const result = cardBlastPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-blast-primary"]');
    expect(result!.pulses).toBe(3);

    const terminal = { ...state, gameOver: true };
    expect(cardBlastPlugin.hint!(terminal)).toBeNull();
    expect(cardBlastPlugin.isTerminal(terminal)).toEqual({ score: Math.min(1000, Math.floor(terminal.score / 5)) });
  });
});
