import { describe, it, expect } from "vitest";
import { demonPlugin } from "./index.js";
import type { DemonState } from "./state.js";

const S = {} as never;

describe("demon plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(demonPlugin.id).toBe("demon");
    expect(demonPlugin.title).toBe("Demon");
    expect(demonPlugin.category).toBe("solitaire");
    expect(demonPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof demonPlugin.description).toBe("string");
    expect(demonPlugin.description.length).toBeGreaterThan(0);
    expect(demonPlugin.settings).toBeDefined();
    expect(typeof demonPlugin.settings).toBe("object");
    expect(typeof demonPlugin.initialState).toBe("function");
    expect(typeof demonPlugin.reducer).toBe("function");
    expect(typeof demonPlugin.isTerminal).toBe("function");
    expect(demonPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = demonPlugin.initialState(42, S);
    const b = demonPlugin.initialState(42, S);
    const aReserveIds = a.reserve.map((c) => c.id).join("|");
    const bReserveIds = b.reserve.map((c) => c.id).join("|");
    expect(aReserveIds).toBe(bReserveIds);
    const aTableauIds = a.tableau.map((col) => col.map((c) => c.id).join(",")).join(";");
    const bTableauIds = b.tableau.map((col) => col.map((c) => c.id).join(",")).join(";");
    expect(aTableauIds).toBe(bTableauIds);
    expect(a.stock.map((c) => c.id).join("|")).toBe(b.stock.map((c) => c.id).join("|"));
    expect(a.reserve.length).toBe(13);
    expect(a.tableau.length).toBe(4);
    a.tableau.forEach((col) => expect(col.length).toBe(4));
    expect(a.foundations.length).toBe(4);
    a.foundations.forEach((f) => expect(f.cards.length).toBe(0));
    expect(a.waste.length).toBe(0);
    expect(a.score).toBe(0);
    expect(a.movesMade).toBe(0);
    expect(a.won).toBe(false);
    expect(demonPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while in play and null once terminal is reached", () => {
    expect(typeof demonPlugin.hint).toBe("function");
    const state = demonPlugin.initialState(7, S);
    const result = demonPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="play-restart-btn"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force the terminal branch by manufacturing a state where every card
    // sits on a foundation pile (52 total). hint() should then return null.
    const terminal: DemonState = {
      ...state,
      foundations: state.foundations.map((f, i) => ({
        ...f,
        cards: i === 0 ? new Array(52).fill(state.reserve[0]!) : [],
      })),
    };
    expect(demonPlugin.isTerminal(terminal)).not.toBeNull();
    expect(demonPlugin.hint!(terminal)).toBeNull();
  });
});
