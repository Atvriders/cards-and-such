import { describe, it, expect } from "vitest";
import { cardPickThreePlugin } from "./index.js";
import type { CardPickThreeState } from "./state.js";

const S = { rounds: "10" as const };

describe("card-pick-three plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPickThreePlugin.id).toBe("card-pick-three");
    expect(cardPickThreePlugin.title).toBe("Card Pick Three");
    expect(cardPickThreePlugin.category).toBe("cards");
    expect(cardPickThreePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPickThreePlugin.description).toBe("string");
    expect(cardPickThreePlugin.description.length).toBeGreaterThan(0);
    expect(cardPickThreePlugin.settings).toBeDefined();
    expect(typeof cardPickThreePlugin.initialState).toBe("function");
    expect(typeof cardPickThreePlugin.reducer).toBe("function");
    expect(typeof cardPickThreePlugin.isTerminal).toBe("function");
    expect(cardPickThreePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardPickThreePlugin.initialState(42, S);
    const b = cardPickThreePlugin.initialState(42, S);
    expect(a.hand).toEqual(b.hand);
    expect(a.deck).toEqual(b.deck);
    expect(a.phase).toBe("picking");
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.picked).toEqual([]);
    expect(a.coins).toBe(0);
    expect(cardPickThreePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while picking and null otherwise", () => {
    expect(typeof cardPickThreePlugin.hint).toBe("function");
    const state = cardPickThreePlugin.initialState(7, S);
    const result = cardPickThreePlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-pick-three-primary"]');
    expect(result!.pulses).toBe(3);

    const nonPicking: CardPickThreeState = { ...state, phase: "result" };
    expect(cardPickThreePlugin.hint!(nonPicking)).toBeNull();
    const over: CardPickThreeState = { ...state, phase: "gameover" };
    expect(cardPickThreePlugin.hint!(over)).toBeNull();
  });
});
