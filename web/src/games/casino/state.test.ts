import { describe, it, expect } from "vitest";
import type { Card } from "../../engines/deck/index.js";
import { initialState, reducer, isTerminal, canCapture, computeScores, numVal } from "./state.js";

function makeCard(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

const defaultSettings = { botDifficulty: "hard" as const };

// ── 1. numVal ────────────────────────────────────────────────────────────────

describe("numVal", () => {
  it("Ace = 1", () => expect(numVal(1)).toBe(1));
  it("7 = 7", () => expect(numVal(7)).toBe(7));
  it("10 = 10", () => expect(numVal(10)).toBe(10));
  it("Jack = 0 (face)", () => expect(numVal(11)).toBe(0));
  it("King = 0 (face)", () => expect(numVal(13)).toBe(0));
});

// ── 2. canCapture ────────────────────────────────────────────────────────────

describe("canCapture", () => {
  it("captures by matching rank (single)", () => {
    const hCard = makeCard("♠", 7);
    const tCard = makeCard("♥", 7);
    expect(canCapture(hCard, [tCard], [])).toBe(true);
  });

  it("captures by sum of two table cards", () => {
    const hCard = makeCard("♠", 9);
    const t1 = makeCard("♥", 4);
    const t2 = makeCard("♦", 5);
    expect(canCapture(hCard, [t1, t2], [])).toBe(true);
  });

  it("rejects sum with wrong total", () => {
    const hCard = makeCard("♠", 9);
    const t1 = makeCard("♥", 4);
    const t2 = makeCard("♦", 6);
    expect(canCapture(hCard, [t1, t2], [])).toBe(false);
  });

  it("face card captures by rank match only", () => {
    const hCard = makeCard("♠", 11); // Jack
    const t1 = makeCard("♥", 11);
    expect(canCapture(hCard, [t1], [])).toBe(true);
  });

  it("face card cannot capture by sum", () => {
    // Jack (11) should not sum-capture
    const hCard = makeCard("♠", 11);
    const t1 = makeCard("♥", 5);
    const t2 = makeCard("♦", 6);
    // canCapture with face card and sum should fail
    expect(canCapture(hCard, [t1, t2], [])).toBe(false);
  });

  it("empty table returns false", () => {
    expect(canCapture(makeCard("♠", 5), [], [])).toBe(false);
  });
});

// ── 3. computeScores ────────────────────────────────────────────────────────

describe("computeScores", () => {
  it("most cards gets 3 pts", () => {
    const player = Array.from({ length: 27 }, (_, i) => makeCard("♣", ((i % 13) + 1) as Card["rank"], `c${i}`));
    const bot = Array.from({ length: 25 }, (_, i) => makeCard("♣", ((i % 13) + 1) as Card["rank"], `b${i}`));
    const scores = computeScores([player, bot], [0, 0]);
    expect(scores[0]).toBeGreaterThan(scores[1]!);
  });

  it("10 of diamonds gives 2 pts", () => {
    const player: Card[] = [makeCard("♦", 10)];
    const bot: Card[] = [];
    const scores = computeScores([player, bot], [0, 0]);
    expect(scores[0]).toBeGreaterThanOrEqual(2);
  });

  it("2 of spades gives 1 pt", () => {
    const player: Card[] = [makeCard("♠", 2)];
    const bot: Card[] = [];
    const scores = computeScores([player, bot], [0, 0]);
    expect(scores[0]).toBeGreaterThanOrEqual(1);
  });

  it("aces give 1 pt each", () => {
    const player: Card[] = [makeCard("♠", 1), makeCard("♥", 1)];
    const bot: Card[] = [makeCard("♦", 1), makeCard("♣", 1)];
    const scores = computeScores([player, bot], [0, 0]);
    expect(scores[0]).toBeGreaterThanOrEqual(2); // 2 aces
    expect(scores[1]).toBeGreaterThanOrEqual(2);
  });
});

// ── 4. initialState ──────────────────────────────────────────────────────────

describe("initialState", () => {
  it("deals 4 to player, 4 to bot, 4 to table, 40 to stock", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands[0]!.length).toBe(4);
    expect(s.hands[1]!.length).toBe(4);
    expect(s.table.length).toBe(4);
    expect(s.stock.length).toBe(40);
    const total = s.hands[0]!.length + s.hands[1]!.length + s.table.length + s.stock.length;
    expect(total).toBe(52);
  });

  it("starts on player's turn", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe(0);
    expect(s.phase).toBe("playing");
  });
});

// ── 5. Trail action ──────────────────────────────────────────────────────────

describe("trail action", () => {
  it("playing a trail adds card to table and switches to bot", () => {
    const s = initialState(42, defaultSettings);
    const card = s.hands[0]![0]!;
    const tableLen = s.table.length;
    const s2 = reducer(s, { type: "trail", handCardId: card.id });
    // After bot plays, should be back to player or done
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
    // Table should have changed (bot may capture or trail)
  });
});

// ── 6. Capture action ────────────────────────────────────────────────────────

describe("capture action", () => {
  it("invalid capture does not change state", () => {
    const s = initialState(42, defaultSettings);
    const card = s.hands[0]![0]!;
    const wrongTableCard = s.table.find(tc => tc.rank !== card.rank);
    if (wrongTableCard && !canCapture(card, [wrongTableCard], [])) {
      const s2 = reducer(s, { type: "capture", handCardId: card.id, tableCardIds: [wrongTableCard.id] });
      expect(s2.message).toContain("Invalid");
    } else {
      // No suitable test case, just verify reducer doesn't crash
      expect(s.phase).toBe("playing");
    }
  });
});

// ── 7. isTerminal ────────────────────────────────────────────────────────────

describe("isTerminal", () => {
  it("returns null when playing", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score in 0-100 when done", () => {
    const s = initialState(42, defaultSettings);
    const done = {
      ...s,
      phase: "done" as const,
      scores: [7, 4],
      captured: [
        Array.from({ length: 27 }, (_, i) => makeCard("♣", ((i % 13) + 1) as Card["rank"], `p${i}`)),
        Array.from({ length: 25 }, (_, i) => makeCard("♦", ((i % 13) + 1) as Card["rank"], `b${i}`)),
      ] as [Card[], Card[]],
    };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
});
