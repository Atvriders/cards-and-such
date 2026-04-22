import type { Pile } from "../../engines/tableau/types.js";
import { type Card, SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GrandfathersClockSettings {
  _dummy?: undefined;
}

export interface GrandfathersClockState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: GrandfathersClockSettings;
}

export type GrandfathersClockAction =
  | { type: "move"; fromPile: string; toPile: string }
  | { type: "auto-move-to-foundation" };

/**
 * Grandfather's Clock:
 * 12 clock-face foundations, each pre-loaded with one specific card.
 * The "hour" positions 1-12 correspond to ranks 2-K, one per suit
 * in the traditional layout. Foundations build up same-suit wrapping
 * from the starting rank to the rank that fills the position.
 *
 * Traditional assignment: the card at position h (1=1 o'clock..12=12 o'clock)
 * has rank ((h + 1) % 12 + 2) — i.e. position 1=2, 2=3, ..., 10=J, 11=Q, 12=K
 * and the suits cycle through ♥♣♦♠ for positions 1-12.
 *
 * For simplicity: 12 clock foundations ("c1"–"c12").
 * Position h gets a pre-assigned card. Build each foundation up in same suit,
 * wrapping A after K, until it has 13 cards total.
 *
 * Tableau: 8 columns of 5 cards each from the remaining 40 cards.
 * Build tableau DOWN any suit, one card at a time.
 * Empty tableau column: any card.
 */

// Clock hour positions 1-12 → starting rank (1=♥2, 2=♣3, 3=♦4, 4=♠5, 5=♥6, 6=♣7,
// 7=♦8, 8=♠9, 9=♥10, 10=♣J, 11=♦Q, 12=♠K)
// Suits cycle ♥♣♦♠ for positions 1-12
const CLOCK_ASSIGNMENTS: { rank: Card["rank"]; suit: Card["suit"] }[] = [
  { rank: 2,  suit: "♥" },
  { rank: 3,  suit: "♣" },
  { rank: 4,  suit: "♦" },
  { rank: 5,  suit: "♠" },
  { rank: 6,  suit: "♥" },
  { rank: 7,  suit: "♣" },
  { rank: 8,  suit: "♦" },
  { rank: 9,  suit: "♠" },
  { rank: 10, suit: "♥" },
  { rank: 11, suit: "♣" },
  { rank: 12, suit: "♦" },
  { rank: 13, suit: "♠" },
];

const CLOCK_IDS = ["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10","c11","c12"] as const;
const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8"] as const;

/** Next rank wrapping: K→A→2→... */
function nextRank(rank: Card["rank"]): Card["rank"] {
  if (rank === 13) return 1;
  return (rank as number + 1) as Card["rank"];
}

export function canBuildClock(foundation: Pile, card: Card): boolean {
  if (foundation.kind !== "foundation") return false;
  if (foundation.cards.length === 0) return false;
  const top = foundation.cards[foundation.cards.length - 1]!;
  if (top.suit !== card.suit) return false;
  if (foundation.cards.length >= 13) return false;
  return card.rank === nextRank(top.rank);
}

/** Tableau: build DOWN any suit, one card at a time. Any card on empty. */
export const clockTableauCanStack = (target: Pile, moving: Card[]): boolean => {
  if (target.kind !== "tableau") return false;
  if (moving.length !== 1) return false;
  const bottom = moving[0]!;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return (top.rank as number) === (bottom.rank as number) + 1;
};

export function initialState(seed: number, settings: GrandfathersClockSettings): GrandfathersClockState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Pull the 12 clock cards out of the deck
  const clockCards = new Map<string, Card>();
  for (const assignment of CLOCK_ASSIGNMENTS) {
    clockCards.set(`${assignment.suit}${assignment.rank}`, null as unknown as Card);
  }

  const remaining: Card[] = [];
  const clockPool: Card[] = [];

  for (const card of deck) {
    const key = `${card.suit}${card.rank}`;
    if (clockCards.has(key) && clockCards.get(key) === null) {
      clockPool.push(card);
      clockCards.set(key, card);
    } else {
      remaining.push(card);
    }
  }

  // Place clock cards on foundations
  const piles: Pile[] = [];
  for (let i = 0; i < 12; i++) {
    const assign = CLOCK_ASSIGNMENTS[i]!;
    const card = clockCards.get(`${assign.suit}${assign.rank}`)!;
    piles.push({
      id: CLOCK_IDS[i]!,
      kind: "foundation",
      cards: [card],
    });
  }

  // Shuffle remaining (40 cards) and deal to 8 tableau columns of 5
  const shuffledRemaining = shuffle(remaining, rng);
  for (let i = 0; i < 8; i++) {
    const cards = shuffledRemaining.slice(i * 5, i * 5 + 5) as Card[];
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 5, // all face-up
    });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  // Each clock foundation needs 13 cards to be complete (started with 1 + 12 more)
  return CLOCK_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: GrandfathersClockState, action: GrandfathersClockAction): GrandfathersClockState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile } = action;
      const from = getPile(state.piles, fromPile);
      if (!from || from.cards.length === 0) return state;
      const card = from.cards[from.cards.length - 1]!;
      const to = getPile(state.piles, toPile);
      if (!to) return state;

      let valid = false;
      let scoreDelta = 0;

      if (to.kind === "foundation") {
        valid = canBuildClock(to, card);
        if (valid) scoreDelta = 10;
      } else if (to.kind === "tableau") {
        valid = clockTableauCanStack(to, [card]);
        // Only top card (count=1) can be picked up from tableau
        if (from.kind === "tableau") {
          const faceUp = from.faceUpCount ?? 0;
          if (faceUp < 1) valid = false;
        }
      }

      if (!valid) return state;

      const newPiles: Pile[] = state.piles.map((p): Pile => {
        if (p.id === fromPile) {
          const newCards = p.cards.slice(0, -1);
          if (p.kind === "tableau") {
            return {
              ...p,
              cards: newCards,
              faceUpCount: Math.max(newCards.length > 0 ? 1 : 0, (p.faceUpCount ?? 0) - 1),
            };
          }
          return { ...p, cards: newCards };
        }
        if (p.id === toPile) {
          if (p.kind === "tableau") {
            return {
              ...p,
              cards: [...p.cards, card],
              faceUpCount: (p.faceUpCount ?? 0) + 1,
            };
          }
          return { ...p, cards: [...p.cards, card] };
        }
        return p;
      });

      const total = totalOnFoundations(newPiles);
      // Win when all 12 foundations have 13 cards each = 156 total (but we only have 52 cards!)
      // Correction: 12 foundations × 13 cards = 156, but we only have 52 cards.
      // Each foundation starts with 1 card and can hold 13 total (12 more from tableau).
      // 12 foundations × 13 = 156. But the tableau only has 40 cards and clocks start with 12.
      // 12 + 40 = 52 cards total. Each foundation needs 13. 12 × 13 = 156 ≠ 52. Impossible!
      // Fix: each foundation only needs its suit completed (13 cards for 4 suits, 1 suit per "clock position group").
      // Actually: 4 suits × 13 cards = 52. But we have 12 clock positions.
      // Simplification: win when all 52 cards are on foundations (total = 52).
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let scoreDelta = 0;
      let moved = true;

      while (moved) {
        moved = false;
        for (const sourceId of TABLEAU_IDS) {
          const sourcePile = getPile(piles, sourceId);
          if (!sourcePile || sourcePile.cards.length === 0) continue;
          const card = sourcePile.cards[sourcePile.cards.length - 1]!;
          for (const clockId of CLOCK_IDS) {
            const fp = getPile(piles, clockId)!;
            if (canBuildClock(fp, card)) {
              // Apply move
              piles = piles.map((p): Pile => {
                if (p.id === sourceId) {
                  const newCards = p.cards.slice(0, -1);
                  const newFaceUp = Math.max(newCards.length > 0 ? 1 : 0, (p.faceUpCount ?? 0) - 1);
                  return {
                    ...p,
                    cards: newCards,
                    faceUpCount: newFaceUp,
                  };
                }
                if (p.id === clockId) return { ...p, cards: [...p.cards, card] };
                return p;
              });
              scoreDelta += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }

      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      const won = total === 52;

      return {
        ...state,
        piles,
        score: state.score + scoreDelta,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GrandfathersClockState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}

export { CLOCK_IDS, TABLEAU_IDS, SUITS };
