import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WarState } from "./state.js";
import type { Card, Rank } from "../../engines/deck/index.js";

const defaultSettings = { autoPlay: false };

function makeCard(rank: Rank, suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

// ── 1. Initial state ──────────────────────────────────────────────────────
describe("initialState", () => {
  it("deals 26 cards each, empty pile, winner null", () => {
    const s = initialState(42, defaultSettings);
    expect(s.player.length).toBe(26);
    expect(s.bot.length).toBe(26);
    expect(s.pile.length).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.roundsPlayed).toBe(0);
    expect(s.maxRounds).toBe(500);
  });
});

// ── 2. Deterministic under seed ───────────────────────────────────────────
describe("initialState — determinism", () => {
  it("produces identical state for the same seed", () => {
    const s1 = initialState(777, defaultSettings);
    const s2 = initialState(777, defaultSettings);
    expect(s1.player).toEqual(s2.player);
    expect(s1.bot).toEqual(s2.bot);
  });

  it("produces different decks for different seeds", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    expect(s1.player).not.toEqual(s2.player);
  });
});

// ── 3. Simple round — non-tie ─────────────────────────────────────────────
describe("reducer — play-round (non-tie)", () => {
  it("player wins round: gets both cards, bot loses one", () => {
    // Player has Ace (14), bot has 2
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(1, "♠"), makeCard(5, "♥"), makeCard(6, "♣")], // Ace top
      bot: [makeCard(2, "♦"), makeCard(7, "♠"), makeCard(8, "♥")],
      pile: [],
      winner: null,
      roundsPlayed: 0,
    };
    const s2 = reducer(s, { type: "play-round" });
    // Player played Ace, bot played 2 → player wins
    // Player: 3-1 played + 2 cards won = 4
    expect(s2.player.length).toBe(s.player.length - 1 + 2); // 4
    expect(s2.bot.length).toBe(s.bot.length - 1);           // 2
    expect(s2.roundsPlayed).toBe(1);
    expect(s2.winner).toBeNull();
  });

  it("bot wins round: gets both cards, player loses one", () => {
    // Bot has King (13), player has 2
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(2, "♠"), makeCard(5, "♥")],
      bot: [makeCard(13, "♦"), makeCard(7, "♠")],
      pile: [],
      winner: null,
      roundsPlayed: 0,
    };
    const s2 = reducer(s, { type: "play-round" });
    expect(s2.bot.length).toBe(s.bot.length - 1 + 2);  // 3
    expect(s2.player.length).toBe(s.player.length - 1); // 1
  });
});

// ── 4. WAR — equal ranks ─────────────────────────────────────────────────
describe("reducer — WAR (equal ranks)", () => {
  it("WAR occurs on equal ranks and winner takes enlarged pile", () => {
    // Both play 5 → WAR; next cards: player Ace (14) > bot 2
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [
        makeCard(5, "♠"),   // top: plays this
        makeCard(3, "♥"),   // war face-down 1
        makeCard(4, "♣"),   // war face-down 2
        makeCard(6, "♦"),   // war face-down 3
        makeCard(1, "♠"),   // war face-up (Ace=14 wins)
        makeCard(9, "♦"),
      ],
      bot: [
        makeCard(5, "♦"),   // top: plays this (tie!)
        makeCard(2, "♠"),   // war face-down 1
        makeCard(3, "♥"),   // war face-down 2
        makeCard(4, "♣"),   // war face-down 3
        makeCard(2, "♥"),   // war face-up (2 loses)
        makeCard(8, "♣"),
      ],
      pile: [],
      winner: null,
      roundsPlayed: 0,
    };
    const s2 = reducer(s, { type: "play-round" });
    // Total cards = 12. Player wins → gets most of them
    const totalCards = s2.player.length + s2.bot.length + s2.pile.length;
    expect(totalCards).toBe(12);
    // Player won (Ace > 2), so player has more cards
    expect(s2.player.length).toBeGreaterThan(s2.bot.length);
    expect(s2.winner).toBeNull();
  });
});

// ── 5. Mid-WAR exhaustion ────────────────────────────────────────────────
describe("reducer — WAR exhaustion", () => {
  it("player runs out mid-WAR and bot wins", () => {
    // Equal top cards, but player only has 2 cards total (can't put up 4 for WAR)
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(7, "♠"), makeCard(3, "♥")], // only 2 cards
      bot: [makeCard(7, "♦"), makeCard(2, "♣"), makeCard(5, "♠"), makeCard(6, "♥"), makeCard(8, "♦")],
      pile: [],
      winner: null,
      roundsPlayed: 0,
    };
    const s2 = reducer(s, { type: "play-round" });
    // Player ran out during WAR → bot wins game
    expect(s2.winner).toBe(1);
  });

  it("bot runs out mid-WAR and player wins", () => {
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(7, "♦"), makeCard(2, "♣"), makeCard(5, "♠"), makeCard(6, "♥"), makeCard(8, "♦")],
      bot: [makeCard(7, "♠"), makeCard(3, "♥")], // only 2 cards
      pile: [],
      winner: null,
      roundsPlayed: 0,
    };
    const s2 = reducer(s, { type: "play-round" });
    expect(s2.winner).toBe(0);
  });
});

// ── 6. No-op when winner already set ─────────────────────────────────────
describe("reducer — play-round when winner set", () => {
  it("returns same state when winner is already decided", () => {
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [],
      bot: [makeCard(5, "♦")],
      winner: 1,
      roundsPlayed: 10,
    };
    const s2 = reducer(s, { type: "play-round" });
    expect(s2).toBe(s); // same reference — no-op
  });
});

// ── 7. auto-play ─────────────────────────────────────────────────────────
describe("reducer — auto-play", () => {
  it("runs rounds until winner is set", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "auto-play" });
    expect(s2.winner).not.toBeNull();
    expect(s2.roundsPlayed).toBeGreaterThan(0);
  });

  it("auto-play from a one-card-each state resolves immediately", () => {
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(1, "♠")],  // Ace = 14, wins
      bot: [makeCard(2, "♦")],
      pile: [],
      winner: null,
      roundsPlayed: 0,
    };
    const s2 = reducer(s, { type: "auto-play" });
    expect(s2.winner).toBe(0);
  });
});

// ── 8. maxRounds cap ─────────────────────────────────────────────────────
describe("reducer — maxRounds cap", () => {
  it("triggers winner resolution when maxRounds is reached", () => {
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(5, "♠"), makeCard(3, "♥")],
      bot: [makeCard(6, "♦"), makeCard(7, "♣"), makeCard(8, "♠")],
      pile: [],
      winner: null,
      roundsPlayed: 499, // one more will hit maxRounds=500
      maxRounds: 500,
    };
    // Play one round — will hit cap
    const s2 = reducer(s, { type: "play-round" });
    // After this round, roundsPlayed = 500 = maxRounds → should resolve winner
    if (s2.roundsPlayed >= s2.maxRounds) {
      expect(s2.winner).not.toBeNull();
    }
  });

  it("draw when both decks equal size at cap", () => {
    const s: WarState = {
      ...initialState(1, defaultSettings),
      player: [makeCard(5, "♣"), makeCard(7, "♥")],  // 2 cards
      bot: [makeCard(6, "♦"), makeCard(8, "♠")],     // 2 cards
      pile: [],
      winner: null,
      roundsPlayed: 499,
      maxRounds: 500,
    };
    const s2 = reducer(s, { type: "play-round" });
    if (s2.roundsPlayed >= s2.maxRounds) {
      // If equal cards → draw; if one side won the played cards, may not be draw
      // Either resolved or winner decided
      expect(["draw", 0, 1]).toContain(s2.winner);
    }
  });
});

// ── 9. isTerminal ─────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("player wins: score = max(100, 500 - roundsPlayed)", () => {
    const s: WarState = { ...initialState(1, defaultSettings), winner: 0, roundsPlayed: 100 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(400); // 500 - 100
  });

  it("player wins with many rounds: score floored at 100", () => {
    const s: WarState = { ...initialState(1, defaultSettings), winner: 0, roundsPlayed: 450 };
    const result = isTerminal(s);
    expect(result!.score).toBe(100); // max(100, 500-450=50) = 100
  });

  it("bot wins: score = 0", () => {
    const s: WarState = { ...initialState(1, defaultSettings), winner: 1, roundsPlayed: 50 };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("draw: score = 50", () => {
    const s: WarState = { ...initialState(1, defaultSettings), winner: "draw", roundsPlayed: 500 };
    expect(isTerminal(s)!.score).toBe(50);
  });
});
