import { describe, it, expect } from "vitest";
import { cardPyramidGrabPlugin } from "./index.js";
import type { CardPyramidGrabState } from "./state.js";

const S = { rows: "5" } as const;

describe("card-pyramid-grab plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPyramidGrabPlugin.id).toBe("card-pyramid-grab");
    expect(cardPyramidGrabPlugin.title).toBe("Card Pyramid Grab");
    expect(cardPyramidGrabPlugin.category).toBe("cards");
    expect(cardPyramidGrabPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPyramidGrabPlugin.description).toBe("string");
    expect(cardPyramidGrabPlugin.description.length).toBeGreaterThan(0);
    expect(cardPyramidGrabPlugin.settings).toBeDefined();
    expect(typeof cardPyramidGrabPlugin.settings).toBe("object");
    expect(typeof cardPyramidGrabPlugin.initialState).toBe("function");
    expect(typeof cardPyramidGrabPlugin.reducer).toBe("function");
    expect(typeof cardPyramidGrabPlugin.isTerminal).toBe("function");
    expect(cardPyramidGrabPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardPyramidGrabPlugin.initialState(42, S);
    const b = cardPyramidGrabPlugin.initialState(42, S);
    const aKey = a.pyramid.map((row) => row.join(",")).join(";");
    const bKey = b.pyramid.map((row) => row.join(",")).join(";");
    expect(aKey).toBe(bKey);
    expect(a.maxRows).toBe(5);
    expect(a.pyramid.length).toBe(5);
    expect(a.currentRow).toBe(0);
    expect(a.selectedInRow).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("picking");
    expect(cardPyramidGrabPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for active phases and null on gameover", () => {
    expect(typeof cardPyramidGrabPlugin.hint).toBe("function");
    const state = cardPyramidGrabPlugin.initialState(7, S);

    // Fresh state: no card selected yet → pick hint.
    const pickHint = cardPyramidGrabPlugin.hint!(state);
    expect(pickHint).not.toBeNull();
    expect(pickHint!.selector).toBe('[data-testid="hint-target-card-pyramid-grab-pick"]');
    expect(pickHint!.pulses).toBe(3);

    // After selecting a card in the row → next hint.
    const selectedState: CardPyramidGrabState = { ...state, selectedInRow: 0 };
    const nextHint = cardPyramidGrabPlugin.hint!(selectedState);
    expect(nextHint).not.toBeNull();
    expect(nextHint!.selector).toBe('[data-testid="hint-target-card-pyramid-grab-next"]');
    expect(nextHint!.pulses).toBe(3);

    // Gameover phase → hint returns null.
    const overState: CardPyramidGrabState = { ...state, phase: "gameover" };
    expect(cardPyramidGrabPlugin.hint!(overState)).toBeNull();
    expect(cardPyramidGrabPlugin.isTerminal(overState)).toEqual({ score: overState.score });
  });
});
