import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Dungeon Delve", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.room).toBe(1);
    expect(s.playerHp).toBe(50);
    expect(s.energy).toBe(3);
    expect(s.hand.length).toBe(5);
    expect(s.phase).toBe("combat");
  });

  it("playing a card costs energy", () => {
    const s = initialState(42);
    const strikeCard = s.hand.find(c => c.type === "strike");
    if (!strikeCard) return; // no strike in hand, skip
    const s2 = reducer(s, { type: "playCard", cardId: strikeCard.id });
    expect(s2.energy).toBe(s.energy - strikeCard.cost);
    expect(s2.hand.length).toBe(4);
    expect(s2.discard.some(c => c.id === strikeCard.id)).toBe(true);
  });

  it("playing card with insufficient energy does nothing", () => {
    const s = { ...initialState(42), energy: 0 };
    const nonRageCard = s.hand.find(c => c.type !== "rage");
    if (!nonRageCard) return;
    const s2 = reducer(s, { type: "playCard", cardId: nonRageCard.id });
    expect(s2.energy).toBe(0);
    expect(s2.hand.length).toBe(s.hand.length);
  });

  it("shield card adds block", () => {
    const s = initialState(42);
    const shieldCard = s.hand.find(c => c.type === "shield");
    if (!shieldCard) return;
    const s2 = reducer(s, { type: "playCard", cardId: shieldCard.id });
    expect(s2.block).toBeGreaterThan(0);
  });

  it("end turn draws new hand", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endTurn" });
    if (s2.phase === "combat") {
      expect(s2.hand.length).toBe(5);
      expect(s2.block).toBe(0);
      expect(s2.energy).toBe(s.maxEnergy);
    }
  });

  it("enemy death triggers reward phase", () => {
    const s = { ...initialState(42), enemy: { ...initialState(42).enemy, hp: 1, maxHp: 1, attack: 1, name: "Weak", poisoned: 0 } };
    const strikeCard = s.hand.find(c => c.type === "strike");
    if (!strikeCard) return;
    const s2 = reducer(s, { type: "playCard", cardId: strikeCard.id });
    // End turn should kill enemy (hp <= 0 after play)
    if (s2.enemy.hp <= 0) {
      const s3 = reducer(s2, { type: "endTurn" });
      expect(s3.phase === "reward" || s3.phase === "done").toBe(true);
    }
  });

  it("nextRoom advances room from reward phase", () => {
    const s = { ...initialState(42), phase: "reward" as const, room: 1 };
    const s2 = reducer(s, { type: "nextRoom" });
    expect(s2.room).toBe(2);
    expect(s2.phase).toBe("combat");
  });

  it("isTerminal returns score on done", () => {
    const s = { ...initialState(42), phase: "done" as const };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(100);
  });

  it("isTerminal returns score on dead", () => {
    const s = { ...initialState(42), phase: "dead" as const, room: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("isTerminal null during combat", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
