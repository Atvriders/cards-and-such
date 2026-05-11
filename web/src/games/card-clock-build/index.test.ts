import { describe, it, expect } from "vitest";
import { cardClockBuildPlugin } from "./index.js";
import type { CardClockBuildState } from "./state.js";

const S = { dummy: false } as never;

describe("card-clock-build plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardClockBuildPlugin.id).toBe("card-clock-build");
    expect(cardClockBuildPlugin.title).toBe("Card-Clock Build");
    expect(cardClockBuildPlugin.category).toBe("cards");
    expect(cardClockBuildPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardClockBuildPlugin.description).toBe("string");
    expect(cardClockBuildPlugin.description.length).toBeGreaterThan(0);
    expect(cardClockBuildPlugin.settings).toBeDefined();
    expect(typeof cardClockBuildPlugin.settings).toBe("object");
    expect(typeof cardClockBuildPlugin.initialState).toBe("function");
    expect(typeof cardClockBuildPlugin.reducer).toBe("function");
    expect(typeof cardClockBuildPlugin.isTerminal).toBe("function");
    expect(cardClockBuildPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardClockBuildPlugin.initialState(42, S);
    const b = cardClockBuildPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.deck.length).toBe(52);
    expect(a.pos).toBe(0);
    expect(a.current).toBeNull();
    expect(a.phase).toBe("play");
    expect(a.score).toBe(0);
    expect(cardClockBuildPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget pointing at draw, slot, or skip; null when done", () => {
    expect(typeof cardClockBuildPlugin.hint).toBe("function");
    const state = cardClockBuildPlugin.initialState(5, S);

    // current === null on a fresh state, so hint should target the draw button.
    const drawHint = cardClockBuildPlugin.hint!(state);
    expect(drawHint).not.toBeNull();
    expect(drawHint!.selector).toBe('[data-testid="hint-target-card-clock-build-draw"]');
    expect(drawHint!.pulses).toBe(3);

    // After drawing, hint should target either a slot or the skip button.
    const drawn = cardClockBuildPlugin.reducer(state, { type: "draw" });
    expect(drawn.current).not.toBeNull();
    const postDrawHint = cardClockBuildPlugin.hint!(drawn);
    expect(postDrawHint).not.toBeNull();
    expect(postDrawHint!.selector).toMatch(
      /^\[data-testid="hint-target-card-clock-build-(slot-\d+|skip)"\]$/,
    );
    expect(postDrawHint!.pulses).toBe(3);

    // When phase is "done", hint must return null.
    const done: CardClockBuildState = { ...state, phase: "done" };
    expect(cardClockBuildPlugin.hint!(done)).toBeNull();
  });
});
