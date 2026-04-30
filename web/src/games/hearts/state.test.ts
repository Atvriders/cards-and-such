import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";
import type { HeartsState } from "./state.js";

const defaultSettings = { botDifficulty: "heuristic" as const };

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

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
    phase: "playing",
    passSelection: [],
    passComplete: true,
    ...overrides,
  };
}

describe("Hearts initialState", () => {
  it("deals 13 cards each, total 52", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands.length).toBe(4);
    expect(s.hands.every(h => h.length === 13)).toBe(true);
  });

  it("starts in passing phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("passing");
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });
});

describe("Hearts passing", () => {
  it("togglePass adds/removes card from selection", () => {
    let s = initialState(1, defaultSettings);
    const c = s.hands[0]![0]!;
    s = reducer(s, { type: "togglePass", cardId: c.id });
    expect(s.passSelection).toContain(c.id);
    s = reducer(s, { type: "togglePass", cardId: c.id });
    expect(s.passSelection).not.toContain(c.id);
  });

  it("submitPass requires exactly 3 cards", () => {
    let s = initialState(1, defaultSettings);
    const before = s;
    s = reducer(s, { type: "submitPass" });
    expect(s).toBe(before); // no-op
  });

  it("submitPass moves to playing phase with 3 cards", () => {
    let s = initialState(1, defaultSettings);
    const ids = s.hands[0]!.slice(0, 3).map(c => c.id);
    for (const id of ids) s = reducer(s, { type: "togglePass", cardId: id });
    s = reducer(s, { type: "submitPass" });
    expect(s.phase).toBe("playing");
    expect(s.hands[0]!.length).toBe(13);
  });
});

describe("Hearts legalPlays", () => {
  it("first trick lead must be 2♣", () => {
    const twoClub = makeCard("♣", 2);
    const s = baseState({
      hands: [[twoClub, makeCard("♣", 5), makeCard("♠", 10)], [], [], []],
      tricksPlayed: 0,
    });
    const legal = legalPlays(s, 0, s.hands[0]!);
    expect(legal.length).toBe(1);
    expect(legal[0]!.rank).toBe(2);
  });

  it("must follow suit when possible", () => {
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

  it("cannot lead hearts before broken", () => {
    const s = baseState({
      tricksPlayed: 2,
      heartsBroken: false,
    });
    const hand: Card[] = [makeCard("♥", 5), makeCard("♣", 9)];
    const legal = legalPlays(s, 0, hand);
    expect(legal.every(c => c.suit !== "♥")).toBe(true);
  });
});

describe("Hearts trick resolution", () => {
  it("highest of led suit wins, takes the trick", () => {
    const trickWith3: HeartsState["currentTrick"] = [
      { seat: 1, card: makeCard("♣", 5, "c5") },
      { seat: 2, card: makeCard("♣", 8, "c8") },
      { seat: 3, card: makeCard("♣", 10, "c10") },
    ];
    const myCard = makeCard("♣", 3, "c3-mine");
    const s = baseState({
      turn: 0,
      leadSeat: 1,
      currentTrick: trickWith3,
      tricksPlayed: 5,
      hands: [[myCard], [], [], []],
    });
    const after = reducer(s, { type: "play", cardId: "c3-mine" });
    expect(after.takenCards[3]!.length).toBe(4);
    expect(after.leadSeat).toBe(3);
  });

  it("playing a heart sets heartsBroken", () => {
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
      hands: [[heartCard], [], [], []],
    });
    const after = reducer(s, { type: "play", cardId: "h9-mine" });
    expect(after.heartsBroken).toBe(true);
  });
});

describe("Hearts isTerminal", () => {
  it("null when not done", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("score = 26 - penalty", () => {
    const s = baseState({ handDone: true, finalScores: [5, 7, 8, 6] });
    expect(isTerminal(s)!.score).toBe(21);
  });

  it("score = 0 when penalty is 26", () => {
    const s = baseState({ handDone: true, finalScores: [26, 0, 0, 0] });
    expect(isTerminal(s)!.score).toBe(0);
  });
});
