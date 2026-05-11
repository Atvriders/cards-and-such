import { describe, it, expect } from "vitest";
import { cardDrawUpPlugin } from "./index.js";
import type { CardDrawUpState } from "./state.js";

const S = { rounds: "5" } as const;

describe("card-draw-up plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardDrawUpPlugin.id).toBe("card-draw-up");
    expect(cardDrawUpPlugin.title).toBe("Card Draw Up");
    expect(cardDrawUpPlugin.category).toBe("cards");
    expect(cardDrawUpPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardDrawUpPlugin.description).toBe("string");
    expect(cardDrawUpPlugin.description.length).toBeGreaterThan(0);
    expect(cardDrawUpPlugin.settings).toBeDefined();
    expect(typeof cardDrawUpPlugin.settings).toBe("object");
    expect(typeof cardDrawUpPlugin.initialState).toBe("function");
    expect(typeof cardDrawUpPlugin.reducer).toBe("function");
    expect(typeof cardDrawUpPlugin.isTerminal).toBe("function");
    expect(cardDrawUpPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh game", () => {
    const a = cardDrawUpPlugin.initialState(42, S);
    const b = cardDrawUpPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.pos).toBe(0);
    expect(a.drawn).toEqual([]);
    expect(a.total).toBe(0);
    expect(a.coins).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(5);
    expect(a.phase).toBe("drawing");
    expect(a.bust).toBe(false);
    expect(a.lastGain).toBe(0);
    expect(a.deck.length).toBe(52);
    expect(cardDrawUpPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drawing and null when terminal", () => {
    expect(typeof cardDrawUpPlugin.hint).toBe("function");
    const state = cardDrawUpPlugin.initialState(7, S);
    const result = cardDrawUpPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-draw-up-primary"]');
    expect(result!.pulses).toBe(3);

    const terminal: CardDrawUpState = { ...state, phase: "gameover" };
    expect(cardDrawUpPlugin.isTerminal(terminal)).toEqual({ score: terminal.coins });
    expect(cardDrawUpPlugin.hint!(terminal)).toBeNull();
  });
});
