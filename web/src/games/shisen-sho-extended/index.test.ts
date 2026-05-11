import { describe, it, expect } from "vitest";
import { shisenShoExtendedPlugin } from "./index.js";

const S = {} as never;

describe("shisen-sho-extended plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(shisenShoExtendedPlugin.id).toBe("shisen-sho-extended");
    expect(shisenShoExtendedPlugin.title).toBe("Shisen-Sho (Extended)");
    expect(shisenShoExtendedPlugin.category).toBe("solitaire");
    expect(shisenShoExtendedPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof shisenShoExtendedPlugin.description).toBe("string");
    expect(shisenShoExtendedPlugin.description.length).toBeGreaterThan(0);
    expect(typeof shisenShoExtendedPlugin.howToPlay).toBe("string");
    expect(shisenShoExtendedPlugin.settings).toBeDefined();
    expect(typeof shisenShoExtendedPlugin.settings).toBe("object");
    expect(typeof shisenShoExtendedPlugin.initialState).toBe("function");
    expect(typeof shisenShoExtendedPlugin.reducer).toBe("function");
    expect(typeof shisenShoExtendedPlugin.isTerminal).toBe("function");
    expect(shisenShoExtendedPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = shisenShoExtendedPlugin.initialState(42, S);
    const b = shisenShoExtendedPlugin.initialState(42, S);
    const aIds = a.tiles.map((t) => `${t.id}:${t.face}:${t.pos.row},${t.pos.col},${t.pos.layer}`).join("|");
    const bIds = b.tiles.map((t) => `${t.id}:${t.face}:${t.pos.row},${t.pos.col},${t.pos.layer}`).join("|");
    expect(aIds).toBe(bIds);
    expect(a.tiles.length).toBe(96);
    expect(a.selectedId).toBeNull();
    expect(a.removed).toBe(0);
    expect(a.won).toBe(false);
    expect(a.gameOver).toBe(false);
    expect(shisenShoExtendedPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh deal and null when the game is terminal", () => {
    expect(typeof shisenShoExtendedPlugin.hint).toBe("function");
    const state = shisenShoExtendedPlugin.initialState(5, S);
    const result = shisenShoExtendedPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="play-restart-btn"]');
    expect(result!.pulses).toBe(3);

    // Force terminal state: a won game should make hint() return null via the isTerminal branch.
    const wonState = { ...state, won: true, moves: 10 };
    expect(shisenShoExtendedPlugin.isTerminal(wonState)).not.toBeNull();
    expect(shisenShoExtendedPlugin.hint!(wonState)).toBeNull();
  });
});
