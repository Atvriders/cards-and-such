import { describe, it, expect } from "vitest";
import { chinchonPlugin } from "./index.js";
import type { ChinchonState } from "./state.js";

const S = {} as never;

describe("chinchon plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(chinchonPlugin.id).toBe("chinchon");
    expect(chinchonPlugin.title).toBe("Chinchón");
    expect(chinchonPlugin.category).toBe("cards");
    expect(chinchonPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof chinchonPlugin.description).toBe("string");
    expect(chinchonPlugin.description.length).toBeGreaterThan(0);
    expect(chinchonPlugin.settings).toBeDefined();
    expect(typeof chinchonPlugin.settings).toBe("object");
    expect(typeof chinchonPlugin.initialState).toBe("function");
    expect(typeof chinchonPlugin.reducer).toBe("function");
    expect(typeof chinchonPlugin.isTerminal).toBe("function");
    expect(chinchonPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = chinchonPlugin.initialState(42, S);
    const b = chinchonPlugin.initialState(42, S);
    const aIds = [
      a.playerHand.map((c) => c.id).join("|"),
      a.botHand.map((c) => c.id).join("|"),
      a.stockPile.map((c) => c.id).join("|"),
      a.discardPile.map((c) => c.id).join("|"),
    ].join(";");
    const bIds = [
      b.playerHand.map((c) => c.id).join("|"),
      b.botHand.map((c) => c.id).join("|"),
      b.stockPile.map((c) => c.id).join("|"),
      b.discardPile.map((c) => c.id).join("|"),
    ].join(";");
    expect(aIds).toBe(bIds);
    expect(a.phase).toBe("draw");
    expect(a.finalScores).toBeNull();
    expect(chinchonPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when in draw phase and null otherwise", () => {
    expect(typeof chinchonPlugin.hint).toBe("function");
    const state = chinchonPlugin.initialState(7, S);
    const result = chinchonPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-chinchon-primary"]');
    if (result!.pulses !== undefined) {
      expect(typeof result!.pulses).toBe("number");
      expect(result!.pulses).toBeGreaterThan(0);
    }

    // Force the fall-through `return null` branch by switching out of "draw" phase.
    const notDraw: ChinchonState = { ...state, phase: "discard" };
    expect(chinchonPlugin.hint!(notDraw)).toBeNull();
  });
});
