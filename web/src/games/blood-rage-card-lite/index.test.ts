import { describe, it, expect } from "vitest";
import { bloodRageCardLitePlugin } from "./index.js";
import type { BloodRageCardLiteState } from "./state.js";

const S = { dummy: false } as never;

describe("blood-rage-card-lite plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bloodRageCardLitePlugin.id).toBe("blood-rage-card-lite");
    expect(bloodRageCardLitePlugin.title).toBe("Blood Rage: Lite");
    expect(bloodRageCardLitePlugin.category).toBe("cards");
    expect(bloodRageCardLitePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bloodRageCardLitePlugin.description).toBe("string");
    expect(bloodRageCardLitePlugin.description.length).toBeGreaterThan(0);
    expect(bloodRageCardLitePlugin.settings).toBeDefined();
    expect(typeof bloodRageCardLitePlugin.settings).toBe("object");
    expect(typeof bloodRageCardLitePlugin.initialState).toBe("function");
    expect(typeof bloodRageCardLitePlugin.reducer).toBe("function");
    expect(typeof bloodRageCardLitePlugin.isTerminal).toBe("function");
    expect(bloodRageCardLitePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bloodRageCardLitePlugin.initialState(42, S);
    const b = bloodRageCardLitePlugin.initialState(42, S);
    const aIds = a.offer.map((c) => `${c.suit}:${c.rank}`).join("|");
    const bIds = b.offer.map((c) => `${c.suit}:${c.rank}`).join("|");
    expect(aIds).toBe(bIds);
    expect(a.round).toBe(b.round);
    expect(a.phase).toBe(b.phase);
    expect(a.offer.length).toBeGreaterThan(0);
    expect(bloodRageCardLitePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bloodRageCardLitePlugin.hint).toBe("function");
    const state = bloodRageCardLitePlugin.initialState(7, S);
    const result = bloodRageCardLitePlugin.hint!(state);
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

    // Empty the offer to force the hint to fall through to null.
    const emptied: BloodRageCardLiteState = { ...state, offer: [] };
    expect(bloodRageCardLitePlugin.hint!(emptied)).toBeNull();

    // Non-drafting phase should also return null.
    const notDrafting: BloodRageCardLiteState = { ...state, phase: "done" };
    expect(bloodRageCardLitePlugin.hint!(notDrafting)).toBeNull();
  });
});
