import { describe, it, expect } from "vitest";
import { acesAndFacesPlugin } from "./index.js";
import type { AcesAndFacesState } from "./state.js";

const S = { dummy: false } as const;

describe("aces-and-faces plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(acesAndFacesPlugin.id).toBe("aces-and-faces");
    expect(acesAndFacesPlugin.title).toBe("Aces and Faces (VP)");
    expect(acesAndFacesPlugin.category).toBe("cards");
    expect(acesAndFacesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof acesAndFacesPlugin.description).toBe("string");
    expect(acesAndFacesPlugin.description.length).toBeGreaterThan(0);
    expect(typeof acesAndFacesPlugin.howToPlay).toBe("string");
    expect(acesAndFacesPlugin.settings).toBeDefined();
    expect(typeof acesAndFacesPlugin.initialState).toBe("function");
    expect(typeof acesAndFacesPlugin.reducer).toBe("function");
    expect(typeof acesAndFacesPlugin.isTerminal).toBe("function");
    expect(acesAndFacesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = acesAndFacesPlugin.initialState(123, S);
    const b = acesAndFacesPlugin.initialState(123, S);
    expect(a).toEqual(b);
    expect(a.phase).toBe("deal");
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.hand).toEqual([]);
    expect(acesAndFacesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget for deal/scored phases and null when terminal", () => {
    expect(typeof acesAndFacesPlugin.hint).toBe("function");

    const dealState = acesAndFacesPlugin.initialState(7, S);
    const dealHint = acesAndFacesPlugin.hint!(dealState);
    expect(dealHint).not.toBeNull();
    expect(dealHint!.selector).toBe('[data-testid="hint-target-aces-and-faces-deal"]');
    expect(dealHint!.pulses).toBe(3);

    const scoredState: AcesAndFacesState = { ...dealState, phase: "scored" };
    const scoredHint = acesAndFacesPlugin.hint!(scoredState);
    expect(scoredHint).not.toBeNull();
    expect(scoredHint!.selector).toBe('[data-testid="hint-target-aces-and-faces-next"]');
    expect(scoredHint!.pulses).toBe(3);

    const doneState: AcesAndFacesState = { ...dealState, phase: "done" };
    expect(acesAndFacesPlugin.hint!(doneState)).toBeNull();
  });
});
