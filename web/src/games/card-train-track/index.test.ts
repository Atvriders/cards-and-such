import { describe, it, expect } from "vitest";
import { cardTrainTrackPlugin } from "./index.js";
import type { CardTrainTrackState } from "./state.js";

const S = { dummy: false } as never;

describe("card-train-track plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardTrainTrackPlugin.id).toBe("card-train-track");
    expect(cardTrainTrackPlugin.title).toBe("Card Train Track");
    expect(cardTrainTrackPlugin.category).toBe("cards");
    expect(cardTrainTrackPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardTrainTrackPlugin.description).toBe("string");
    expect(cardTrainTrackPlugin.description.length).toBeGreaterThan(0);
    expect(cardTrainTrackPlugin.settings).toBeDefined();
    expect(typeof cardTrainTrackPlugin.settings).toBe("object");
    expect(typeof cardTrainTrackPlugin.initialState).toBe("function");
    expect(typeof cardTrainTrackPlugin.reducer).toBe("function");
    expect(typeof cardTrainTrackPlugin.isTerminal).toBe("function");
    expect(cardTrainTrackPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardTrainTrackPlugin.initialState(42, S);
    const b = cardTrainTrackPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.card).toBeNull();
    expect(a.score).toBe(0);
    expect(a.lastPts).toBe(0);
    expect(a.phase).toBe("draw");
    expect(cardTrainTrackPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof cardTrainTrackPlugin.hint).toBe("function");
    const state = cardTrainTrackPlugin.initialState(5, S);
    const result = cardTrainTrackPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-train-track-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const done: CardTrainTrackState = { ...state, phase: "done" };
    expect(cardTrainTrackPlugin.isTerminal(done)).toEqual({ score: state.score });
    expect(cardTrainTrackPlugin.hint!(done)).toBeNull();
  });
});
