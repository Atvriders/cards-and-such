import { describe, it, expect } from "vitest";
import { bidEuchrePlugin } from "./index.js";
import type { BidEuchreState } from "./state.js";

const S = { dummy: false } as const;

describe("bid-euchre plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bidEuchrePlugin.id).toBe("bid-euchre");
    expect(bidEuchrePlugin.title).toBe("Bid Euchre");
    expect(bidEuchrePlugin.category).toBe("cards");
    expect(bidEuchrePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bidEuchrePlugin.description).toBe("string");
    expect(bidEuchrePlugin.description.length).toBeGreaterThan(0);
    expect(bidEuchrePlugin.settings).toBeDefined();
    expect(typeof bidEuchrePlugin.settings).toBe("object");
    expect(typeof bidEuchrePlugin.initialState).toBe("function");
    expect(typeof bidEuchrePlugin.reducer).toBe("function");
    expect(typeof bidEuchrePlugin.isTerminal).toBe("function");
    expect(typeof bidEuchrePlugin.hint).toBe("function");
    expect(bidEuchrePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bidEuchrePlugin.initialState(42, S);
    const b = bidEuchrePlugin.initialState(42, S);
    const aIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.hands.length).toBe(2);
    expect(a.hands[0]!.length).toBe(6);
    expect(a.hands[1]!.length).toBe(6);
    expect(bidEuchrePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    const state = bidEuchrePlugin.initialState(7, S);
    const result = bidEuchrePlugin.hint!(state);
    // On a fresh deal the human leads (turn=0, phase=playing, non-empty hand),
    // so hint() should produce a target.
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-bideu-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Phase != "playing" -> hint returns null.
    const done: BidEuchreState = { ...state, phase: "done" };
    expect(bidEuchrePlugin.hint!(done)).toBeNull();

    // Not the human's turn -> hint returns null.
    const cpuTurn: BidEuchreState = { ...state, turn: 1 };
    expect(bidEuchrePlugin.hint!(cpuTurn)).toBeNull();

    // Empty hand -> hint returns null.
    const emptyHand: BidEuchreState = {
      ...state,
      hands: [[], state.hands[1]!],
    };
    expect(bidEuchrePlugin.hint!(emptyHand)).toBeNull();
  });
});
