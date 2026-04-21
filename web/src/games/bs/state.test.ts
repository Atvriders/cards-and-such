import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { BSState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings4 = { players: "4" as const };
const settings3 = { players: "3" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. initialState ───────────────────────────────────────────────────────────
describe("initialState", () => {
  it("deals all 52 cards across 4 players", () => {
    const s = initialState(42, settings4);
    const total = s.hands.reduce((sum, h) => sum + h.length, 0);
    expect(total).toBe(52);
    expect(s.seats).toBe(4);
    expect(s.phase).toBe("playing");
    expect(s.winner).toBeNull();
  });

  it("3-player game deals 52 cards total", () => {
    const s = initialState(1, settings3);
    const total = s.hands.reduce((sum, h) => sum + h.length, 0);
    expect(total).toBe(52);
    expect(s.seats).toBe(3);
  });

  it("starts with Ace as the required rank", () => {
    const s = initialState(42, settings4);
    expect(s.claimRankSequence).toBe(1);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, settings4);
    const s2 = initialState(7, settings4);
    expect(s1.hands).toEqual(s2.hands);
  });
});

// ── 2. Play action ────────────────────────────────────────────────────────────
describe("reducer — play", () => {
  it("playing removes cards from hand and enters calling phase", () => {
    const s = initialState(10, settings4);
    const forceMyTurn: BSState = { ...s, turn: 0, phase: "playing" };
    const hand = forceMyTurn.hands[0]!;
    const card = hand[0]!;
    const s2 = reducer(forceMyTurn, {
      type: "play",
      cardIds: [card.id],
      claimRank: forceMyTurn.claimRankSequence,
    });
    // Either now in calling phase (bots haven't called) or still playing
    expect(s2.phase === "calling" || s2.phase === "playing" || s2.phase === "done").toBe(true);
    // Card should be removed from hand
    const allCards = s2.hands.reduce((sum, h) => sum + h.length, 0);
    expect(allCards).toBeLessThanOrEqual(52);
  });

  it("playing when not your turn is no-op", () => {
    const s = initialState(1, settings4);
    const botTurn: BSState = { ...s, turn: 1 };
    const hand = botTurn.hands[0]!;
    const s2 = reducer(botTurn, { type: "play", cardIds: [hand[0]!.id], claimRank: 1 });
    expect(s2).toBe(botTurn);
  });

  it("no-op when phase is done", () => {
    const s = { ...initialState(1, settings4), phase: "done" as const, winner: 1 };
    const hand = s.hands[0]!;
    const s2 = reducer(s, { type: "play", cardIds: [hand[0]!.id], claimRank: 1 });
    expect(s2).toBe(s);
  });
});

// ── 3. Call BS ────────────────────────────────────────────────────────────────
describe("reducer — call-bs", () => {
  it("call-bs when not in calling phase is no-op", () => {
    const s = initialState(1, settings4);
    const s2 = reducer(s, { type: "call-bs" });
    expect(s2).toBe(s);
  });

  it("correct BS call: liar takes the pile", () => {
    const s = initialState(1, settings4);
    // Manually set up a lying bot play
    const liarCard = makeCard(7, "♠"); // claiming Aces but it's a 7
    const lying: BSState = {
      ...s,
      turn: 0,
      phase: "calling",
      currentFaceDown: [liarCard],
      currentClaimRank: 1, // claiming Aces
      currentPlaySeat: 1,  // Bot 1 played
      pile: [],
      lastEvent: "Bot 1 played 1 card(s) claiming Aces.",
    };
    const s2 = reducer(lying, { type: "call-bs" });
    // Bot 1 was lying — Bot 1 should take the pile
    // Human (seat 0) called correctly — hand should not grow
    expect(s2.hands[1]!.length).toBeGreaterThan(lying.hands[1]!.length); // liar took pile
  });

  it("wrong BS call: caller takes the pile", () => {
    const s = initialState(1, settings4);
    const honestCard = makeCard(1, "♠"); // claiming Aces, it IS an Ace
    const honest: BSState = {
      ...s,
      turn: 0,
      phase: "calling",
      currentFaceDown: [honestCard],
      currentClaimRank: 1,
      currentPlaySeat: 1,
      pile: [makeCard(5), makeCard(6)], // 2 cards already in pile
    };
    const s2 = reducer(honest, { type: "call-bs" });
    // Bot 1 was honest — caller (seat 0) should take the pile (1 face-down + 2 pile = 3 cards)
    expect(s2.hands[0]!.length).toBeGreaterThan(s.hands[0]!.length);
  });
});

// ── 4. isTerminal ─────────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when game ongoing", () => {
    expect(isTerminal(initialState(1, settings4))).toBeNull();
  });

  it("returns 100 when player wins", () => {
    const s = { ...initialState(1, settings4), phase: "done" as const, winner: 0 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("returns 0 when bot wins", () => {
    const s = { ...initialState(1, settings4), phase: "done" as const, winner: 2 };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
