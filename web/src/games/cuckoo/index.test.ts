import { describe, it, expect } from "vitest";
import { cuckooPlugin } from "./index.js";
import type { CuckooState } from "./state.js";

const S = {} as never;

describe("cuckoo plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cuckooPlugin.id).toBe("cuckoo");
    expect(cuckooPlugin.title).toBe("Cuckoo");
    expect(cuckooPlugin.category).toBe("cards");
    expect(cuckooPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cuckooPlugin.description).toBe("string");
    expect(cuckooPlugin.description.length).toBeGreaterThan(0);
    expect(cuckooPlugin.settings).toBeDefined();
    expect(typeof cuckooPlugin.settings).toBe("object");
    expect(typeof cuckooPlugin.initialState).toBe("function");
    expect(typeof cuckooPlugin.reducer).toBe("function");
    expect(typeof cuckooPlugin.isTerminal).toBe("function");
    expect(cuckooPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cuckooPlugin.initialState(42, S);
    const b = cuckooPlugin.initialState(42, S);
    const aIds = a.hands.map((c) => (c ? c.id : "_")).join("|");
    const bIds = b.hands.map((c) => (c ? c.id : "_")).join("|");
    expect(aIds).toBe(bIds);
    const aStock = a.stock.map((c) => c.id).join("|");
    const bStock = b.stock.map((c) => c.id).join("|");
    expect(aStock).toBe(bStock);
    expect(a.phase).toBe("player-turn");
    expect(a.turn).toBe(0);
    expect(a.lives).toEqual([3, 3, 3, 3]);
    expect(cuckooPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    expect(typeof cuckooPlugin.hint).toBe("function");
    const state = cuckooPlugin.initialState(7, S);
    const result = cuckooPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-cuckoo-primary"]');
    expect(result!.pulses).toBe(3);

    // Force the terminal branch by entering reveal phase with player dead.
    const terminalState: CuckooState = {
      ...state,
      phase: "reveal",
      lives: [0, 3, 3, 3],
    };
    expect(cuckooPlugin.isTerminal(terminalState)).not.toBeNull();
    expect(cuckooPlugin.hint!(terminalState)).toBeNull();
  });
});
