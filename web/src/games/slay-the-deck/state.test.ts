import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Slay the Deck", () => {
  it("initializes act 1 with 5 cards in hand", () => {
    const s = initialState(1);
    expect(s.act).toBe(1);
    expect(s.hand.length).toBe(5);
    expect(s.playerHp).toBe(40);
    expect(s.phase).toBe("player");
  });

  it("playing a strike card deals damage", () => {
    const s = initialState(42);
    const strikeCard = s.hand.find(c => c.type === "strike");
    if (!strikeCard) return;
    const s2 = reducer(s, { type: "playCard", id: strikeCard.id });
    expect(s2.enemy.hp).toBeLessThan(s.enemy.hp);
    expect(s2.energy).toBe(s.energy - strikeCard.cost);
  });

  it("playing a block card increases block", () => {
    const s = initialState(1);
    const blockCard = s.hand.find(c => c.type === "block");
    if (!blockCard) return;
    const s2 = reducer(s, { type: "playCard", id: blockCard.id });
    expect(s2.block).toBeGreaterThan(0);
  });

  it("end turn causes enemy to attack", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "endTurn" });
    if (s2.phase !== "dead") {
      expect(s2.playerHp).toBeLessThan(s.playerHp);
    }
  });

  it("nextAct advances from reward", () => {
    const s = { ...initialState(1), phase: "reward" as const, act: 1 };
    const s2 = reducer(s, { type: "nextAct" });
    expect(s2.act).toBe(2);
    expect(s2.phase).toBe("player");
  });

  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal score when won", () => {
    const s = { ...initialState(1), phase: "won" as const, playerHp: 30 };
    const r = isTerminal(s);
    expect(r!.score).toBe(160);
  });

  it("isTerminal score when dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, act: 3 };
    const r = isTerminal(s);
    expect(r!.score).toBe(36);
  });
});
