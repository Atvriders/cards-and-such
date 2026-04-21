import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, isRed } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KingsInTheCornerSettings {
  _dummy?: undefined;
}

export type KitCPile = {
  id: string;
  kind: "tableau" | "corner" | "hand" | "stock";
  cards: Card[];
};

export interface KingsInTheCornerState {
  /** Piles: tableau N/S/E/W, corners NW/NE/SE/SW, player hands h0..h3, stock */
  piles: KitCPile[];
  currentPlayer: 0 | 1 | 2 | 3;
  /** Number of players (always 4: 1 human + 3 bots). */
  numPlayers: 4;
  drawnThisTurn: boolean;
  won: boolean;
  score: number;
  movesMade: number;
}

export type KingsInTheCornerAction =
  | { type: "play"; fromPile: string; toPile: string }
  | { type: "draw" }
  | { type: "end-turn" }
  | { type: "bot-turn" };

const TABLEAU_IDS = ["tN", "tS", "tE", "tW"] as const;
const CORNER_IDS = ["cNW", "cNE", "cSE", "cSW"] as const;

function canStack(topCard: Card, cardToPlay: Card): boolean {
  // Descending alternating color, like Klondike tableau
  const topIsRed = isRed(topCard.suit);
  const playIsRed = isRed(cardToPlay.suit);
  return topIsRed !== playIsRed && (topCard.rank as number) === (cardToPlay.rank as number) + 1;
}

function canPlayOnPile(pile: KitCPile, card: Card): boolean {
  if (pile.kind === "corner") {
    if (pile.cards.length === 0) return card.rank === 13; // Kings only
    return canStack(pile.cards[pile.cards.length - 1]!, card);
  }
  if (pile.kind === "tableau") {
    if (pile.cards.length === 0) return true; // Empty tableau: any card (but not Kings)
    return canStack(pile.cards[pile.cards.length - 1]!, card);
  }
  return false;
}

export function getLegalPlays(state: KingsInTheCornerState): Array<{ fromPile: string; toPile: string }> {
  const plays: Array<{ fromPile: string; toPile: string }> = [];
  const handId = `h${state.currentPlayer}`;
  const hand = state.piles.find((p) => p.id === handId);
  if (!hand) return plays;

  const targets = [...TABLEAU_IDS, ...CORNER_IDS].map((id) => state.piles.find((p) => p.id === id)!);

  // Cards from hand to tableau/corner
  for (const card of hand.cards) {
    for (const target of targets) {
      if (canPlayOnPile(target, card)) {
        plays.push({ fromPile: handId, toPile: target.id });
      }
    }
  }

  // Move tableau pile onto another tableau/corner
  for (const srcId of [...TABLEAU_IDS, ...CORNER_IDS]) {
    const src = state.piles.find((p) => p.id === srcId);
    if (!src || src.cards.length === 0) continue;
    const bottomCard = src.cards[0]!;
    for (const target of targets) {
      if (target.id === srcId) continue;
      if (canPlayOnPile(target, bottomCard)) {
        plays.push({ fromPile: srcId, toPile: target.id });
      }
    }
  }

  return plays;
}

function botPlay(state: KingsInTheCornerState): KingsInTheCornerState {
  // Bot draws, then plays all legal moves, then ends turn
  let s = state;

  // Draw first
  if (!s.drawnThisTurn) {
    s = reducer(s, { type: "draw" });
  }

  // Play all legal moves greedily
  let moved = true;
  while (moved) {
    moved = false;
    const plays = getLegalPlays(s);
    if (plays.length > 0) {
      s = reducer(s, { type: "play", fromPile: plays[0]!.fromPile, toPile: plays[0]!.toPile });
      moved = true;
    }
  }

  // End turn
  s = reducer(s, { type: "end-turn" });
  return s;
}

export function initialState(seed: number, _settings: KingsInTheCornerSettings): KingsInTheCornerState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: KitCPile[] = [];

  // Deal 7 cards to each of 4 players
  let idx = 0;
  for (let p = 0; p < 4; p++) {
    piles.push({ id: `h${p}`, kind: "hand", cards: deck.slice(idx, idx + 7) });
    idx += 7;
  }

  // 4 face-up tableau piles (N/S/E/W)
  for (const id of TABLEAU_IDS) {
    piles.push({ id, kind: "tableau", cards: [deck[idx++]!] });
  }

  // 4 corner piles (empty)
  for (const id of CORNER_IDS) {
    piles.push({ id, kind: "corner", cards: [] });
  }

  // Stock: remaining cards
  piles.push({ id: "stock", kind: "stock", cards: deck.slice(idx) });

  return {
    piles,
    currentPlayer: 0,
    numPlayers: 4,
    drawnThisTurn: false,
    won: false,
    score: 0,
    movesMade: 0,
  };
}

function getPile(piles: KitCPile[], id: string): KitCPile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: KingsInTheCornerState, action: KingsInTheCornerAction): KingsInTheCornerState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.drawnThisTurn) return state;
      const stock = getPile(state.piles, "stock");
      const handId = `h${state.currentPlayer}`;
      const hand = getPile(state.piles, handId);
      if (!stock || !hand || stock.cards.length === 0) {
        // No cards to draw — mark drawn anyway so turn can proceed
        return { ...state, drawnThisTurn: true };
      }
      const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const ns = newPiles.find((p) => p.id === "stock")!;
      const nh = newPiles.find((p) => p.id === handId)!;
      const card = ns.cards.pop()!;
      nh.cards.push(card);
      return { ...state, piles: newPiles, drawnThisTurn: true };
    }

    case "play": {
      if (!state.drawnThisTurn) return state; // must draw first
      const { fromPile, toPile } = action;
      const src = getPile(state.piles, fromPile);
      const dst = getPile(state.piles, toPile);
      if (!src || !dst || src.cards.length === 0) return state;

      // Playing a single card from hand
      if (src.kind === "hand") {
        // Find which card can go on dst — try each card in hand
        const cardIdx = src.cards.findIndex((c) => canPlayOnPile(dst, c));
        if (cardIdx === -1) return state;
        const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
        const ns = newPiles.find((p) => p.id === fromPile)!;
        const nd = newPiles.find((p) => p.id === toPile)!;
        const [card] = ns.cards.splice(cardIdx, 1);
        nd.cards.push(card!);
        const hand0 = newPiles.find((p) => p.id === "h0")!;
        const won = state.currentPlayer === 0 && hand0.cards.length === 0;
        return {
          ...state,
          piles: newPiles,
          movesMade: state.movesMade + 1,
          won,
          score: won ? 100 : 0,
        };
      }

      // Moving a whole tableau/corner pile onto another pile
      if (src.kind === "tableau" || src.kind === "corner") {
        const bottom = src.cards[0]!;
        if (!canPlayOnPile(dst, bottom)) return state;
        const newPiles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
        const ns = newPiles.find((p) => p.id === fromPile)!;
        const nd = newPiles.find((p) => p.id === toPile)!;
        nd.cards.push(...ns.cards);
        ns.cards = [];
        return { ...state, piles: newPiles, movesMade: state.movesMade + 1 };
      }

      return state;
    }

    case "end-turn": {
      if (!state.drawnThisTurn) return state;
      const nextPlayer = ((state.currentPlayer + 1) % 4) as 0 | 1 | 2 | 3;
      return { ...state, currentPlayer: nextPlayer, drawnThisTurn: false };
    }

    case "bot-turn": {
      if (state.currentPlayer === 0) return state; // Not a bot's turn
      return botPlay(state);
    }

    default:
      return state;
  }
}

export function isTerminal(state: KingsInTheCornerState): { score: number } | null {
  // Win: player 0's hand is empty
  const hand0 = state.piles.find((p) => p.id === "h0");
  if (hand0 && hand0.cards.length === 0 && state.movesMade > 0) return { score: 100 };
  // Could also check if any player has empty hand (bot wins = player loses)
  for (let p = 1; p < 4; p++) {
    const h = state.piles.find((pp) => pp.id === `h${p}`);
    if (h && h.cards.length === 0) return { score: 0 };
  }
  return null;
}
