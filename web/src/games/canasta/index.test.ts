import { describe, it, expect } from "vitest";
import { canastaPlugin } from "./index.js";
import type { CanastaState } from "./state.js";

const S = { botCount: 1 };

describe("canasta plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(canastaPlugin.id).toBe("canasta");
    expect(canastaPlugin.title).toBe("Canasta");
    expect(canastaPlugin.category).toBe("cards");
    expect(canastaPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof canastaPlugin.description).toBe("string");
    expect(canastaPlugin.description.length).toBeGreaterThan(0);
    expect(canastaPlugin.settings).toBeDefined();
    expect(typeof canastaPlugin.settings).toBe("object");
    expect(typeof canastaPlugin.initialState).toBe("function");
    expect(typeof canastaPlugin.reducer).toBe("function");
    expect(typeof canastaPlugin.isTerminal).toBe("function");
    expect(canastaPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = canastaPlugin.initialState(42, S);
    const b = canastaPlugin.initialState(42, S);
    const aHandIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bHandIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aHandIds).toBe(bHandIds);
    const aStockIds = a.stock.map((c) => c.id).join("|");
    const bStockIds = b.stock.map((c) => c.id).join("|");
    expect(aStockIds).toBe(bStockIds);
    expect(a.phase).toBe("player-draw");
    expect(a.numPlayers).toBe(2);
    expect(canastaPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof canastaPlugin.hint).toBe("function");
    const state = canastaPlugin.initialState(7, S);

    // Fresh state is in player-draw phase: should pulse the stock hint target.
    const drawHint = canastaPlugin.hint!(state);
    expect(drawHint).not.toBeNull();
    expect(drawHint!.selector).toBe('[data-testid="hint-target-canasta-draw-stock"]');
    expect(drawHint!.pulses).toBe(3);

    // Move into player-meld phase to exercise the hand-based hint branch.
    const meldPhase: CanastaState = { ...state, phase: "player-meld" };
    const meldHint = canastaPlugin.hint!(meldPhase);
    if (meldHint !== null) {
      expect(typeof meldHint.selector).toBe("string");
      expect(meldHint.selector.length).toBeGreaterThan(0);
      expect(meldHint.selector).toMatch(/^\[data-testid="hint-target-canasta-/);
      if (meldHint.pulses !== undefined) {
        expect(typeof meldHint.pulses).toBe("number");
        expect(meldHint.pulses).toBeGreaterThan(0);
      }
    }

    // In "done" phase, hint must return null.
    const doneState: CanastaState = { ...state, phase: "done" };
    expect(canastaPlugin.hint!(doneState)).toBeNull();

    // In "bot-turn" phase, hint must return null.
    const botState: CanastaState = { ...state, phase: "bot-turn" };
    expect(canastaPlugin.hint!(botState)).toBeNull();

    // Empty hand in player-meld returns null.
    const emptyHand: CanastaState = {
      ...state,
      phase: "player-meld",
      hands: state.hands.map((_, i) => (i === 0 ? [] : state.hands[i]!)),
    };
    expect(canastaPlugin.hint!(emptyHand)).toBeNull();
  });
});
