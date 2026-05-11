import { describe, it, expect } from "vitest";
import { deckscapeSoloRollPlugin } from "./index.js";

const S = {} as never;

describe("deckscape-solo-roll plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(deckscapeSoloRollPlugin.id).toBe("deckscape-solo-roll");
    expect(deckscapeSoloRollPlugin.title).toBe("Deckscape Solo Roll");
    expect(deckscapeSoloRollPlugin.category).toBe("solitaire");
    expect(deckscapeSoloRollPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof deckscapeSoloRollPlugin.description).toBe("string");
    expect(deckscapeSoloRollPlugin.description.length).toBeGreaterThan(0);
    expect(deckscapeSoloRollPlugin.settings).toBeDefined();
    expect(typeof deckscapeSoloRollPlugin.settings).toBe("object");
    expect(typeof deckscapeSoloRollPlugin.initialState).toBe("function");
    expect(typeof deckscapeSoloRollPlugin.reducer).toBe("function");
    expect(typeof deckscapeSoloRollPlugin.isTerminal).toBe("function");
    expect(deckscapeSoloRollPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = deckscapeSoloRollPlugin.initialState(42, S);
    const b = deckscapeSoloRollPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42 >>> 0);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.hand).toEqual([]);
    expect(a.lastGain).toBe(0);
    expect(a.phase).toBe("ready");
    expect(deckscapeSoloRollPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when not terminal and null when game is over", () => {
    expect(typeof deckscapeSoloRollPlugin.hint).toBe("function");
    const state = deckscapeSoloRollPlugin.initialState(7, S);
    const result = deckscapeSoloRollPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="play-restart-btn"]');
    expect(result!.pulses).toBe(3);

    const terminal = { ...state, phase: "gameover" as const };
    expect(deckscapeSoloRollPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(deckscapeSoloRollPlugin.hint!(terminal)).toBeNull();
  });
});
