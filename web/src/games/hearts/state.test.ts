import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { HeartsState } from "./state.js";

const defaultSettings = { botDifficulty: "heuristic" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

function makeHand(cards: Card[]): readonly Card[] {
  return cards;
}

// ── helper: build minimal state for unit tests ─────────────────────────────

function baseState(overrides: Partial<HeartsState> = {}): HeartsState {
  return {
    settings: defaultSettings,
    rngSeed: 1,
    hands: [[], [], [], []],
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    heartsBroken: false,
    tricksPlayed: 0,
    takenCards: [[], [], [], []],
    handDone: false,
    finalScores: null,
    ...overrides,
  };
}

// ── 1. Initial state ────────────────────────────────────────────────────────

describe("initialState", () => {
  it("total cards in play is 52 (hands + trick + taken)", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands.length).toBe(4);
    const inHands = s.hands.reduce((n, h) => n + h.length, 0);
    const inTrick = s.currentTrick.length;
    const inTaken = s.takenCards.reduce((n, t) => n + t.length, 0);
    expect(inHands + inTrick + inTaken).toBe(52);
  });

  it("seat 0 always acts first (turn === 0 after initialState)", () => {
    // After initialState, any bot leads are auto-played so it's always seat 0's turn
    for (const seed of [1, 2, 3, 42, 99, 123]) {
      const s = initialState(seed, defaultSettings);
      expect(s.turn).toBe(0);
    }
  });

  it("leadSeat holds 2♣ or it was consumed (if bot led first)", () => {
    // leadSeat should be valid (0-3)
    const s = initialState(42, defaultSettings);
    expect(s.leadSeat).toBeGreaterThanOrEqual(0);
    expect(s.leadSeat).toBeLessThanOrEqual(3);
  });

  it("heartsBroken starts false, tricksPlayed starts 0 or 1 (if bots led first trick)", () => {
    const s = initialState(42, defaultSettings);
    // heartsBroken can't be true after at most 1 trick (no hearts on first trick)
    expect(s.heartsBroken).toBe(false);
    expect(s.tricksPlayed).toBeLessThanOrEqual(1);
  });
});

// ── 2. Deterministic under seed ─────────────────────────────────────────────

describe("determinism", () => {
  it("same seed produces same initial state", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
    expect(s1.leadSeat).toBe(s2.leadSeat);
  });

  it("different seeds produce different states (sanity)", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    // Very unlikely to be identical
    const same = s1.hands[0]!.every((c, i) => c.id === s2.hands[0]![i]?.id);
    expect(same).toBe(false);
  });
});

// ── 3. First trick: legalPlays for leader returns only 2♣ ───────────────────

describe("legalPlays - first trick lead", () => {
  it("leader's only legal play on trick 0 is 2♣", () => {
    const twoClub = makeCard("♣", 2);
    const s = baseState({
      hands: [
        [twoClub, makeCard("♣", 5), makeCard("♠", 10)],
        [], [], [],
      ],
      tricksPlayed: 0,
      currentTrick: [],
      leadSeat: 0,
      turn: 0,
    });
    const legal = legalPlays(s, 0, s.hands[0]!);
    expect(legal.length).toBe(1);
    expect(legal[0]!.suit).toBe("♣");
    expect(legal[0]!.rank).toBe(2);
  });
});

// ── 4. Must follow suit ─────────────────────────────────────────────────────

describe("legalPlays - follow suit", () => {
  it("must play a club when clubs are led and hand has clubs", () => {
    const s = baseState({
      tricksPlayed: 2,
      currentTrick: [{ seat: 1, card: makeCard("♣", 8) }],
      heartsBroken: true,
    });
    const hand: Card[] = [makeCard("♣", 3), makeCard("♣", 7), makeCard("♥", 5)];
    const legal = legalPlays(s, 0, hand);
    expect(legal.every(c => c.suit === "♣")).toBe(true);
    expect(legal.length).toBe(2);
  });
});

// ── 5. Out of suit: first trick restricts hearts and Q♠ ────────────────────

describe("legalPlays - out of suit", () => {
  it("on first trick cannot play heart or Q♠ if other cards available", () => {
    const qs = makeCard("♠", 12);
    const heart = makeCard("♥", 5);
    const safe = makeCard("♦", 3);
    const s = baseState({
      tricksPlayed: 0,
      currentTrick: [{ seat: 1, card: makeCard("♣", 2) }], // clubs led
    });
    const hand: Card[] = [qs, heart, safe]; // no clubs
    const legal = legalPlays(s, 0, hand);
    expect(legal.some(c => c.suit === "♥")).toBe(false);
    expect(legal.some(c => c.suit === "♠" && c.rank === 12)).toBe(false);
    expect(legal).toContainEqual(safe);
  });

  it("can play anything if only penalty cards remain on first trick", () => {
    const qs = makeCard("♠", 12);
    const heart = makeCard("♥", 5);
    const s = baseState({
      tricksPlayed: 0,
      currentTrick: [{ seat: 1, card: makeCard("♣", 2) }],
    });
    const hand: Card[] = [qs, heart];
    const legal = legalPlays(s, 0, hand);
    expect(legal.length).toBe(2);
  });
});

// ── 6. Leading hearts ───────────────────────────────────────────────────────

describe("legalPlays - leading hearts", () => {
  it("cannot lead hearts if not broken and non-hearts available", () => {
    const s = baseState({
      tricksPlayed: 2,
      heartsBroken: false,
      currentTrick: [],
    });
    const hand: Card[] = [makeCard("♥", 5), makeCard("♥", 10), makeCard("♣", 9)];
    const legal = legalPlays(s, 0, hand);
    expect(legal.every(c => !( c.suit === "♥"))).toBe(true);
  });

  it("can lead hearts if heartsBroken", () => {
    const s = baseState({
      tricksPlayed: 2,
      heartsBroken: true,
      currentTrick: [],
    });
    const hand: Card[] = [makeCard("♥", 5), makeCard("♣", 9)];
    const legal = legalPlays(s, 0, hand);
    expect(legal.some(c => c.suit === "♥")).toBe(true);
  });

  it("can lead hearts if hand is all hearts", () => {
    const s = baseState({
      tricksPlayed: 2,
      heartsBroken: false,
      currentTrick: [],
    });
    const hand: Card[] = [makeCard("♥", 5), makeCard("♥", 10)];
    const legal = legalPlays(s, 0, hand);
    expect(legal.length).toBe(2);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
  });
});

// ── 7. Trick resolution: highest of led suit wins ──────────────────────────

describe("trick resolution", () => {
  it("highest club wins when clubs are led", () => {
    // Use initialState so seat 0 has 2♣ and leads
    const s0 = initialState(7, defaultSettings);
    // Play through one full trick by dispatching the 2♣ from lead seat
    // We do this via a full game. Instead, test with manual state.
    // Build a state where it's seat 0's turn, trick has 3 cards already
    const trickBefore: HeartsState["currentTrick"] = [
      { seat: 3, card: makeCard("♣", 5, "♣5-x") },
      { seat: 0, card: makeCard("♣", 8, "♣8-x") }, // we'll simulate seat 1 leading
      { seat: 1, card: makeCard("♣", 10, "♣10-x") },
    ];
    // It's seat 2's turn to play the 4th card
    const c4 = makeCard("♣", 3, "♣3-my");
    const s = baseState({
      turn: 2,
      leadSeat: 3,
      currentTrick: trickBefore,
      tricksPlayed: 1,
      heartsBroken: false,
      hands: [
        [],
        [],
        [c4],
        [],
      ],
      takenCards: [[], [], [], []],
    });
    // Manually build a post-trick state by calling reducer with a bot seat —
    // but reducer only lets seat 0 play. Instead test resolution logic via
    // a full dispatch where seat 0 plays the finishing card.
    // Simpler: build trick where seat 0 plays the last card.
    const trickWith3: HeartsState["currentTrick"] = [
      { seat: 1, card: makeCard("♣", 5, "c5") },
      { seat: 2, card: makeCard("♣", 8, "c8") },
      { seat: 3, card: makeCard("♣", 10, "c10") },
    ];
    const myCard = makeCard("♣", 3, "c3-mine");
    const s2 = baseState({
      turn: 0,
      leadSeat: 1,
      currentTrick: trickWith3,
      tricksPlayed: 5,
      heartsBroken: false,
      hands: [[myCard], [], [], []],
      takenCards: [[], [], [], []],
    });
    const after = reducer(s2, { type: "play", cardId: "c3-mine" });
    // seat 3 played ♣10 (highest), so seat 3 should win
    expect(after.takenCards[3]!.length).toBe(4);
    expect(after.leadSeat).toBe(3);
  });
});

// ── 8. Heart in trick sets heartsBroken ─────────────────────────────────────

describe("heartsBroken", () => {
  it("playing a heart on a trick sets heartsBroken", () => {
    // 3 cards already in trick (trick 3), seat 0 discards a heart (not following suit)
    const trick3: HeartsState["currentTrick"] = [
      { seat: 1, card: makeCard("♣", 5, "c5") },
      { seat: 2, card: makeCard("♣", 8, "c8") },
      { seat: 3, card: makeCard("♣", 10, "c10") },
    ];
    const heartCard = makeCard("♥", 9, "h9-mine");
    const s = baseState({
      turn: 0,
      leadSeat: 1,
      currentTrick: trick3,
      tricksPlayed: 3,
      heartsBroken: false,
      hands: [[heartCard], [], [], []],
      takenCards: [[], [], [], []],
    });
    const after = reducer(s, { type: "play", cardId: "h9-mine" });
    expect(after.heartsBroken).toBe(true);
  });
});

// ── 9. Q♠ adds 13 penalty points ───────────────────────────────────────────

describe("Q♠ scoring", () => {
  it("Q♠ in trick taken by seat adds 13 penalty to that seat", () => {
    // Build a state where trick 12 is happening (last trick before hand end)
    // 3 cards already, seat 0 wins the trick containing Q♠
    const qs = makeCard("♠", 12, "qs");
    const trick: HeartsState["currentTrick"] = [
      { seat: 1, card: qs },
      { seat: 2, card: makeCard("♦", 3, "d3") },
      { seat: 3, card: makeCard("♦", 5, "d5") },
    ];
    // Seat 0 leads a spade, will win with the highest (simulate seat 0 led spades)
    // Actually trick[0] determines led suit — so led is ♠ from seat 1 (leadSeat=1)
    // Seat 0 plays ♠K to win
    const spadeK = makeCard("♠", 13, "sk-mine");
    // We need hearts in taken so final score triggers
    // Just test with tricksPlayed=12 so it ends
    const s = baseState({
      turn: 0,
      leadSeat: 1,
      currentTrick: trick,
      tricksPlayed: 12,
      heartsBroken: true,
      hands: [[spadeK], [], [], []],
      // Give each seat some taken cards; seat 0 takes this trick
      takenCards: [[], [], [], []],
    });
    const after = reducer(s, { type: "play", cardId: "sk-mine" });
    // The trick winner is highest of ♠: seat 0 played ♠K (rank 13), seat 1 played ♠Q (rank 12)
    // So seat 0 wins
    expect(after.handDone).toBe(true);
    expect(after.finalScores).not.toBeNull();
    expect(after.finalScores![0]).toBe(13); // Q♠ taken by seat 0
  });
});

// ── 10. Shoot the moon ──────────────────────────────────────────────────────

describe("shoot the moon", () => {
  it("if seat 1 takes all 26 points, seat 1 gets 0 and others get 26", () => {
    // Build a hand-done state directly and test finalScores logic
    // We'll create a post-state by manipulating takenCards then calling reducer
    // with a dummy last card that makes seat 1 win the final trick.

    // Easier: build state where hand is about to end, seat 1 already has
    // all 13 hearts + Q♠, trick[0] is led by seat 1.
    const hearts13 = Array.from({ length: 13 }, (_, i) =>
      makeCard("♥", (i + 1) as Card["rank"], `h${i + 1}`)
    );
    const qs2 = makeCard("♠", 12, "qs2");
    const lastCard = makeCard("♣", 2, "c2-final");

    // seat 0 has 1 card left; seat 1 already has all penalty cards; trick has 3 cards with seat 1 winning
    const trick: HeartsState["currentTrick"] = [
      { seat: 1, card: makeCard("♣", 9, "c9") },
      { seat: 2, card: makeCard("♣", 3, "c3") },
      { seat: 3, card: makeCard("♣", 4, "c4") },
    ];
    const s = baseState({
      turn: 0,
      leadSeat: 1,
      currentTrick: trick,
      tricksPlayed: 12,
      heartsBroken: true,
      hands: [[lastCard], [], [], []],
      takenCards: [
        [],
        [...hearts13, qs2],
        [],
        [],
      ],
    });
    const after = reducer(s, { type: "play", cardId: "c2-final" });
    expect(after.handDone).toBe(true);
    // seat 1 wins (♣9 highest); adds c2-final (no penalty) to seat 1's taken
    // seat 1 has all 26 points → shoot the moon
    expect(after.finalScores![1]).toBe(0);
    expect(after.finalScores![0]).toBe(26);
    expect(after.finalScores![2]).toBe(26);
    expect(after.finalScores![3]).toBe(26);
  });
});

// ── 11. isTerminal ──────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when hand not done", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score = 26 - penalty when handDone", () => {
    const s = baseState({
      handDone: true,
      finalScores: [5, 7, 8, 6], // seat 0 has 5 penalty points → score = 21
    });
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBe(21);
  });

  it("returns score = 26 when player penalty is 0", () => {
    const s = baseState({
      handDone: true,
      finalScores: [0, 26, 0, 0],
    });
    expect(isTerminal(s)!.score).toBe(26);
  });

  it("returns score = 0 when player penalty is 26", () => {
    const s = baseState({
      handDone: true,
      finalScores: [26, 0, 0, 0],
    });
    expect(isTerminal(s)!.score).toBe(0);
  });
});

// ── 12. Full hand completes ─────────────────────────────────────────────────

describe("full game playthrough", () => {
  it("plays a complete hand to done without errors (random bot)", () => {
    let s = initialState(123, { botDifficulty: "random" });
    // After initialState, turn is always 0 (bots auto-play if they lead first)
    expect(s.turn).toBe(0);
    let maxIter = 15; // at most 13 human plays
    while (!s.handDone && maxIter-- > 0) {
      const legal = legalPlays(s, 0, s.hands[0]!);
      expect(legal.length).toBeGreaterThan(0);
      s = reducer(s, { type: "play", cardId: legal[0]!.id });
    }
    expect(s.handDone).toBe(true);
    expect(s.finalScores).not.toBeNull();
    // After a full hand, total penalties = 26 (normal) or 26*4 (shoot-the-moon)
    const total = s.finalScores!.reduce((a, b) => a + b, 0);
    expect(total === 26 || total === 26 * 4).toBe(true);
  });
});
