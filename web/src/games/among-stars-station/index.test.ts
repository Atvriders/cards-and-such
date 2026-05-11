import { describe, it, expect } from "vitest";
import { amongStarsStationPlugin } from "./index.js";
import type { AmongStarsStationState } from "./state.js";

const S = { dummy: false };

describe("among-stars-station plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(amongStarsStationPlugin.id).toBe("among-stars-station");
    expect(amongStarsStationPlugin.title).toBe("Among the Stars: Station");
    expect(amongStarsStationPlugin.category).toBe("cards");
    expect(amongStarsStationPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof amongStarsStationPlugin.description).toBe("string");
    expect(amongStarsStationPlugin.description.length).toBeGreaterThan(0);
    expect(amongStarsStationPlugin.settings).toBeDefined();
    expect(typeof amongStarsStationPlugin.settings).toBe("object");
    expect(typeof amongStarsStationPlugin.initialState).toBe("function");
    expect(typeof amongStarsStationPlugin.reducer).toBe("function");
    expect(typeof amongStarsStationPlugin.isTerminal).toBe("function");
    expect(amongStarsStationPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = amongStarsStationPlugin.initialState(123, S);
    const b = amongStarsStationPlugin.initialState(123, S);
    const aIds = a.offer.map((c) => `${c.id}:${c.rank}:${c.suit}`).join("|");
    const bIds = b.offer.map((c) => `${c.id}:${c.rank}:${c.suit}`).join("|");
    expect(aIds).toBe(bIds);
    expect(a.round).toBe(1);
    expect(a.phase).toBe("drafting");
    expect(a.offer.length).toBe(4);
    expect(a.myTableau).toEqual([]);
    expect(a.cpuTableau).toEqual([]);
    expect(amongStarsStationPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drafting and null when offer is empty", () => {
    expect(typeof amongStarsStationPlugin.hint).toBe("function");
    const state = amongStarsStationPlugin.initialState(7, S);
    const result = amongStarsStationPlugin.hint!(state);
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

    const emptyOffer: AmongStarsStationState = { ...state, offer: [] };
    expect(amongStarsStationPlugin.hint!(emptyOffer)).toBeNull();

    const notDrafting: AmongStarsStationState = { ...state, phase: "round-done" };
    expect(amongStarsStationPlugin.hint!(notDrafting)).toBeNull();
  });
});
