import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DutchBlitzSettings {
  botSpeed: "slow" | "medium" | "fast";
  strictColors: boolean;
}

export type DutchBlitzPhase = "playing" | "done";

// Dutch Blitz uses a special 60-card deck with 4 colors × 1-10 × pump/pail/bucket/dutch-girl
// We simulate using standard suits for colors and ranks 1-10
// 4 colors: red, blue, yellow, green → mapped to ♥, ♦, ♠, ♣
// Blitz pile: 10 cards, wood piles: 3 cards face-up (stack), 3 post piles
// Center piles: build 1→10 same color from Ace up

export type DBColor = "red" | "blue" | "yellow" | "green";
export interface DBCard {
  color: DBColor;
  rank: number; // 1-10
  id: string;
}

export interface DutchBlitzState {
  settings: DutchBlitzSettings;
  phase: DutchBlitzPhase;
  // Player
  playerBlitzPile: readonly DBCard[];       // face-down, play from top
  playerWoodPile: readonly DBCard[];        // face-down draw pile
  playerWoodHand: readonly DBCard[];        // current flipped card(s) from wood pile
  playerPostPiles: readonly [readonly DBCard[], readonly DBCard[], readonly DBCard[]]; // 3 post piles, build any color alternating, or just hold
  // Bot
  botBlitzPile: readonly DBCard[];
  botWoodPile: readonly DBCard[];
  botWoodHand: readonly DBCard[];
  botPostPiles: readonly [readonly DBCard[], readonly DBCard[], readonly DBCard[]];
  // Shared center piles (up to 10 center piles; start empty, begun with a 1)
  centerPiles: readonly (readonly DBCard[])[];
  winner: "player" | "bot" | null;
  rngSeed: number;
  botTickCounter: number;
}

export type DutchBlitzAction =
  | { type: "play-blitz-to-center"; centerIdx: number }
  | { type: "play-post-to-center"; postIdx: number; centerIdx: number }
  | { type: "play-wood-to-center"; centerIdx: number }
  | { type: "play-blitz-to-post"; postIdx: number }
  | { type: "play-wood-to-post"; postIdx: number }
  | { type: "flip-wood" }
  | { type: "bot-tick" }
  | { type: "restart" };

const COLORS: DBColor[] = ["red", "blue", "yellow", "green"];

function makeDeck(color: DBColor): DBCard[] {
  const cards: DBCard[] = [];
  for (let r = 1; r <= 10; r++) {
    cards.push({ color, rank: r, id: `${color}-${r}` });
  }
  return cards;
}

function canPlayToCenter(card: DBCard, pile: readonly DBCard[]): boolean {
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1]!;
  return card.color === top.color && card.rank === top.rank + 1;
}

// Post piles: can place any card on empty, or any card on top (no restriction in this variant)
// In real Dutch Blitz post piles alternate color, but simplified: any card goes
function canPlayToPost(card: DBCard, pile: readonly DBCard[]): boolean {
  if (pile.length === 0) return true;
  const top = pile[pile.length - 1]!;
  return card.rank === top.rank - 1; // lower rank on top
}

export function initialState(seed: number, settings: DutchBlitzSettings): DutchBlitzState {
  const rng = mulberry32(seed);

  function shuffled(cards: DBCard[]): DBCard[] {
    return shuffle(cards, rng) as DBCard[];
  }

  const playerDecks = COLORS.map(c => shuffled(makeDeck(c)));
  const botDecks = COLORS.map(c => shuffled(makeDeck(c).map(d => ({ ...d, id: `bot-${d.id}` }))));

  // Merge all player cards into one shuffled pile, then split
  const playerAll = shuffled([...playerDecks[0]!, ...playerDecks[1]!, ...playerDecks[2]!, ...playerDecks[3]!]);
  const botAll = shuffled([...botDecks[0]!, ...botDecks[1]!, ...botDecks[2]!, ...botDecks[3]!]);

  // Blitz pile: top 10 cards
  const playerBlitzPile = playerAll.slice(0, 10);
  const playerRemainder = playerAll.slice(10);
  // 3 post piles: 1 card each face-up
  const playerPostPiles: [DBCard[], DBCard[], DBCard[]] = [
    [playerRemainder[0]!],
    [playerRemainder[1]!],
    [playerRemainder[2]!],
  ];
  const playerWoodPile = playerRemainder.slice(3);

  const botBlitzPile = botAll.slice(0, 10);
  const botRemainder = botAll.slice(10);
  const botPostPiles: [DBCard[], DBCard[], DBCard[]] = [
    [botRemainder[0]!],
    [botRemainder[1]!],
    [botRemainder[2]!],
  ];
  const botWoodPile = botRemainder.slice(3);

  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    settings,
    phase: "playing",
    playerBlitzPile,
    playerWoodPile,
    playerWoodHand: [],
    playerPostPiles,
    botBlitzPile,
    botWoodPile,
    botWoodHand: [],
    botPostPiles,
    centerPiles: [],
    winner: null,
    rngSeed: nextSeed,
    botTickCounter: 0,
  };
}

function tryAddCenter(piles: readonly (readonly DBCard[])[], card: DBCard): (readonly DBCard[])[] | null {
  // find a pile the card can go to
  for (let i = 0; i < piles.length; i++) {
    if (canPlayToCenter(card, piles[i]!)) {
      const newPile = [...piles[i]!, card];
      const result = [...piles];
      result[i] = newPile;
      return result;
    }
  }
  // Start a new pile if rank === 1
  if (card.rank === 1) {
    return [...piles, [card]];
  }
  return null;
}

export function reducer(state: DutchBlitzState, action: DutchBlitzAction): DutchBlitzState {
  if (state.phase === "done" && action.type !== "restart") return state;

  if (action.type === "restart") {
    return initialState(state.rngSeed, state.settings);
  }

  if (action.type === "flip-wood") {
    if (state.playerWoodPile.length === 0 && state.playerWoodHand.length === 0) return state;
    if (state.playerWoodPile.length === 0) {
      // Recycle hand back to pile
      return {
        ...state,
        playerWoodPile: [...state.playerWoodHand].reverse(),
        playerWoodHand: [],
      };
    }
    // Flip top card from wood pile to hand
    const card = state.playerWoodPile[state.playerWoodPile.length - 1]!;
    return {
      ...state,
      playerWoodPile: state.playerWoodPile.slice(0, -1),
      playerWoodHand: [card],
    };
  }

  if (action.type === "play-blitz-to-center") {
    const card = state.playerBlitzPile[state.playerBlitzPile.length - 1];
    if (!card) return state;
    const newCenter = tryAddCenter(state.centerPiles, card);
    if (!newCenter) return state;
    const newBlitz = state.playerBlitzPile.slice(0, -1);
    const winner = newBlitz.length === 0 ? "player" : null;
    return {
      ...state,
      playerBlitzPile: newBlitz,
      centerPiles: newCenter,
      winner,
      phase: winner ? "done" : "playing",
    };
  }

  if (action.type === "play-wood-to-center") {
    const card = state.playerWoodHand[0];
    if (!card) return state;
    const newCenter = tryAddCenter(state.centerPiles, card);
    if (!newCenter) return state;
    return {
      ...state,
      playerWoodHand: [],
      centerPiles: newCenter,
    };
  }

  if (action.type === "play-post-to-center") {
    const { postIdx } = action;
    const postPile = state.playerPostPiles[postIdx];
    if (!postPile || postPile.length === 0) return state;
    const card = postPile[postPile.length - 1]!;
    const newCenter = tryAddCenter(state.centerPiles, card);
    if (!newCenter) return state;
    const newPost = postPile.slice(0, -1);
    const newPosts: [readonly DBCard[], readonly DBCard[], readonly DBCard[]] = [
      ...state.playerPostPiles,
    ] as unknown as [readonly DBCard[], readonly DBCard[], readonly DBCard[]];
    newPosts[postIdx] = newPost;
    return {
      ...state,
      playerPostPiles: newPosts,
      centerPiles: newCenter,
    };
  }

  if (action.type === "play-blitz-to-post") {
    const { postIdx } = action;
    const card = state.playerBlitzPile[state.playerBlitzPile.length - 1];
    if (!card) return state;
    const postPile = state.playerPostPiles[postIdx]!;
    if (!canPlayToPost(card, postPile)) return state;
    const newBlitz = state.playerBlitzPile.slice(0, -1);
    const newPost = [...postPile, card];
    const newPosts: [readonly DBCard[], readonly DBCard[], readonly DBCard[]] = [
      ...state.playerPostPiles,
    ] as unknown as [readonly DBCard[], readonly DBCard[], readonly DBCard[]];
    newPosts[postIdx] = newPost;
    const winner = newBlitz.length === 0 ? "player" : null;
    return {
      ...state,
      playerBlitzPile: newBlitz,
      playerPostPiles: newPosts,
      winner,
      phase: winner ? "done" : "playing",
    };
  }

  if (action.type === "play-wood-to-post") {
    const { postIdx } = action;
    const card = state.playerWoodHand[0];
    if (!card) return state;
    const postPile = state.playerPostPiles[postIdx]!;
    if (!canPlayToPost(card, postPile)) return state;
    const newPost = [...postPile, card];
    const newPosts: [readonly DBCard[], readonly DBCard[], readonly DBCard[]] = [
      ...state.playerPostPiles,
    ] as unknown as [readonly DBCard[], readonly DBCard[], readonly DBCard[]];
    newPosts[postIdx] = newPost;
    return {
      ...state,
      playerWoodHand: [],
      playerPostPiles: newPosts,
    };
  }

  if (action.type === "bot-tick") {
    // Bot tries to play: first from blitz pile to center, then from post to center
    let s = state;
    const botSpeed = state.settings.botSpeed;
    const tickTarget = botSpeed === "fast" ? 1 : botSpeed === "medium" ? 2 : 4;
    const newCounter = s.botTickCounter + 1;
    if (newCounter < tickTarget) {
      return { ...s, botTickCounter: newCounter };
    }
    s = { ...s, botTickCounter: 0 };

    // Try blitz → center
    const blitzTop = s.botBlitzPile[s.botBlitzPile.length - 1];
    if (blitzTop) {
      const newCenter = tryAddCenter(s.centerPiles, blitzTop);
      if (newCenter) {
        const newBlitz = s.botBlitzPile.slice(0, -1);
        const winner = newBlitz.length === 0 ? "bot" : null;
        return {
          ...s,
          botBlitzPile: newBlitz,
          centerPiles: newCenter,
          winner,
          phase: winner ? "done" : "playing",
        };
      }
    }

    // Try post → center
    for (let i = 0; i < 3; i++) {
      const post = s.botPostPiles[i]!;
      const top = post[post.length - 1];
      if (top) {
        const newCenter = tryAddCenter(s.centerPiles, top);
        if (newCenter) {
          const newPost = post.slice(0, -1);
          const newPosts: [readonly DBCard[], readonly DBCard[], readonly DBCard[]] = [
            ...s.botPostPiles,
          ] as unknown as [readonly DBCard[], readonly DBCard[], readonly DBCard[]];
          newPosts[i] = newPost;
          return { ...s, botPostPiles: newPosts, centerPiles: newCenter };
        }
      }
    }

    // Flip wood and try to play
    if (s.botWoodHand.length === 0 && s.botWoodPile.length > 0) {
      const card = s.botWoodPile[s.botWoodPile.length - 1]!;
      s = { ...s, botWoodPile: s.botWoodPile.slice(0, -1), botWoodHand: [card] };
    }
    const woodTop = s.botWoodHand[0];
    if (woodTop) {
      const newCenter = tryAddCenter(s.centerPiles, woodTop);
      if (newCenter) {
        return { ...s, botWoodHand: [], centerPiles: newCenter };
      }
      // Try wood → post
      for (let i = 0; i < 3; i++) {
        const post = s.botPostPiles[i]!;
        if (canPlayToPost(woodTop, post)) {
          const newPost = [...post, woodTop];
          const newPosts: [readonly DBCard[], readonly DBCard[], readonly DBCard[]] = [
            ...s.botPostPiles,
          ] as unknown as [readonly DBCard[], readonly DBCard[], readonly DBCard[]];
          newPosts[i] = newPost;
          return { ...s, botWoodHand: [], botPostPiles: newPosts };
        }
      }
    }

    // Recycle wood
    if (s.botWoodPile.length === 0 && s.botWoodHand.length > 0) {
      return { ...s, botWoodPile: [...s.botWoodHand].reverse(), botWoodHand: [] };
    }

    return s;
  }

  return state;
}

export function isTerminal(state: DutchBlitzState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  // Score: cards played to center minus penalty for cards in blitz pile
  const blitzLeft = state.playerBlitzPile.length;
  return { score: state.winner === "player" ? 100 - blitzLeft : Math.max(0, 50 - blitzLeft * 2) };
}

export { canPlayToCenter, canPlayToPost };
