import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays, makeWizardDeck, isWizard, isJester, cardLabel } from "./state.js";
import type { WizardState } from "./state.js";

const defaultSettings = { botDifficulty: "standard" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

const wizCard: Card = { suit: "♠", rank: 1, id: "wizard-0" };
const jestCard: Card = { suit: "♣", rank: 1, id: "jester-0" };

function basePlayState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], [], [], []],
    trumpCard: null,
    trumpSuit: "♠",
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    bids: [3, 3, 3, 3],
    tricksTaken: [0, 0, 0, 0],
    tricksPlayed: 0,
    finalScores: null,
    ...overrides,
  };
}

// ── 1. Deck ───────────────────────────────────────────────────────────────────

describe("makeWizardDeck", () => {
  it("has 60 cards", () => {
    expect(makeWizardDeck().length).toBe(60);
  });

  it("has 4 wizards and 4 jesters", () => {
    const deck = makeWizardDeck();
    expect(deck.filter(isWizard).length).toBe(4);
    expect(deck.filter(isJester).length).toBe(4);
  });

  it("cardLabel returns Wizard/Jester for specials", () => {
    expect(cardLabel(wizCard)).toBe("Wizard");
    expect(cardLabel(jestCard)).toBe("Jester");
  });
});

// ── 2. initialState ───────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 10 cards to each player", () => {
    const s = initialState(42, defaultSettings);
    for (const h of s.hands) expect(h.length).toBe(10);
  });

  it("starts in bidding phase", () => {
    expect(initialState(42, defaultSettings).phase).toBe("bidding");
  });

  it("all bids are null initially", () => {
    const s = initialState(42, defaultSettings);
    for (const b of s.bids) expect(b).toBeNull();
  });
});

// ── 3. Wizard / Jester rules ─────────────────────────────────────────────────

describe("legalPlays", () => {
  it("any card legal when leading", () => {
    const hand: Card[] = [makeCard("♣", 5), wizCard, jestCard];
    const s = basePlayState({ hands: [hand, [], [], []], currentTrick: [] });
    expect(legalPlays(s, 0).length).toBe(3);
  });

  it("Wizard and Jester always playable even when must follow suit", () => {
    const trick = [{ seat: 1, card: makeCard("♣", 8, "c8") }];
    const hand: Card[] = [makeCard("♥", 5, "h5"), wizCard]; // no clubs
    const s = basePlayState({ hands: [hand, [], [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    // No clubs, so any card is legal (including wizard)
    expect(legal.length).toBe(2);
  });

  it("must follow suit if have suit cards (special cards also allowed)", () => {
    const trick = [{ seat: 1, card: makeCard("♣", 8, "c8") }];
    const clubCard = makeCard("♣", 5, "c5");
    const hand: Card[] = [clubCard, wizCard, makeCard("♥", 9, "h9")];
    const s = basePlayState({ hands: [hand, [], [], []], currentTrick: trick });
    const legal = legalPlays(s, 0);
    // Must follow clubs OR play special
    expect(legal.some(c => c.suit === "♣")).toBe(true);
    expect(legal.some(isWizard)).toBe(true);
    expect(legal.some(c => c.suit === "♥" && !isWizard(c))).toBe(false);
  });
});

// ── 4. Bidding ────────────────────────────────────────────────────────────────

describe("bidding phase", () => {
  it("bidding transitions to playing after all bids", () => {
    const s = initialState(10, defaultSettings);
    const after = reducer(s, { type: "bid", amount: 3 });
    expect(after.phase).toBe("playing");
    expect(after.bids[0]).toBe(3);
    expect(after.bids.every(b => b !== null)).toBe(true);
  });

  it("bid is clamped to 0-10", () => {
    const s = initialState(10, defaultSettings);
    const after = reducer(s, { type: "bid", amount: 15 });
    expect(after.bids[0]).toBeLessThanOrEqual(10);
  });
});

// ── 5. Scoring ────────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("null before done", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("made bid gives positive score", () => {
    const s = basePlayState({ phase: "done", finalScores: [50, 30, 20, 40] });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(50);
  });

  it("missed bid gives lower score", () => {
    const sGood = basePlayState({ phase: "done", finalScores: [60, 0, 0, 0] });
    const sBad = basePlayState({ phase: "done", finalScores: [-40, 0, 0, 0] });
    expect(isTerminal(sGood)!.score).toBeGreaterThan(isTerminal(sBad)!.score);
  });
});

// ── 6. Full hand ──────────────────────────────────────────────────────────────

describe("full hand", () => {
  it("plays complete hand to done", () => {
    let s = initialState(7, defaultSettings);
    s = reducer(s, { type: "bid", amount: 4 });
    expect(s.phase).toBe("playing");

    let maxIter = 12;
    while (s.phase !== "done" && maxIter-- > 0) {
      const legal = legalPlays(s, 0);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.phase).toBe("done");
    expect(s.finalScores).not.toBeNull();
    expect(s.tricksTaken.reduce((a, b) => a + b, 0)).toBe(10);
  });
});
