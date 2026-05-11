import { describe, it, expect } from "vitest";
import { dealOrNoDealPlugin } from "./index.js";
import type { DealOrNoDealState, DealOrNoDealSettings } from "./state.js";

const S: DealOrNoDealSettings = { cases: "26" };

describe("deal-or-no-deal plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(dealOrNoDealPlugin.id).toBe("deal-or-no-deal");
    expect(dealOrNoDealPlugin.title).toBe("Deal or No Deal");
    expect(dealOrNoDealPlugin.category).toBe("board");
    expect(dealOrNoDealPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof dealOrNoDealPlugin.description).toBe("string");
    expect(dealOrNoDealPlugin.description.length).toBeGreaterThan(0);
    expect(dealOrNoDealPlugin.settings).toBeDefined();
    expect(typeof dealOrNoDealPlugin.settings).toBe("object");
    expect(typeof dealOrNoDealPlugin.initialState).toBe("function");
    expect(typeof dealOrNoDealPlugin.reducer).toBe("function");
    expect(typeof dealOrNoDealPlugin.isTerminal).toBe("function");
    expect(dealOrNoDealPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = dealOrNoDealPlugin.initialState(42, S);
    const b = dealOrNoDealPlugin.initialState(42, S);
    const aIds = a.cases.map((c) => `${c.id}:${c.amount}:${c.eliminated}`).join(";");
    const bIds = b.cases.map((c) => `${c.id}:${c.amount}:${c.eliminated}`).join(";");
    expect(aIds).toBe(bIds);
    expect(a.cases.length).toBe(26);
    expect(a.phase).toBe("pick_own");
    expect(a.playerCaseId).toBeNull();
    expect(a.round).toBe(1);
    expect(dealOrNoDealPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof dealOrNoDealPlugin.hint).toBe("function");
    const state = dealOrNoDealPlugin.initialState(5, S);
    const result = dealOrNoDealPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".dond-btn");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force hint() to short-circuit by setting phase to "done".
    const finished: DealOrNoDealState = { ...state, phase: "done" };
    expect(dealOrNoDealPlugin.hint!(finished)).toBeNull();
  });
});
