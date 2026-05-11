import { describe, it, expect } from "vitest";
import { cardPickBetPlugin } from "./index.js";
import type { CardPickBetState } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-pick-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPickBetPlugin.id).toBe("card-pick-bet");
    expect(cardPickBetPlugin.title).toBe("Card Pick Bet");
    expect(cardPickBetPlugin.category).toBe("cards");
    expect(cardPickBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPickBetPlugin.description).toBe("string");
    expect(cardPickBetPlugin.description.length).toBeGreaterThan(0);
    expect(cardPickBetPlugin.settings).toBeDefined();
    expect(typeof cardPickBetPlugin.settings).toBe("object");
    expect(typeof cardPickBetPlugin.initialState).toBe("function");
    expect(typeof cardPickBetPlugin.reducer).toBe("function");
    expect(typeof cardPickBetPlugin.isTerminal).toBe("function");
    expect(cardPickBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardPickBetPlugin.initialState(42, S);
    const b = cardPickBetPlugin.initialState(42, S);
    expect(a.deck).toEqual(b.deck);
    expect(a.topCard).toBe(b.topCard);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.totalRounds).toBe(10);
    expect(a.phase).toBe("playing");
    expect(a.bet).toBeNull();
    expect(a.nextCard).toBeNull();
    expect(cardPickBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null otherwise", () => {
    expect(typeof cardPickBetPlugin.hint).toBe("function");
    const playing = cardPickBetPlugin.initialState(7, S);
    const result = cardPickBetPlugin.hint!(playing);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-pick-bet-primary"]');
      expect(result.pulses).toBe(3);
    }

    const revealed: CardPickBetState = { ...playing, phase: "revealed" };
    expect(cardPickBetPlugin.hint!(revealed)).toBeNull();

    const gameover: CardPickBetState = { ...playing, phase: "gameover" };
    expect(cardPickBetPlugin.hint!(gameover)).toBeNull();
  });
});
