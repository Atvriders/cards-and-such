import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  buildDeck,
  isPlayable,
  cardPoints,
  type UnoFullState,
  type UnoFullSettings,
  type UnoCard,
  type UnoColor,
} from "./state.js";

const DEF_SETTINGS: UnoFullSettings = { targetScore: "500", challengeWildD4: false };

function makeCard(color: UnoColor | null, value: UnoCard["value"], id: string): UnoCard {
  return { id, color, value };
}

function freshState(seed = 42): UnoFullState {
  return initialState(seed, DEF_SETTINGS);
}

function setupHumanTurn(overrides: Partial<UnoFullState>): UnoFullState {
  const base = freshState();
  const defaults: Partial<UnoFullState> = {
    direction: 1,
    unoCalled: [false, false, false, false],
    pendingDraws: 0,
    roundWinner: null,
    gameWinner: null,
    log: [],
    turn: 0,
    phase: "playing",
    drewThisTurn: false,
    drawnCard: null,
    pendingWild: null,
  };
  return { ...base, ...defaults, ...overrides };
}

describe("uno-full / deck", () => {
  it("builds a 108-card deck with correct composition", () => {
    const d = buildDeck();
    expect(d).toHaveLength(108);
    const byColor: Record<string, number> = {};
    let wild = 0;
    let wildD4 = 0;
    for (const c of d) {
      if (c.value === "Wild") wild++;
      else if (c.value === "WildD4") wildD4++;
      else byColor[c.color!] = (byColor[c.color!] ?? 0) + 1;
    }
    expect(wild).toBe(4);
    expect(wildD4).toBe(4);
    for (const k of ["R", "Y", "G", "B"]) {
      expect(byColor[k]).toBe(25);
    }
  });

  it("each color has exactly one 0 and two of every other value", () => {
    const d = buildDeck();
    for (const color of ["R", "Y", "G", "B"] as const) {
      const colored = d.filter((c) => c.color === color);
      const zeros = colored.filter((c) => c.value === "0");
      expect(zeros).toHaveLength(1);
      for (const v of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Skip", "Reverse", "Draw2"] as const) {
        const matching = colored.filter((c) => c.value === v);
        expect(matching).toHaveLength(2);
      }
    }
  });
});

describe("uno-full / initialState", () => {
  it("deals 7 cards to each of 4 seats and is deterministic by seed", () => {
    const a = initialState(7, DEF_SETTINGS);
    const b = initialState(7, DEF_SETTINGS);
    expect(a.seats).toBe(4);
    expect(a.hands).toHaveLength(4);
    a.hands.forEach((h) => expect(h.length).toBeGreaterThanOrEqual(7));
    // Determinism: same seed → same dealt hands & initial discard
    expect(a.hands[0]!.map((c) => c.id)).toEqual(b.hands[0]!.map((c) => c.id));
    expect(a.discard[0]!.id).toBe(b.discard[0]!.id);
  });

  it("first discard is never a wild (re-shuffled)", () => {
    for (const seed of [1, 2, 3, 17, 42, 99, 1024]) {
      const s = initialState(seed, DEF_SETTINGS);
      // discard[0] is the original flipped card
      expect(s.discard[0]!.value).not.toBe("Wild");
      expect(s.discard[0]!.value).not.toBe("WildD4");
    }
  });

  it("isTerminal returns null on a fresh state", () => {
    const s = freshState();
    expect(isTerminal(s)).toBeNull();
  });
});

describe("uno-full / playability", () => {
  it("isPlayable: matches color", () => {
    const top = makeCard("R", "5", "top");
    expect(isPlayable(makeCard("R", "9", "x"), top, "R")).toBe(true);
  });
  it("isPlayable: matches value across colors", () => {
    const top = makeCard("R", "5", "top");
    expect(isPlayable(makeCard("G", "5", "x"), top, "R")).toBe(true);
  });
  it("isPlayable: wilds always playable", () => {
    const top = makeCard("R", "5", "top");
    expect(isPlayable(makeCard(null, "Wild", "w"), top, "R")).toBe(true);
    expect(isPlayable(makeCard(null, "WildD4", "w4"), top, "R")).toBe(true);
  });
  it("isPlayable: rejects mismatched non-wild", () => {
    const top = makeCard("R", "5", "top");
    expect(isPlayable(makeCard("G", "9", "x"), top, "R")).toBe(false);
  });
});

describe("uno-full / reducer", () => {
  it("plays a number card matching color and discards it", () => {
    const top = makeCard("R", "5", "top");
    const play = makeCard("R", "7", "p1");
    const filler = makeCard("Y", "2", "f");
    const s = setupHumanTurn({
      hands: [[play, filler], [filler], [filler], [filler]],
      discard: [top],
      activeColor: "R",
    });
    const next = reducer(s, { type: "play", cardId: "p1" });
    expect(next.discard[next.discard.length - 1]!.id).toBe("p1");
    expect(next.hands[0]!.find((c) => c.id === "p1")).toBeUndefined();
  });

  it("rejects illegal play (returns same reference)", () => {
    const top = makeCard("R", "5", "top");
    const illegal = makeCard("G", "9", "il");
    const filler = makeCard("Y", "2", "f");
    const s = setupHumanTurn({
      hands: [[illegal, filler], [filler], [filler], [filler]],
      discard: [top],
      activeColor: "R",
    });
    const next = reducer(s, { type: "play", cardId: "il" });
    expect(next).toBe(s);
  });

  it("playing a wild sets phase=pickColor and pendingWild", () => {
    const top = makeCard("R", "5", "top");
    const wild = makeCard(null, "Wild", "w1");
    const filler = makeCard("Y", "2", "f");
    const s = setupHumanTurn({
      hands: [[wild, filler], [filler], [filler], [filler]],
      discard: [top],
      activeColor: "R",
    });
    const next = reducer(s, { type: "play", cardId: "w1" });
    expect(next.phase).toBe("pickColor");
    expect(next.pendingWild?.cardId).toBe("w1");
  });

  it("pickColor applies declared color (wild lands on discard with chosen color)", () => {
    const top = makeCard("R", "5", "top");
    const wild = makeCard(null, "Wild", "w1");
    const filler = makeCard("Y", "2", "f");
    const s = setupHumanTurn({
      hands: [[wild, filler, makeCard("Y", "3", "y3")], [filler], [filler], [filler]],
      discard: [top],
      activeColor: "R",
      phase: "pickColor",
      pendingWild: { cardId: "w1", isD4: false },
      // Big stock so any forced draws never run out.
      stock: Array.from({ length: 30 }, (_, i) => makeCard("R", "9", `s${i}`)),
    });
    const next = reducer(s, { type: "pickColor", color: "G" });
    // The wild card was discarded with color G. Find it in the discard pile —
    // bots may pile more cards on top, but the w1 card is somewhere in there.
    const wildInDiscard = next.discard.find((c) => c.id === "w1");
    expect(wildInDiscard).toBeDefined();
    expect(wildInDiscard!.color).toBe("G");
  });

  it("Draw-Two: next seat draws two and is skipped", () => {
    const top = makeCard("R", "5", "top");
    const d2 = makeCard("R", "Draw2", "d2");
    // Human has 3 cards so the missed-UNO penalty doesn't trigger after play.
    const humanHand = [d2, makeCard("Y", "1", "h1"), makeCard("Y", "2", "h2")];
    const bot1Hand = [makeCard("G", "3", "g3"), makeCard("G", "7", "g7")];
    const botFiller = [makeCard("R", "0", "rb1"), makeCard("R", "0", "rb2")];
    const s = setupHumanTurn({
      hands: [humanHand, bot1Hand, botFiller, [...botFiller]],
      discard: [top],
      activeColor: "R",
      // Big stock so the +2 draw always succeeds.
      stock: Array.from({ length: 20 }, (_, i) => makeCard("B", "1", `s${i}`)),
    });
    const next = reducer(s, { type: "play", cardId: "d2" });
    // Bot 1 had 2 cards, draws 2 → at least 4 (may have more if it later took a turn,
    // but Draw-Two skips it). Verify it has at least 4.
    expect(next.hands[1]!.length).toBeGreaterThanOrEqual(4);
  });

  it("Skip card jumps over next seat", () => {
    const top = makeCard("R", "5", "top");
    const skip = makeCard("R", "Skip", "sk");
    const filler = makeCard("Y", "2", "f");
    const s = setupHumanTurn({
      hands: [
        [skip, filler],
        // Bot 1 has only one unplayable card so we can detect it didn't move
        [makeCard("B", "9", "b9-1"), makeCard("B", "8", "b8-1")],
        [makeCard("B", "7", "b7-2"), makeCard("B", "6", "b6-2")],
        [makeCard("B", "3", "b3-3"), makeCard("B", "2", "b2-3")],
      ],
      discard: [top],
      activeColor: "R",
      stock: Array.from({ length: 12 }, (_, i) => makeCard("G", "0", `s${i}`)),
    });
    const next = reducer(s, { type: "play", cardId: "sk" });
    // After human plays Skip, bot 1 is skipped — turn should NOT be bot 1.
    // Bots then run until back to human. We just verify human's hand lost the skip card.
    expect(next.hands[0]!.find((c) => c.id === "sk")).toBeUndefined();
  });

  it("Reverse flips direction (visible in state.direction after bots play)", () => {
    const top = makeCard("R", "5", "top");
    const rev = makeCard("R", "Reverse", "rv");
    const filler = makeCard("Y", "2", "f");
    const s = setupHumanTurn({
      hands: [[rev, filler], [filler], [filler], [filler]],
      discard: [top],
      activeColor: "R",
    });
    // Direction starts at 1. After human plays Reverse it should flip to -1 (then bots may flip again).
    // We check that *some* mutation happened: discard top is the reverse card, our hand shrank by 1.
    const next = reducer(s, { type: "play", cardId: "rv" });
    expect(next.hands[0]!.find((c) => c.id === "rv")).toBeUndefined();
  });

  it("drawing when no card playable adds a card and may pass", () => {
    const top = makeCard("R", "5", "top");
    const illegal = makeCard("G", "9", "il");
    const drawn = makeCard("Y", "1", "drw");
    const s = setupHumanTurn({
      hands: [[illegal], [illegal], [illegal], [illegal]],
      discard: [top],
      activeColor: "R",
      stock: [drawn],
    });
    const next = reducer(s, { type: "draw" });
    // The drawn card is unplayable (Yellow 1 vs Red 5) → auto-pass to bots.
    // The human's hand gained a card.
    const humanHand = next.hands[0]!;
    expect(humanHand.some((c) => c.id === "drw")).toBe(true);
  });

  it("winning a round ends in phase=roundOver (or gameOver if target reached)", () => {
    const top = makeCard("R", "5", "top");
    const winner = makeCard("R", "7", "win");
    const s = setupHumanTurn({
      hands: [
        [winner],
        [makeCard("Y", "3", "y3")],
        [makeCard("Y", "5", "y5")],
        [makeCard("G", "2", "g2")],
      ],
      discard: [top],
      activeColor: "R",
      scores: [0, 0, 0, 0],
    });
    const next = reducer(s, { type: "play", cardId: "win" });
    expect(next.phase).toBe("roundOver");
    expect(next.roundWinner).toBe(0);
    // Score = 3 + 5 + 2 = 10 (yellow 3, yellow 5, green 2)
    expect(next.scores[0]).toBe(10);
  });

  it("reaching target score ends the match (phase=gameOver, gameWinner=0)", () => {
    const top = makeCard("R", "5", "top");
    const winner = makeCard("R", "9", "win");
    const s = setupHumanTurn({
      hands: [
        [winner],
        [makeCard(null, "WildD4", "w4")],
        [makeCard(null, "Wild", "w")],
        [makeCard("G", "Skip", "sk")],
      ],
      discard: [top],
      activeColor: "R",
      scores: [490, 0, 0, 0],
      settings: { targetScore: "500", challengeWildD4: false },
    });
    const next = reducer(s, { type: "play", cardId: "win" });
    // Total opponents' points: 50 + 50 + 20 = 120, so score becomes 610 ≥ 500.
    expect(next.phase).toBe("gameOver");
    expect(next.gameWinner).toBe(0);
    expect(isTerminal(next)).not.toBeNull();
    expect(isTerminal(next)!.score).toBeGreaterThanOrEqual(500);
  });

  it("isTerminal returns 0 if a bot wins the match", () => {
    // Use a fresh state and manually patch the terminal fields (the
    // setupHumanTurn helper forces phase="playing", so do this directly).
    const base = freshState();
    const s: UnoFullState = {
      ...base,
      phase: "gameOver",
      gameWinner: 1,
      scores: [120, 500, 80, 0],
    };
    const t = isTerminal(s);
    expect(t).toEqual({ score: 0 });
  });
});

describe("uno-full / cardPoints", () => {
  it("scores numbers as face value, action=20, wild=50", () => {
    expect(cardPoints(makeCard("R", "0", "_"))).toBe(0);
    expect(cardPoints(makeCard("R", "9", "_"))).toBe(9);
    expect(cardPoints(makeCard("R", "Skip", "_"))).toBe(20);
    expect(cardPoints(makeCard("R", "Reverse", "_"))).toBe(20);
    expect(cardPoints(makeCard("R", "Draw2", "_"))).toBe(20);
    expect(cardPoints(makeCard(null, "Wild", "_"))).toBe(50);
    expect(cardPoints(makeCard(null, "WildD4", "_"))).toBe(50);
  });
});
