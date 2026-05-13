import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  BOARD_LABELS,
  cellsForCard,
  isTwoEyedJack,
  isOneEyedJack,
  findNewSequenceThrough,
  HAND_SIZE,
  BOARD_SIZE,
  buildDeck,
  type SequenceFullState,
  type Card,
} from "./state.js";

const defaults = { _dummy: false };

describe("Sequence (Full)", () => {
  it("initialState is deterministic for the same seed", () => {
    const a = initialState(123, defaults);
    const b = initialState(123, defaults);
    expect(a.hands[0]).toEqual(b.hands[0]);
    expect(a.hands[1]).toEqual(b.hands[1]);
    expect(a.deck).toEqual(b.deck);
  });

  it("deals 7 cards to each player and uses two full decks", () => {
    const s = initialState(7, defaults);
    expect(s.hands[0]).toHaveLength(HAND_SIZE);
    expect(s.hands[1]).toHaveLength(HAND_SIZE);
    // 2 decks * 52 cards - 14 dealt
    expect(s.deck.length).toBe(104 - 14);
    expect(s.discard).toHaveLength(0);
  });

  it("board has 4 free corners and 48 non-J cards appearing twice", () => {
    let free = 0;
    const counts = new Map<string, number>();
    for (const lbl of BOARD_LABELS) {
      if (lbl.isFree) { free++; continue; }
      expect(lbl.card).not.toBeNull();
      expect(lbl.card!.rank).not.toBe("J");
      const k = `${lbl.card!.rank}${lbl.card!.suit}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    expect(free).toBe(4);
    expect(counts.size).toBe(48);
    for (const v of counts.values()) expect(v).toBe(2);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(1, defaults);
    expect(isTerminal(s)).toBeNull();
  });

  it("playing a card on a non-matching cell is illegal and returns the same state reference", () => {
    const s = initialState(42, defaults);
    // Find a non-J card in hand
    let handIdx = -1;
    for (let i = 0; i < s.hands[0].length; i++) {
      if (s.hands[0][i]!.rank !== "J") { handIdx = i; break; }
    }
    expect(handIdx).toBeGreaterThanOrEqual(0);
    // Choose a cell that definitely doesn't match the card (a free corner)
    const before = reducer(s, { type: "select-card", handIdx });
    const after = reducer(before, { type: "play", handIdx, cellIdx: 0 });
    // Played to a free corner with a normal card => illegal => state unchanged
    expect(after.board).toBe(before.board);
    expect(after.hands[0]).toBe(before.hands[0]);
  });

  it("playing a matching card places a chip and triggers the bot turn", () => {
    const s = initialState(99, defaults);
    let handIdx = -1;
    let cellIdx = -1;
    for (let i = 0; i < s.hands[0].length; i++) {
      const c = s.hands[0][i]!;
      if (c.rank === "J") continue;
      const matches = cellsForCard(c);
      if (matches.length > 0) {
        handIdx = i;
        cellIdx = matches[0]!;
        break;
      }
    }
    expect(handIdx).toBeGreaterThanOrEqual(0);
    const sel = reducer(s, { type: "select-card", handIdx });
    const after = reducer(sel, { type: "play", handIdx, cellIdx });
    // Chip placed
    expect(after.board[cellIdx]).toBe(0);
    // Hand still has 7 (one played, one drawn)
    expect(after.hands[0]).toHaveLength(HAND_SIZE);
    // Bot has played (turn returns to human) and bot placed something or removed something
    expect(after.turn).toBe(0);
  });

  it("a two-eyed Jack can be placed on an arbitrary empty non-corner cell", () => {
    // Construct a hand-built state to control the situation.
    const s = initialState(5, defaults);
    // Find a two-eyed Jack in the deck and swap it into the player's hand pos 0.
    let deck = s.deck.slice();
    let jIdx = -1;
    for (let i = 0; i < deck.length; i++) {
      if (isTwoEyedJack(deck[i]!)) { jIdx = i; break; }
    }
    expect(jIdx).toBeGreaterThanOrEqual(0);
    const jack = deck[jIdx]!;
    const swappedOut = s.hands[0][0]!;
    deck = deck.slice();
    deck[jIdx] = swappedOut;
    const newHand = s.hands[0].slice();
    newHand[0] = jack;
    const s2: SequenceFullState = { ...s, deck, hands: [newHand, s.hands[1]] };
    // Pick a non-free, empty target cell
    let target = -1;
    for (let i = 0; i < 100; i++) {
      if (BOARD_LABELS[i]!.isFree) continue;
      target = i; break;
    }
    const sel = reducer(s2, { type: "select-card", handIdx: 0 });
    const after = reducer(sel, { type: "play", handIdx: 0, cellIdx: target });
    expect(after.board[target]).toBe(0);
  });

  it("a two-eyed Jack cannot be placed on a free corner", () => {
    const s = initialState(6, defaults);
    // Swap a two-eyed Jack into hand position 0
    let deck = s.deck.slice();
    let jIdx = -1;
    for (let i = 0; i < deck.length; i++) {
      if (isTwoEyedJack(deck[i]!)) { jIdx = i; break; }
    }
    const jack = deck[jIdx]!;
    deck = deck.slice();
    deck[jIdx] = s.hands[0][0]!;
    const newHand = s.hands[0].slice();
    newHand[0] = jack;
    const s2: SequenceFullState = { ...s, deck, hands: [newHand, s.hands[1]] };
    const sel = reducer(s2, { type: "select-card", handIdx: 0 });
    // Try corner cellIdx = 0
    const after = reducer(sel, { type: "play", handIdx: 0, cellIdx: 0 });
    expect(after.board[0]).toBeNull();
  });

  it("findNewSequenceThrough detects a 5-in-a-row including a fresh chip", () => {
    const board: Array<0 | 1 | null> = new Array(100).fill(null);
    const locked: Array<0 | 1 | null> = new Array(100).fill(null);
    // Place 4 chips in row 4, cols 1..4 and the 5th at col 5 (the fresh one).
    for (const c of [1, 2, 3, 4]) board[4 * BOARD_SIZE + c] = 0;
    board[4 * BOARD_SIZE + 5] = 0;
    const seq = findNewSequenceThrough(board, locked, 0, 4 * BOARD_SIZE + 5);
    expect(seq).not.toBeNull();
    expect(seq).toHaveLength(5);
  });

  it("isTerminal returns the winning score after a player claims 2 sequences", () => {
    const s = initialState(0, defaults);
    const won: SequenceFullState = { ...s, winner: 0, sequences: [2, 0], phase: "done" };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: SequenceFullState = { ...s, winner: 1, sequences: [0, 2], phase: "done" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("buildDeck produces 104 cards with 8 jacks", () => {
    const d = buildDeck();
    expect(d).toHaveLength(104);
    let twoEyed = 0;
    let oneEyed = 0;
    for (const c of d) {
      if (isTwoEyedJack(c)) twoEyed++;
      if (isOneEyedJack(c)) oneEyed++;
    }
    expect(twoEyed).toBe(4);
    expect(oneEyed).toBe(4);
  });

  it("a one-eyed Jack play transitions to select-remove phase and stores the pending card", () => {
    const s = initialState(11, defaults);
    let deck = s.deck.slice();
    let jIdx = -1;
    for (let i = 0; i < deck.length; i++) {
      if (isOneEyedJack(deck[i]!)) { jIdx = i; break; }
    }
    const jack: Card = deck[jIdx]!;
    deck = deck.slice();
    deck[jIdx] = s.hands[0][0]!;
    const newHand = s.hands[0].slice();
    newHand[0] = jack;
    // Put a bot chip somewhere to remove
    const board = s.board.slice();
    board[42] = 1;
    const s2: SequenceFullState = { ...s, deck, hands: [newHand, s.hands[1]], board };
    const sel = reducer(s2, { type: "select-card", handIdx: 0 });
    const after = reducer(sel, { type: "play", handIdx: 0, cellIdx: 0 });
    expect(after.phase).toBe("select-remove");
    expect(after.pendingRemoveCard).toEqual(jack);
    // Player hand now has 6 cards (jack removed, not yet drawn)
    expect(after.hands[0]).toHaveLength(HAND_SIZE - 1);
    // Cancel returns to playing without changing chip count
    const cancelled = reducer(after, { type: "cancel-remove" });
    expect(cancelled.phase).toBe("playing");
    expect(cancelled.board[42]).toBe(1);
  });
});
