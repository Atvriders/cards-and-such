import { describe, it, expect } from "vitest";
import { auldLangSynePlugin } from "./index.js";
import type { AuldLangSyneState } from "./state.js";

const S = {} as never;

describe("auld-lang-syne plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(auldLangSynePlugin.id).toBe("auld-lang-syne");
    expect(auldLangSynePlugin.title).toBe("Auld Lang Syne");
    expect(auldLangSynePlugin.category).toBe("solitaire");
    expect(auldLangSynePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof auldLangSynePlugin.description).toBe("string");
    expect(auldLangSynePlugin.description.length).toBeGreaterThan(0);
    expect(auldLangSynePlugin.settings).toBeDefined();
    expect(typeof auldLangSynePlugin.settings).toBe("object");
    expect(typeof auldLangSynePlugin.initialState).toBe("function");
    expect(typeof auldLangSynePlugin.reducer).toBe("function");
    expect(typeof auldLangSynePlugin.isTerminal).toBe("function");
    expect(auldLangSynePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = auldLangSynePlugin.initialState(42, S);
    const b = auldLangSynePlugin.initialState(42, S);
    const serialize = (st: AuldLangSyneState) => {
      const f = st.foundations.map((col) => col.map((c) => c.id).join("|")).join(";");
      const t = st.tableau.map((col) => col.map((c) => c.id).join("|")).join(";");
      const s = st.stock.map((c) => c.id).join("|");
      const w = st.waste.map((c) => c.id).join("|");
      return [f, t, s, w].join("::");
    };
    expect(serialize(a)).toBe(serialize(b));
    // Four foundations, each starting with the Ace of its suit
    expect(a.foundations.length).toBe(4);
    for (const f of a.foundations) {
      expect(f.length).toBe(1);
      expect(f[0]!.rank).toBe(1);
    }
    // Four tableau piles with one card each
    expect(a.tableau.length).toBe(4);
    for (const col of a.tableau) {
      expect(col.length).toBe(1);
    }
    // Stock holds 52 - 4 aces - 4 dealt = 44 cards
    expect(a.stock.length).toBe(44);
    expect(a.waste.length).toBe(0);
    expect(a.movesMade).toBe(0);
    expect(a.won).toBe(false);
    expect(auldLangSynePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof auldLangSynePlugin.hint).toBe("function");
    const state = auldLangSynePlugin.initialState(7, S);
    const result = auldLangSynePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the terminal branch: a "won" state should make hint() return null.
    const terminal: AuldLangSyneState = { ...state, won: true };
    expect(auldLangSynePlugin.isTerminal(terminal)).not.toBeNull();
    expect(auldLangSynePlugin.hint!(terminal)).toBeNull();
  });
});
