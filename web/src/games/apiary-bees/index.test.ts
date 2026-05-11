import { describe, it, expect } from "vitest";
import { apiaryBeesPlugin } from "./index.js";

const S = { dummy: false };

describe("apiary-bees plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(apiaryBeesPlugin.id).toBe("apiary-bees");
    expect(apiaryBeesPlugin.title).toBe("Apiary: Bees");
    expect(apiaryBeesPlugin.category).toBe("cards");
    expect(apiaryBeesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof apiaryBeesPlugin.description).toBe("string");
    expect(apiaryBeesPlugin.description.length).toBeGreaterThan(0);
    expect(typeof apiaryBeesPlugin.howToPlay).toBe("string");
    expect(apiaryBeesPlugin.settings).toBeDefined();
    expect(typeof apiaryBeesPlugin.initialState).toBe("function");
    expect(typeof apiaryBeesPlugin.reducer).toBe("function");
    expect(typeof apiaryBeesPlugin.isTerminal).toBe("function");
    expect(typeof apiaryBeesPlugin.hint).toBe("function");
    expect(apiaryBeesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null while drafting", () => {
    const a = apiaryBeesPlugin.initialState(42, S);
    const b = apiaryBeesPlugin.initialState(42, S);
    const aSig = a.offer.map((c) => `${c.suit}:${c.rank}`).join(",");
    const bSig = b.offer.map((c) => `${c.suit}:${c.rank}`).join(",");
    expect(aSig).toBe(bSig);
    expect(a.offer.length).toBe(4);
    expect(a.totalRounds).toBe(9);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("drafting");
    expect(a.myTableau).toEqual([]);
    expect(a.cpuTableau).toEqual([]);
    expect(a.myScore).toBe(0);
    expect(a.cpuScore).toBe(0);
    expect(apiaryBeesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drafting with offers and null otherwise", () => {
    const state = apiaryBeesPlugin.initialState(7, S);
    const draftingHint = apiaryBeesPlugin.hint!(state);
    expect(draftingHint).not.toBeNull();
    expect(draftingHint!.selector).toBe('[class$="-offer"] > button:first-child');
    expect(draftingHint!.pulses).toBe(3);

    const emptyOfferState = { ...state, offer: [] };
    expect(apiaryBeesPlugin.hint!(emptyOfferState)).toBeNull();

    const doneState = { ...state, phase: "done" as const };
    expect(apiaryBeesPlugin.hint!(doneState)).toBeNull();
    expect(apiaryBeesPlugin.isTerminal(doneState)).toEqual({ score: 0 });
  });
});
