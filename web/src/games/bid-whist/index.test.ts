import { describe, it, expect } from "vitest";
import { bidWhistPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("bid-whist plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bidWhistPlugin.id).toBe("bid-whist");
    expect(bidWhistPlugin.title).toBe("Bid Whist");
    expect(bidWhistPlugin.category).toBe("cards");
    expect(bidWhistPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bidWhistPlugin.description).toBe("string");
    expect(bidWhistPlugin.description.length).toBeGreaterThan(0);
    expect(bidWhistPlugin.settings).toBeDefined();
    expect(typeof bidWhistPlugin.settings).toBe("object");
    expect(typeof bidWhistPlugin.initialState).toBe("function");
    expect(typeof bidWhistPlugin.reducer).toBe("function");
    expect(typeof bidWhistPlugin.isTerminal).toBe("function");
    expect(bidWhistPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bidWhistPlugin.initialState(42, S);
    const b = bidWhistPlugin.initialState(42, S);
    const aIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.hands.length).toBe(2);
    expect(a.hands[0]!.length).toBe(13);
    expect(a.hands[1]!.length).toBe(13);
    expect(bidWhistPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when it's your turn at start, and null when phase is done or not your turn", () => {
    expect(typeof bidWhistPlugin.hint).toBe("function");
    const state = bidWhistPlugin.initialState(7, S);

    // Fresh deal: phase=playing, turn=0 (you lead), so hint should return a HintTarget.
    const result = bidWhistPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector).toMatch(/^\[data-testid="hint-target-bidwh-/);
    expect(result!.pulses).toBe(3);

    // When it's the CPU's turn, hint returns null.
    const cpuTurn = { ...state, turn: 1 };
    expect(bidWhistPlugin.hint!(cpuTurn)).toBeNull();

    // When phase is done, hint returns null.
    const finished = { ...state, phase: "done" as const };
    expect(bidWhistPlugin.hint!(finished)).toBeNull();

    // When player's hand is empty, hint returns null.
    const emptied = { ...state, hands: [[], state.hands[1]!] as const };
    expect(bidWhistPlugin.hint!(emptied)).toBeNull();
  });
});
