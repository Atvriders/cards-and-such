import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ligretto: color-coded deck, ranks 1-10, build 1→10 same color in center
// Each player has a Ligretto pile (10 cards), 3 row cards, rest as hand

export type LiColor = "red" | "blue" | "green" | "yellow";

export interface LiCard {
  color: LiColor;
  rank: number; // 1-10
  id: string;
}

export interface LigrettoSettings {
  botSpeed: "slow" | "medium" | "fast";
}

export type LigrettoPhase = "playing" | "done";

export interface LigrettoState {
  settings: LigrettoSettings;
  phase: LigrettoPhase;
  // Player
  playerLigretto: readonly LiCard[];   // face-down stack, play top
  playerRow: readonly [LiCard | null, LiCard | null, LiCard | null]; // 3 face-up row cards
  playerHand: readonly LiCard[];       // draw pile
  playerHandTop: LiCard | null;        // current top card of hand
  // Bot
  botLigretto: readonly LiCard[];
  botRow: readonly [LiCard | null, LiCard | null, LiCard | null];
  botHand: readonly LiCard[];
  botHandTop: LiCard | null;
  // Shared center piles: color→pile building 1→10
  centerPiles: Partial<Record<LiColor, readonly LiCard[]>>;
  winner: "player" | "bot" | null;
  rngSeed: number;
  botTickCounter: number;
}

export type LigrettoAction =
  | { type: "play-ligretto-to-center" }
  | { type: "play-row-to-center"; rowIdx: number }
  | { type: "play-hand-to-center" }
  | { type: "play-ligretto-to-row"; rowIdx: number }
  | { type: "flip-hand" }
  | { type: "bot-tick" }
  | { type: "restart" };

const COLORS: LiColor[] = ["red", "blue", "green", "yellow"];

function makeLiDeck(color: LiColor, prefix = ""): LiCard[] {
  const cards: LiCard[] = [];
  for (let r = 1; r <= 10; r++) {
    cards.push({ color, rank: r, id: `${prefix}${color}-${r}` });
  }
  return cards;
}

function canToCenter(card: LiCard, piles: Partial<Record<LiColor, readonly LiCard[]>>): boolean {
  const pile = piles[card.color] ?? [];
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1]!;
  return card.rank === top.rank + 1;
}

function playCenter(card: LiCard, piles: Partial<Record<LiColor, readonly LiCard[]>>): Partial<Record<LiColor, readonly LiCard[]>> {
  const existing = piles[card.color] ?? [];
  return { ...piles, [card.color]: [...existing, card] };
}

function liShuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!; out[i] = out[j]!; out[j] = tmp;
  }
  return out;
}

export function initialState(seed: number, settings: LigrettoSettings): LigrettoState {
  const rng = mulberry32(seed);

  const playerAll = liShuffle([...COLORS.flatMap(c => makeLiDeck(c))], rng);
  const botAll = liShuffle([...COLORS.flatMap(c => makeLiDeck(c, "bot-"))], rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  function deal(cards: LiCard[]) {
    const ligretto = cards.slice(0, 10);
    const row: [LiCard | null, LiCard | null, LiCard | null] = [cards[10]!, cards[11]!, cards[12]!];
    const hand = cards.slice(13);
    return { ligretto, row, hand };
  }

  const p = deal(playerAll);
  const b = deal(botAll);

  return {
    settings,
    phase: "playing",
    playerLigretto: p.ligretto,
    playerRow: p.row,
    playerHand: p.hand,
    playerHandTop: null,
    botLigretto: b.ligretto,
    botRow: b.row,
    botHand: b.hand,
    botHandTop: null,
    centerPiles: {},
    winner: null,
    rngSeed: nextSeed,
    botTickCounter: 0,
  };
}

type Row3 = readonly [LiCard | null, LiCard | null, LiCard | null];

function setRow(row: Row3, idx: number, val: LiCard | null): Row3 {
  const out = [...row] as [LiCard | null, LiCard | null, LiCard | null];
  out[idx] = val;
  return out;
}

export function reducer(state: LigrettoState, action: LigrettoAction): LigrettoState {
  if (state.phase === "done" && action.type !== "restart") return state;
  if (action.type === "restart") return initialState(state.rngSeed, state.settings);

  if (action.type === "flip-hand") {
    if (state.playerHand.length === 0 && !state.playerHandTop) return state;
    if (state.playerHand.length === 0) return state; // already showing top
    const card = state.playerHand[state.playerHand.length - 1]!;
    return { ...state, playerHand: state.playerHand.slice(0, -1), playerHandTop: card };
  }

  if (action.type === "play-ligretto-to-center") {
    const card = state.playerLigretto[state.playerLigretto.length - 1];
    if (!card || !canToCenter(card, state.centerPiles)) return state;
    const newPiles = playCenter(card, state.centerPiles);
    const newLig = state.playerLigretto.slice(0, -1);
    const winner = newLig.length === 0 ? "player" : null;
    return { ...state, playerLigretto: newLig, centerPiles: newPiles, winner, phase: winner ? "done" : "playing" };
  }

  if (action.type === "play-row-to-center") {
    const { rowIdx } = action;
    const card = state.playerRow[rowIdx];
    if (!card || !canToCenter(card, state.centerPiles)) return state;
    const newPiles = playCenter(card, state.centerPiles);
    // Refill row slot from ligretto pile
    const ligTop = state.playerLigretto[state.playerLigretto.length - 1] ?? null;
    const newLig = ligTop ? state.playerLigretto.slice(0, -1) : state.playerLigretto;
    const newRow = setRow(state.playerRow, rowIdx, ligTop);
    const winner = newLig.length === 0 && ligTop === null ? "player" : null;
    return { ...state, playerRow: newRow, playerLigretto: newLig, centerPiles: newPiles, winner, phase: winner ? "done" : "playing" };
  }

  if (action.type === "play-hand-to-center") {
    const card = state.playerHandTop;
    if (!card || !canToCenter(card, state.centerPiles)) return state;
    const newPiles = playCenter(card, state.centerPiles);
    return { ...state, playerHandTop: null, centerPiles: newPiles };
  }

  if (action.type === "play-ligretto-to-row") {
    const { rowIdx } = action;
    if (state.playerRow[rowIdx] !== null) return state; // slot occupied
    const card = state.playerLigretto[state.playerLigretto.length - 1];
    if (!card) return state;
    const newLig = state.playerLigretto.slice(0, -1);
    const newRow = setRow(state.playerRow, rowIdx, card);
    const winner = newLig.length === 0 ? "player" : null;
    return { ...state, playerLigretto: newLig, playerRow: newRow, winner, phase: winner ? "done" : "playing" };
  }

  if (action.type === "bot-tick") {
    let s = state;
    const tickTarget = s.settings.botSpeed === "fast" ? 1 : s.settings.botSpeed === "medium" ? 2 : 4;
    const newCounter = s.botTickCounter + 1;
    if (newCounter < tickTarget) return { ...s, botTickCounter: newCounter };
    s = { ...s, botTickCounter: 0 };

    // Bot: ligretto → center
    const ligTop = s.botLigretto[s.botLigretto.length - 1];
    if (ligTop && canToCenter(ligTop, s.centerPiles)) {
      const newPiles = playCenter(ligTop, s.centerPiles);
      const newLig = s.botLigretto.slice(0, -1);
      const winner = newLig.length === 0 ? "bot" : null;
      return { ...s, botLigretto: newLig, centerPiles: newPiles, winner, phase: winner ? "done" : "playing" };
    }

    // Bot: row → center
    for (let i = 0; i < 3; i++) {
      const rowCard = s.botRow[i];
      if (rowCard && canToCenter(rowCard, s.centerPiles)) {
        const newPiles = playCenter(rowCard, s.centerPiles);
        const refill = s.botLigretto[s.botLigretto.length - 1] ?? null;
        const newLig = refill ? s.botLigretto.slice(0, -1) : s.botLigretto;
        const newRow = setRow(s.botRow, i, refill);
        return { ...s, botRow: newRow, botLigretto: newLig, centerPiles: newPiles };
      }
    }

    // Flip hand and try
    if (!s.botHandTop && s.botHand.length > 0) {
      const card = s.botHand[s.botHand.length - 1]!;
      s = { ...s, botHand: s.botHand.slice(0, -1), botHandTop: card };
    }
    if (s.botHandTop && canToCenter(s.botHandTop, s.centerPiles)) {
      const newPiles = playCenter(s.botHandTop, s.centerPiles);
      return { ...s, botHandTop: null, centerPiles: newPiles };
    }

    return s;
  }

  return state;
}

export function isTerminal(state: LigrettoState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  const left = state.playerLigretto.length;
  return { score: state.winner === "player" ? 100 - left : Math.max(0, 40 - left * 2) };
}

export { canToCenter };
