import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CanfieldSettings {
  _dummy?: undefined;
}

export interface CanfieldState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  /** The rank that foundations start at (1=Ace..13=King). */
  foundationStartRank: number;
  settings: CanfieldSettings;
}

export type CanfieldAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "fill-from-reserve" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export function makeRulesetPublic(startRank: number): Ruleset {
  return makeRuleset(startRank);
}

function makeRuleset(startRank: number): Ruleset {
  return {
    canStack: (target, moving) => {
      if (target.kind === "tableau") return klondikeTableauStack(target, moving);
      if (target.kind === "foundation") {
        if (moving.length !== 1) return false;
        const c = moving[0]!;
        if (target.cards.length === 0) return c.rank === startRank;
        const top = target.cards[target.cards.length - 1]!;
        if (top.suit !== c.suit) return false;
        // Wrapping: A follows K
        const expected = top.rank === 13 ? 1 : (top.rank as number) + 1;
        return (c.rank as number) === expected;
      }
      return false;
    },
    canPickUp: (pile, count) => {
      if (pile.kind === "waste" || pile.kind === "freecell") return count === 1;
      if (pile.kind === "foundation") return count === 1;
      if (pile.kind === "stock") return false;
      if (pile.kind === "tableau") {
        const faceUp = pile.faceUpCount ?? 0;
        return count <= faceUp;
      }
      return false;
    },
  };
}

/** Fill empty tableau slots from the reserve pile (top card of reserve). */
function fillFromReserve(piles: Pile[]): Pile[] {
  let result = piles.map((p) => ({ ...p, cards: [...p.cards] }));
  const reserve = result.find((p) => p.id === "reserve");
  if (!reserve || reserve.cards.length === 0) return result;

  for (const id of TABLEAU_IDS) {
    const tab = result.find((p) => p.id === id)!;
    if (tab.cards.length === 0 && reserve.cards.length > 0) {
      const card = reserve.cards.pop()!;
      tab.cards.push(card);
      tab.faceUpCount = 1;
    }
  }
  return result;
}

export function initialState(seed: number, settings: CanfieldSettings): CanfieldState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Reserve: 13 cards (face-down stack, top is accessible)
  const reserve = deck.slice(0, 13);
  // Foundation starter: one card to f1
  const startCard = deck[13]!;
  const startRank = startCard.rank as number;
  // Tableau: 4 piles of 1 card each
  const tabCards = deck.slice(14, 18);
  // Stock: remaining
  const stockCards = deck.slice(18);

  const piles: Pile[] = [];

  // Reserve pile (shown top-only; we store bottom→top, pop from end)
  piles.push({ id: "reserve", kind: "stock", cards: reserve, faceUpCount: 1 });

  // Foundations
  piles.push({ id: "f1", kind: "foundation", cards: [startCard] });
  for (let i = 2; i <= 4; i++) {
    piles.push({ id: `f${i}`, kind: "foundation", cards: [] });
  }

  // Tableau: 4 columns, 1 card each, all face-up
  for (let i = 0; i < 4; i++) {
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards: [tabCards[i]!],
      faceUpCount: 1,
    });
  }

  // Stock (draw-3 style)
  piles.push({ id: "stock", kind: "stock", cards: stockCards, faceUpCount: 0 });
  piles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

  return {
    piles,
    score: 0,
    movesMade: 0,
    won: false,
    foundationStartRank: startRank,
    settings,
  };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(state: CanfieldState, action: CanfieldAction): CanfieldState {
  if (state.won) return state;

  const ruleset = makeRuleset(state.foundationStartRank);

  switch (action.type) {
    case "draw": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length === 0) return state;

      const drawCount = Math.min(3, stock.cards.length);
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      const drawn = ns.cards.splice(ns.cards.length - drawCount, drawCount);
      for (let i = drawn.length - 1; i >= 0; i--) nw.cards.push(drawn[i]!);

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "recycle": {
      const stock = getPile(state.piles, "stock");
      const waste = getPile(state.piles, "waste");
      if (!stock || !waste || stock.cards.length > 0 || waste.cards.length === 0) return state;

      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nw = newPiles.find((p) => p.id === "waste")!;
      ns.cards = [...nw.cards].reverse();
      nw.cards = [];

      return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
    }

    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, ruleset)) return state;

      let newPiles = applyMove(state.piles, move);
      // After any move, try to fill empty tableau slots from reserve
      newPiles = fillFromReserve(newPiles);

      const total = totalOnFoundations(newPiles);
      const won = total === 52;

      return {
        ...state,
        piles: newPiles,
        score: state.score + (getPile(state.piles, toPile)?.kind === "foundation" ? 5 : 0),
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "fill-from-reserve": {
      const newPiles = fillFromReserve(state.piles);
      if (newPiles === state.piles) return state;
      return { ...state, piles: newPiles };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CanfieldState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}

