import { describe, it, expect } from "vitest";
import { australianPatiencePlugin } from "./index.js";
import type { AustralianPatienceState } from "./state.js";

const S = {} as never;

describe("australian-patience plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(australianPatiencePlugin.id).toBe("australian-patience");
    expect(australianPatiencePlugin.title).toBe("Australian Patience");
    expect(australianPatiencePlugin.category).toBe("solitaire");
    expect(australianPatiencePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof australianPatiencePlugin.description).toBe("string");
    expect(australianPatiencePlugin.description.length).toBeGreaterThan(0);
    expect(australianPatiencePlugin.settings).toBeDefined();
    expect(typeof australianPatiencePlugin.settings).toBe("object");
    expect(typeof australianPatiencePlugin.initialState).toBe("function");
    expect(typeof australianPatiencePlugin.reducer).toBe("function");
    expect(typeof australianPatiencePlugin.isTerminal).toBe("function");
    expect(australianPatiencePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = australianPatiencePlugin.initialState(42, S);
    const b = australianPatiencePlugin.initialState(42, S);
    const aIds = a.tableau.map((col) => col.map((c) => c.id).join("|")).join(";");
    const bIds = b.tableau.map((col) => col.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);

    // Structure invariants from the deal description.
    expect(a.tableau).toHaveLength(7);
    expect(a.tableau[0]).toHaveLength(6);
    expect(a.tableau[1]).toHaveLength(6);
    expect(a.tableau[2]).toHaveLength(6);
    expect(a.tableau[3]).toHaveLength(6);
    expect(a.tableau[4]).toHaveLength(5);
    expect(a.tableau[5]).toHaveLength(5);
    expect(a.tableau[6]).toHaveLength(5);
    const dealt = a.tableau.reduce((s, col) => s + col.length, 0);
    expect(a.stock).toHaveLength(52 - dealt);
    expect(a.foundations).toHaveLength(4);
    expect(a.foundations.every((f) => f.length === 0)).toBe(true);
    expect(a.movesMade).toBe(0);
    expect(a.won).toBe(false);

    expect(australianPatiencePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null once won", () => {
    expect(typeof australianPatiencePlugin.hint).toBe("function");
    const state = australianPatiencePlugin.initialState(7, S);
    const result = australianPatiencePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force the terminal branch — hint() must return null when isTerminal is non-null.
    const wonState: AustralianPatienceState = { ...state, won: true };
    expect(australianPatiencePlugin.isTerminal(wonState)).not.toBeNull();
    expect(australianPatiencePlugin.hint!(wonState)).toBeNull();
  });
});
