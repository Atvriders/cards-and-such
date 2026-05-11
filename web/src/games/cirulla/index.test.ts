import { describe, it, expect } from "vitest";
import { cirullaPlugin } from "./index.js";
import type { CirullaState } from "./state.js";

const S = { dummy: false };

describe("cirulla plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cirullaPlugin.id).toBe("cirulla");
    expect(cirullaPlugin.title).toBe("Cirulla");
    expect(cirullaPlugin.category).toBe("cards");
    expect(cirullaPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cirullaPlugin.description).toBe("string");
    expect(cirullaPlugin.description.length).toBeGreaterThan(0);
    expect(cirullaPlugin.settings).toBeDefined();
    expect(typeof cirullaPlugin.settings).toBe("object");
    expect(typeof cirullaPlugin.initialState).toBe("function");
    expect(typeof cirullaPlugin.reducer).toBe("function");
    expect(typeof cirullaPlugin.isTerminal).toBe("function");
    expect(cirullaPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cirullaPlugin.initialState(123, S);
    const b = cirullaPlugin.initialState(123, S);
    const aHands = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bHands = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aHands).toBe(bHands);
    expect(a.phase).toBe("playing");
    expect(a.turn).toBe(0);
    expect(a.trick).toEqual([]);
    expect(cirullaPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cirullaPlugin.hint).toBe("function");
    const state = cirullaPlugin.initialState(7, S);
    const result = cirullaPlugin.hint!(state);
    expect(result).not.toBeUndefined();
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-cirullc-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force null branch: wrong turn.
    const wrongTurn: CirullaState = { ...state, turn: 1 };
    expect(cirullaPlugin.hint!(wrongTurn)).toBeNull();

    // Force null branch: empty hand.
    const emptyHand: CirullaState = {
      ...state,
      hands: [[], state.hands[1]!] as readonly (readonly import("../../engines/deck/index.js").Card[])[],
    };
    expect(cirullaPlugin.hint!(emptyHand)).toBeNull();

    // Force null branch: phase done.
    const done: CirullaState = { ...state, phase: "done" };
    expect(cirullaPlugin.hint!(done)).toBeNull();
  });
});
