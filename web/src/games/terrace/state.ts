import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, rankVal } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TerraceSettings {
  _dummy?: undefined;
}

export interface TerraceState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  /** The rank the foundations wrap around (chosen at start) */
  foundationStartRank: number;
  settings: TerraceSettings;
}

export type TerraceAction =
  | { type: "draw" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// 9 tableau columns, 9 terrace slots, 4 foundations, stock
const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"] as const;
const TERRACE_IDS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export function makeRuleset(startRank: number): Ruleset {
  return {
    canStack: (target, moving) => {
      if (target.kind === "foundation") {
        if (moving.length !== 1) return false;
        const c = moving[0]!;
        if (target.cards.length === 0) return c.rank === startRank;
        const top = target.cards[target.cards.length - 1]!;
        if (top.suit !== c.suit) return false;
        const expected = top.rank === 13 ? 1 : (top.rank as number) + 1;
        return (c.rank as number) === expected;
      }
      if (target.kind === "tableau") return klondikeTableauStack(target, moving);
      // Terrace (reserve): empty only, one card only
      if (target.kind === "freecell") return target.cards.length === 0 && moving.length === 1;
      return false;
    },
    canPickUp: (pile, count) => {
      if (pile.kind === "freecell") return count === 1;
      if (pile.kind === "foundation") return count === 1;
      if (pile.kind === "waste") return count === 1;
      if (pile.kind === "tableau") {
        const faceUp = pile.faceUpCount ?? 0;
        return count <= faceUp;
      }
      return false;
    },
  };
}

export function initialState(seed: number, settings: TerraceSettings): TerraceState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  let idx = 0;

  // Deal 9 terrace cards face-up (reserve row)
  const terracePiles: Pile[] = TERRACE_IDS.map((id) => ({
    id,
    kind: "freecell" as const,
    cards: [deck[idx++]!],
    faceUpCount: 1,
  }));

  // Foundation seed: 1 card to first foundation (comes after terrace cards)
  const foundSeed = deck[idx++]!;

  // The foundation start rank is the rank of the foundation seed card
  const foundationStartRank = foundSeed.rank as number;

  const piles: Pile[] = [...terracePiles];

  // Tableau: 9 cols, 4 cards each = 36 cards, then stock = 52-9-1-36=6 cards
  for (let i = 0; i < 9; i++) {
    const count = 4;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 1,
    });
  }

  // Stock
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx), faceUpCount: 0 });

  // Foundations
  for (let fi = 0; fi < 4; fi++) {
    piles.push({
      id: FOUNDATION_IDS[fi]!,
      kind: "foundation",
      cards: fi === 0 ? [foundSeed] : [],
    });
  }

  return {
    piles,
    score: 1,
    movesMade: 0,
    won: false,
    foundationStartRank,
    settings,
  };
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: TerraceState, action: TerraceAction): TerraceState {
  if (state.won) return state;

  const ruleset = makeRuleset(state.foundationStartRank);

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      if (!stock || stock.cards.length === 0) return state;
      // Turn top of stock face-up to tableau col or waste
      // For Terrace, draw to waste
      const newCard = stock.cards[stock.cards.length - 1]!;
      const newPiles = state.piles.map((p) => {
        if (p.id === "stock") return { ...p, cards: p.cards.slice(0, -1) };
        if (p.id === "waste") return { ...p, cards: [...p.cards, newCard] };
        return p;
      });
      // Add waste if not present
      const hasWaste = state.piles.some((p) => p.id === "waste");
      if (!hasWaste) {
        newPiles.push({ id: "waste", kind: "waste", cards: [newCard], faceUpCount: 1 });
        const stock2 = newPiles.find((p) => p.id === "stock")!;
        stock2.cards = stock.cards.slice(0, -1);
      }
      return { ...state, piles: newPiles };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, ruleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        const sources = [...TABLEAU_IDS, ...TERRACE_IDS, "waste"];
        for (const srcId of sources) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const m = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, m, ruleset)) {
              piles = applyMove(piles, m);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      return { ...state, piles, movesMade: moves, score: total, won: total === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TerraceState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
