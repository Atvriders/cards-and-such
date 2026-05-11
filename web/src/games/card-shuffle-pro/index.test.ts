import { describe, it, expect } from "vitest";
import { cardShuffleProPlugin } from "./index.js";

const S = { difficulty: "normal" as const };

describe("card-shuffle-pro plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardShuffleProPlugin.id).toBe("card-shuffle-pro");
    expect(cardShuffleProPlugin.title).toBe("Card Shuffle Pro");
    expect(cardShuffleProPlugin.category).toBe("cards");
    expect(cardShuffleProPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardShuffleProPlugin.description).toBe("string");
    expect(cardShuffleProPlugin.description.length).toBeGreaterThan(0);
    expect(cardShuffleProPlugin.settings).toBeDefined();
    expect(typeof cardShuffleProPlugin.settings).toBe("object");
    expect(typeof cardShuffleProPlugin.initialState).toBe("function");
    expect(typeof cardShuffleProPlugin.reducer).toBe("function");
    expect(typeof cardShuffleProPlugin.isTerminal).toBe("function");
    expect(cardShuffleProPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardShuffleProPlugin.initialState(42, S);
    const b = cardShuffleProPlugin.initialState(42, S);
    const aSig =
      a.hand.map((c) => `${c.suit}${c.rank}`).join(",") +
      "|" +
      `${a.next.suit}${a.next.rank}`;
    const bSig =
      b.hand.map((c) => `${c.suit}${c.rank}`).join(",") +
      "|" +
      `${b.next.suit}${b.next.rank}`;
    expect(aSig).toBe(bSig);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.revealed).toBe(false);
    expect(a.phase).toBe("guess");
    expect(a.hand).toHaveLength(5);
    expect(cardShuffleProPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget with the appropriate selector for the current phase", () => {
    expect(typeof cardShuffleProPlugin.hint).toBe("function");
    const state = cardShuffleProPlugin.initialState(7, S);
    const preReveal = cardShuffleProPlugin.hint!(state);
    expect(preReveal).not.toBeNull();
    expect(preReveal!.selector).toBe('[data-testid="hint-target-card-shuffle-pro-red"]');
    expect(preReveal!.pulses).toBe(3);

    const revealedState = { ...state, revealed: true };
    const postReveal = cardShuffleProPlugin.hint!(revealedState);
    expect(postReveal).not.toBeNull();
    expect(postReveal!.selector).toBe('[data-testid="hint-target-card-shuffle-pro-next"]');
    expect(postReveal!.pulses).toBe(3);
  });
});
