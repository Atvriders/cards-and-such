import { describe, it, expect } from "vitest";
import { bibliosDiceDraftPlugin } from "./index.js";
import type { BibliosDiceDraftState } from "./state.js";

const S = { dummy: false } as const;

describe("biblios-dice-draft plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bibliosDiceDraftPlugin.id).toBe("biblios-dice-draft");
    expect(bibliosDiceDraftPlugin.title).toBe("Biblios Dice");
    expect(bibliosDiceDraftPlugin.category).toBe("cards");
    expect(bibliosDiceDraftPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bibliosDiceDraftPlugin.description).toBe("string");
    expect(bibliosDiceDraftPlugin.description.length).toBeGreaterThan(0);
    expect(bibliosDiceDraftPlugin.settings).toBeDefined();
    expect(typeof bibliosDiceDraftPlugin.settings).toBe("object");
    expect(typeof bibliosDiceDraftPlugin.initialState).toBe("function");
    expect(typeof bibliosDiceDraftPlugin.reducer).toBe("function");
    expect(typeof bibliosDiceDraftPlugin.isTerminal).toBe("function");
    expect(bibliosDiceDraftPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bibliosDiceDraftPlugin.initialState(123, S);
    const b = bibliosDiceDraftPlugin.initialState(123, S);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.phase).toBe("drafting");
    expect(a.offer.length).toBeGreaterThan(0);
    expect(bibliosDiceDraftPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drafting with offer and null otherwise", () => {
    expect(typeof bibliosDiceDraftPlugin.hint).toBe("function");
    const state = bibliosDiceDraftPlugin.initialState(7, S);
    const result = bibliosDiceDraftPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toContain("-offer");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the non-drafting branch: empty offer should yield null.
    const emptyOffer: BibliosDiceDraftState = { ...state, offer: [] };
    expect(bibliosDiceDraftPlugin.hint!(emptyOffer)).toBeNull();

    // Force the non-drafting phase branch.
    const doneState: BibliosDiceDraftState = { ...state, phase: "done" };
    expect(bibliosDiceDraftPlugin.hint!(doneState)).toBeNull();
  });
});
