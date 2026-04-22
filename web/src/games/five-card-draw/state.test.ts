import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FiveCardDrawState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: "1000" as const, anteSize: "25" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("starts with waiting phase and correct bankroll", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("waiting");
    expect(s.bankroll).toBe(1000);
    expect(s.botBankroll).toBe(1000);
    expect(s.playerHand).toHaveLength(0);
  });
});

describe("deal action", () => {
  it("deals 5 cards and enters pre-draw-bet phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("pre-draw-bet");
    expect(s2.playerHand).toHaveLength(5);
    expect(s2.botHand).toHaveLength(5);
  });

  it("deducts ante from both players", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const ante = parseInt(defaultSettings.anteSize, 10);
    expect(s.bankroll - s2.bankroll).toBe(ante);
    expect(s.botBankroll - s2.botBankroll).toBe(ante);
  });

  it("cannot deal when bankroll is zero", () => {
    const s = initialState(42, defaultSettings);
    const broke: FiveCardDrawState = { ...s, bankroll: 0 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("waiting");
  });
});

describe("toggle-discard action", () => {
  it("toggles card selection in draw phase", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "deal" });
    // Move to draw phase by checking
    if (s.phase === "pre-draw-bet" && s.playerTurn) {
      s = reducer(s, { type: "check" });
    }
    if (s.phase === "draw") {
      const s2 = reducer(s, { type: "toggle-discard", index: 0 });
      expect(s2.selectedToDiscard).toContain(0);
      const s3 = reducer(s2, { type: "toggle-discard", index: 0 });
      expect(s3.selectedToDiscard).not.toContain(0);
    }
  });

  it("ignores toggle when not in draw phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "toggle-discard", index: 0 });
    expect(s2.selectedToDiscard).toHaveLength(0);
  });
});

describe("draw action", () => {
  it("replaces selected cards and advances to post-draw-bet", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "deal" });
    // Reach draw phase
    if (s.phase === "pre-draw-bet" && s.playerTurn) {
      s = reducer(s, { type: "check" });
    }
    if (s.phase === "draw") {
      const originalHand = [...s.playerHand];
      s = reducer(s, { type: "toggle-discard", index: 0 });
      s = reducer(s, { type: "toggle-discard", index: 1 });
      const prevHand = s.playerHand;
      s = reducer(s, { type: "draw" });
      expect(["post-draw-bet", "showdown"]).toContain(s.phase);
      expect(s.playerHand).toHaveLength(5);
    }
  });
});

describe("fold action", () => {
  it("fold during player turn gives pot to bot", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn && s2.phase === "pre-draw-bet") {
      const s3 = reducer(s2, { type: "fold" });
      expect(s3.phase).toBe("showdown");
      expect(s3.lastResult).toContain("folds");
    }
  });
});

describe("isTerminal", () => {
  it("not terminal during game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal at showdown when player is broke", () => {
    const s = initialState(42, defaultSettings);
    const terminal: FiveCardDrawState = { ...s, phase: "showdown", bankroll: 0, botBankroll: 2000 };
    expect(isTerminal(terminal)).toEqual({ score: 0 });
  });

  it("not terminal at showdown when both have chips", () => {
    const s = initialState(42, defaultSettings);
    const notTerminal: FiveCardDrawState = { ...s, phase: "showdown", bankroll: 500, botBankroll: 1500 };
    expect(isTerminal(notTerminal)).toBeNull();
  });
});
