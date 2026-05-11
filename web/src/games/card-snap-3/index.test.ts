import { describe, it, expect } from "vitest";
import { cardSnap3Plugin } from "./index.js";
import type { CardSnap3State } from "./state.js";

const S = { rounds: "15" } as never;

describe("card-snap-3 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardSnap3Plugin.id).toBe("card-snap-3");
    expect(cardSnap3Plugin.title).toBe("Card Snap 3");
    expect(cardSnap3Plugin.category).toBe("cards");
    expect(cardSnap3Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardSnap3Plugin.description).toBe("string");
    expect(cardSnap3Plugin.description.length).toBeGreaterThan(0);
    expect(cardSnap3Plugin.settings).toBeDefined();
    expect(typeof cardSnap3Plugin.settings).toBe("object");
    expect(typeof cardSnap3Plugin.initialState).toBe("function");
    expect(typeof cardSnap3Plugin.reducer).toBe("function");
    expect(typeof cardSnap3Plugin.isTerminal).toBe("function");
    expect(cardSnap3Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardSnap3Plugin.initialState(42, S);
    const b = cardSnap3Plugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.pos).toBe(0);
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.history).toEqual([]);
    expect(a.phase).toBe("playing");
    expect(a.maxRounds).toBe(15);
    expect(cardSnap3Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cardSnap3Plugin.hint).toBe("function");

    const fresh = cardSnap3Plugin.initialState(7, S);
    const freshHint = cardSnap3Plugin.hint!(fresh);
    expect(freshHint).not.toBeNull();
    expect(typeof freshHint!.selector).toBe("string");
    expect(freshHint!.selector.length).toBeGreaterThan(0);
    expect(freshHint!.selector).toBe('[data-testid="hint-target-card-snap-3-flip"]');
    expect(freshHint!.pulses).toBe(3);

    // Triple in history: hint should point at the SNAP button.
    const tripleState: CardSnap3State = { ...fresh, history: [0, 13, 26] };
    const tripleHint = cardSnap3Plugin.hint!(tripleState);
    expect(tripleHint).not.toBeNull();
    expect(tripleHint!.selector).toBe('[data-testid="hint-target-card-snap-3-snap"]');
    expect(tripleHint!.pulses).toBe(3);

    // Game over: hint must be null.
    const over: CardSnap3State = { ...fresh, phase: "gameover" };
    expect(cardSnap3Plugin.hint!(over)).toBeNull();
  });
});
