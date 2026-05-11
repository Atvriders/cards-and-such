import { describe, it, expect } from "vitest";
import { bridgeContractPlugin } from "./index.js";

const S = { dummy: false };

describe("bridge-contract plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bridgeContractPlugin.id).toBe("bridge-contract");
    expect(bridgeContractPlugin.title).toBe("Contract Bridge");
    expect(bridgeContractPlugin.category).toBe("cards");
    expect(bridgeContractPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bridgeContractPlugin.description).toBe("string");
    expect(bridgeContractPlugin.description.length).toBeGreaterThan(0);
    expect(bridgeContractPlugin.settings).toBeDefined();
    expect(typeof bridgeContractPlugin.settings).toBe("object");
    expect(typeof bridgeContractPlugin.initialState).toBe("function");
    expect(typeof bridgeContractPlugin.reducer).toBe("function");
    expect(typeof bridgeContractPlugin.isTerminal).toBe("function");
    expect(bridgeContractPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bridgeContractPlugin.initialState(42, S);
    const b = bridgeContractPlugin.initialState(42, S);
    const aIds = a.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    const bIds = b.hands.map((h) => h.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("playing");
    expect(a.hands.length).toBe(2);
    expect(a.hands[0]!.length).toBe(13);
    expect(bridgeContractPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with bridgec selector when it is the player's turn, else null", () => {
    expect(typeof bridgeContractPlugin.hint).toBe("function");
    const state = bridgeContractPlugin.initialState(5, S);
    const result = bridgeContractPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-bridgec-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force null branches: wrong phase
    const doneState = { ...state, phase: "done" as const };
    expect(bridgeContractPlugin.hint!(doneState)).toBeNull();

    // Force null branches: not player's turn
    const cpuTurn = { ...state, turn: 1 };
    expect(bridgeContractPlugin.hint!(cpuTurn)).toBeNull();

    // Force null branches: empty hand
    const emptyHand = { ...state, hands: [[], state.hands[1]!] as const };
    expect(bridgeContractPlugin.hint!(emptyHand)).toBeNull();
  });
});
