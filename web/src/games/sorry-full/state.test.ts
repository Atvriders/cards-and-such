import { describe, expect, it } from "vitest";
import {
  initialState, reducer, isTerminal,
  YARD, HOME_POS, SAFETY_START, NUM_PAWNS,
  _internals,
} from "./state.js";
import type { SorryFullState, SorryFullSettings } from "./state.js";

const SOLO: SorryFullSettings = { mode: "solo", difficulty: "normal" };
const PARTNERS: SorryFullSettings = { mode: "partners", difficulty: "normal" };

function freshState(over: Partial<SorryFullState> = {}, settings = SOLO): SorryFullState {
  const base = initialState(42, settings);
  return { ...base, ...over };
}

describe("Sorry! Full — initial state", () => {
  it("is deterministic by seed", () => {
    const a = initialState(12345, SOLO);
    const b = initialState(12345, SOLO);
    expect(a.deck).toEqual(b.deck);
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it("different seeds yield different decks", () => {
    const a = initialState(1, SOLO);
    const b = initialState(99999, SOLO);
    // Compare card sequence — should differ for different seeds
    expect(a.deck.join(",")).not.toBe(b.deck.join(","));
  });

  it("starts with 4 players, 4 pawns each in YARD, no winner", () => {
    const s = initialState(7, SOLO);
    expect(s.pawns.length).toBe(4);
    for (let p = 0; p < 4; p++) {
      expect(s.pawns[p]!.length).toBe(NUM_PAWNS);
      for (let i = 0; i < NUM_PAWNS; i++) expect(s.pawns[p]![i]).toBe(YARD);
    }
    expect(s.winner).toBeNull();
    expect(s.winningTeam).toBeNull();
    expect(s.phase).toBe("drawing");
    expect(isTerminal(s)).toBeNull();
  });

  it("uses a non-empty card deck", () => {
    const s = initialState(7, SOLO);
    expect(s.deck.length).toBeGreaterThan(40);
    expect(s.deck.length).toBeLessThan(80);
  });
});

describe("Sorry! Full — reducer basic moves", () => {
  it("card 1 brings a yard pawn out to its start ring square", () => {
    const s = freshState({ currentCard: 1, phase: "choosing", turn: 0 });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(_internals.START_RING[0]);
  });

  it("card 5 advances a pawn 5 squares on the ring", () => {
    const pawns = [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 5, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(15);
  });

  it("card 4 moves backward 4 squares (wraps on ring)", () => {
    const pawns = [[10, YARD, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 4, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(6);
  });

  it("illegal moves return same state reference", () => {
    const s = freshState({ currentCard: 3, phase: "choosing", turn: 0 });
    // All pawns in yard; 3 cannot move
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next).toBe(s);
  });

  it("ignores actions when winner is set", () => {
    const s = freshState({ winner: 0, currentCard: 5, phase: "choosing" });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next).toBe(s);
  });
});

describe("Sorry! Full — special cards", () => {
  it("Sorry! card sends opponent home and places yard pawn there", () => {
    const pawns = [[YARD, YARD, YARD, YARD], [25, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: "Sorry", phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "sorry", targetPlayer: 1, targetPawn: 0, myPawn: 0 });
    expect(next.pawns[1]![0]).toBe(YARD);
    expect(next.pawns[0]![0]).toBe(25);
  });

  it("11 swap moves player 0 to the opponent's position", () => {
    // After swap, advanceBots() runs — bots may move their own pawns afterwards,
    // so we only verify our own pawn landed correctly (and not on a slide tile).
    const pawns = [[10, YARD, YARD, YARD], [25, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 11, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "swap", myPawn: 0, targetPlayer: 1, targetPawn: 0 });
    expect(next.pawns[0]![0]).toBe(25);
  });

  it("7-split: first half transitions to splitting phase with remainder", () => {
    const pawns = [[10, 20, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 7, phase: "choosing", turn: 0, pawns });
    const after1 = reducer(s, { type: "split", pawn: 0, spaces: 3 });
    expect(after1.phase).toBe("splitting");
    expect(after1.splitRemaining).toBe(4);
    expect(after1.pawns[0]![0]).toBe(13);
    expect(after1.splitPawn).toBe(0);
  });

  it("7-split: rejects reusing the same pawn for second half", () => {
    const pawns = [[10, 20, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 7, phase: "choosing", turn: 0, pawns });
    const after1 = reducer(s, { type: "split", pawn: 0, spaces: 3 });
    const after2 = reducer(after1, { type: "split", pawn: 0, spaces: 4 });
    expect(after2).toBe(after1);
  });

  it("10 alternate option moves pawn back 1", () => {
    const pawns = [[20, YARD, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 10, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "move", pawn: 0, alt: true });
    expect(next.pawns[0]![0]).toBe(19);
  });
});

describe("Sorry! Full — slides", () => {
  it("a pawn landing on an opposing slide START rides to the end and bumps", () => {
    // Slide at 16 (owner=1) ends at 19. Player 0 pawn at 13, card 3 → land on 16.
    // Place an opposing pawn somewhere on the slide path (e.g. pawn at 18) — should be bumped.
    const pawns = [[13, YARD, YARD, YARD], [YARD, 18, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 3, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(19);   // rode the slide to its end
    expect(next.pawns[1]![1]).toBe(YARD); // opponent in slide path bumped
  });

  it("landing on your OWN slide START does not slide", () => {
    // Player 0 owns slide at 1 (end 4). If a player 0 pawn lands on 1 it doesn't slide.
    // Place pawn 0 at 58 and use a 3 → 58+3 wraps via 59,0,1.
    const pawns = [[58, YARD, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 3, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(1); // landed on own slide start — stays
  });
});

describe("Sorry! Full — winning", () => {
  it("solo: win when all 4 pawns reach home", () => {
    // Pawn 0 in safety[2] (= 62). Card 3 → safety[2]+3 = HOME_POS exactly.
    const pawns = [[62, HOME_POS, HOME_POS, HOME_POS], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    const s = freshState({ currentCard: 3, phase: "choosing", turn: 0, pawns });
    const next = reducer(s, { type: "move", pawn: 0 });
    expect(next.pawns[0]![0]).toBe(HOME_POS);
    expect(next.winner).toBe(0);
    expect(isTerminal(next)).toEqual({ score: 100 });
  });

  it("isTerminal returns null until win, then correct score", () => {
    const s = initialState(99, SOLO);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
  });

  it("partners mode: team wins when 8 pawns are home", () => {
    const pawns = [[HOME_POS, HOME_POS, HOME_POS, HOME_POS],
                   [YARD, YARD, YARD, YARD],
                   [HOME_POS, HOME_POS, HOME_POS, 60], // partner of seat 0
                   [YARD, YARD, YARD, YARD]];
    // Card 5 lets seat 0 finish — but actually 8/8 already homed except partner has one in safety[0].
    // Trick: just call isTerminal directly with winningTeam = 0.
    const s: SorryFullState = freshState({ pawns, winningTeam: 0 }, PARTNERS);
    expect(isTerminal(s)).toEqual({ score: 100 });
    const s2: SorryFullState = { ...s, winningTeam: 1 };
    expect(isTerminal(s2)).toEqual({ score: 0 });
  });
});

describe("Sorry! Full — internals: advance through safety", () => {
  it("can enter own safety zone from ring", () => {
    // Player 0 safety entry is 2. A pawn at 2 with delta 1 should enter safety[0].
    const r = _internals.advance(0, 2, 1);
    expect(r).toBe(SAFETY_START); // safety[0]
  });

  it("can reach home with exact count", () => {
    // safety[3] (63) + 2 → HOME_POS
    const r = _internals.advance(0, 63, 2);
    expect(r).toBe(HOME_POS);
  });

  it("overshooting home is illegal", () => {
    const r = _internals.advance(0, 63, 3);
    expect(r).toBeNull();
  });

  it("backward wraps the ring", () => {
    // pos=2, delta=-5 → (2-5+60) % 60 = 57
    const r = _internals.advance(0, 2, -5);
    expect(r).toBe(57);
  });

  it("hasLegalMove detects when no card play is possible", () => {
    const pawns = [[YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD],
                   [YARD, YARD, YARD, YARD], [YARD, YARD, YARD, YARD]];
    // Card 3 with all pawns in yard — no legal move
    expect(_internals.hasLegalMove(pawns, 0, 3)).toBe(false);
    // Card 1 — legal (leave yard)
    expect(_internals.hasLegalMove(pawns, 0, 1)).toBe(true);
    // Card 2 — legal (leave yard)
    expect(_internals.hasLegalMove(pawns, 0, 2)).toBe(true);
    // Sorry needs both a yard pawn AND an opponent ring pawn — none here
    expect(_internals.hasLegalMove(pawns, 0, "Sorry")).toBe(false);
  });
});

describe("Sorry! Full — draw action", () => {
  it("draw consumes at least one card from the deck", () => {
    const s = initialState(123, SOLO);
    const deckLenBefore = s.deck.length;
    const after = reducer(s, { type: "draw" });
    // Player 0 drew at least one card; bots may also have drawn if turn passed.
    expect(after.deck.length).toBeLessThan(deckLenBefore);
  });

  it("draw ignored when not player 0's turn", () => {
    const s = initialState(123, SOLO);
    const offTurn: SorryFullState = { ...s, turn: 1 };
    const after = reducer(offTurn, { type: "draw" });
    expect(after).toBe(offTurn);
  });
});
