import { describe, it, expect } from "vitest";
import { crescentPlugin } from "./index.js";

const S = {} as never;

describe("crescent plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(crescentPlugin.id).toBe("crescent");
    expect(crescentPlugin.title).toBe("Crescent");
    expect(crescentPlugin.category).toBe("solitaire");
    expect(crescentPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crescentPlugin.description).toBe("string");
    expect(crescentPlugin.description.length).toBeGreaterThan(0);
    expect(crescentPlugin.settings).toBeDefined();
    expect(typeof crescentPlugin.settings).toBe("object");
    expect(typeof crescentPlugin.initialState).toBe("function");
    expect(typeof crescentPlugin.reducer).toBe("function");
    expect(typeof crescentPlugin.isTerminal).toBe("function");
    expect(crescentPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = crescentPlugin.initialState(42, S);
    const b = crescentPlugin.initialState(42, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.score).toBe(0);
    expect(a.movesMade).toBe(0);
    expect(a.redealsLeft).toBe(3);
    expect(a.won).toBe(false);
    // 16 crescent piles + 8 foundations = 24 piles
    expect(a.piles.length).toBe(24);
    expect(crescentPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof crescentPlugin.hint).toBe("function");
    const state = crescentPlugin.initialState(7, S);
    const result = crescentPlugin.hint!(state);
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

    // Force isTerminal to be truthy so hint() returns null.
    const wonState = { ...state, won: true };
    expect(crescentPlugin.hint!(wonState)).toBeNull();
    expect(crescentPlugin.isTerminal(wonState)).not.toBeNull();
  });
});
