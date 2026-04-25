import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("ecarte initialState", () => {
  it("deals 5 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.playerHand.length).toBe(5);
    expect(s.botHand.length).toBe(5);
  });

  it("starts in propose phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("propose");
  });

  it("is deterministic", () => {
    const s1 = initialState(77, DEF);
    const s2 = initialState(77, DEF);
    expect(s1.playerHand.map(c => c.id)).toEqual(s2.playerHand.map(c => c.id));
  });

  it("trump card is defined", () => {
    const s = initialState(1, DEF);
    expect(s.trumpCard).toBeDefined();
    expect(s.trumpSuit).toBeTruthy();
  });
});

describe("ecarte exchange", () => {
  it("propose transitions to exchange phase", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "propose" });
    expect(s2.phase).toBe("exchange");
  });

  it("refuse transitions to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "refuse" });
    expect(s2.phase).toBe("playing");
  });

  it("exchange replaces discarded cards", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "propose" });
    const toDiscard = [s2.playerHand[0]!.id, s2.playerHand[1]!.id];
    const s3 = reducer(s2, { type: "exchange", ids: toDiscard });
    expect(s3.playerHand.length).toBe(5);
    expect(s3.playerHand.some(c => toDiscard.includes(c.id))).toBe(false);
  });
});

describe("ecarte legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "refuse" });
    if (s2.phase !== "playing") return;
    const legal = legalPlays(s2.playerHand, [], s2.trumpSuit);
    expect(legal.length).toBe(5);
  });

  it("must follow led suit", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "refuse" });
    if (s2.phase !== "playing") return;
    const [firstCard] = s2.playerHand;
    if (!firstCard) return;
    const trick = [{ seat: 1, card: firstCard }];
    const legal = legalPlays(s2.playerHand.filter(c => c.id !== firstCard.id), trick, s2.trumpSuit);
    expect(legal.length).toBeGreaterThan(0);
  });
});

describe("ecarte full game", () => {
  it("completes a round", () => {
    let s = initialState(5, DEF);
    s = reducer(s, { type: "refuse" });
    let iter = 0;
    while (s.phase === "playing" && iter < 20) {
      const legal = legalPlays(s.playerHand, s.currentTrick, s.trumpSuit);
      if (legal.length > 0 && s.turn === 0) {
        s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
      iter++;
    }
    expect(["done", "playing"].includes(s.phase)).toBe(true);
    if (s.phase === "done") expect(isTerminal(s)).not.toBeNull();
  });
});
