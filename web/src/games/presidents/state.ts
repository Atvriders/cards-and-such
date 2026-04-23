import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Presidents (Scum / Asshole variant)
// After each round, president/scum swap cards.
// 4 players, climbing game identical to Big Two ranks
// but with 2 as highest and no suit-based tiebreak
// We play best-of-3 rounds.

export interface PresidentsSettings { rounds: "1" | "2" | "3" }

export type PresidentsPhase = "swap" | "playing" | "roundEnd" | "done";

export type Title = "President" | "Vice-President" | "Vice-Scum" | "Scum";

export interface PresidentsState {
  settings: PresidentsSettings;
  hands: readonly (readonly Card[])[];
  turn: number;
  lastPlay: readonly Card[] | null;
  lastPlaySeat: number | null;
  passCount: number;
  finishOrder: readonly number[];
  phase: PresidentsPhase;
  titles: readonly Title[] | null; // from previous round
  swapDone: boolean;
  swapCardsSelected: readonly string[]; // player's cards selected to give to scum
  playerRoundWins: number;
  botRoundWins: number;
  currentRound: number;
  rngSeed: number;
}

export type PresidentsAction =
  | { type: "play"; cardIds: string[] }
  | { type: "pass" }
  | { type: "selectSwapCard"; cardId: string }
  | { type: "confirmSwap" }
  | { type: "nextRound" };

export function rankVal(r: Rank): number {
  if (r === 2) return 15;
  if (r === 1) return 14;
  return r;
}

export function isLegalPlay(cards: readonly Card[], lastPlay: readonly Card[] | null): boolean {
  if (cards.length === 0) return false;
  const r = cards[0]!.rank;
  if (!cards.every(c => c.rank === r)) return false;
  if (lastPlay === null) return true;
  if (cards.length !== lastPlay.length) return false;
  return rankVal(r) > rankVal(lastPlay[0]!.rank);
}

function botPlay(hand: readonly Card[], lastPlay: readonly Card[] | null): string[] | null {
  if (lastPlay === null) {
    return [[...hand].sort((a, b) => rankVal(a.rank) - rankVal(b.rank))[0]!.id];
  }
  const n = lastPlay.length;
  const groups = new Map<Rank, Card[]>();
  for (const c of hand) { const a = groups.get(c.rank) ?? []; a.push(c); groups.set(c.rank, a); }
  const cands: Card[][] = [];
  for (const [, g] of groups) {
    if (g.length >= n) {
      const sub = g.slice(0, n);
      if (isLegalPlay(sub, lastPlay)) cands.push(sub);
    }
  }
  if (!cands.length) return null;
  cands.sort((a, b) => rankVal(a[0]!.rank) - rankVal(b[0]!.rank));
  return cands[0]!.map(c => c.id);
}

function nextActive(state: PresidentsState, from: number): number {
  let next = (from + 1) % 4;
  for (let i = 0; i < 4; i++) {
    if (!state.finishOrder.includes(next) && state.hands[next]!.length > 0) return next;
    next = (next + 1) % 4;
  }
  return next;
}

function applyPlay(state: PresidentsState, seat: number, cardIds: string[]): PresidentsState {
  const hand = state.hands[seat]!;
  const played = cardIds.map(id => hand.find(c => c.id === id)!);
  if (played.some(c => !c) || !isLegalPlay(played, state.lastPlay)) return state;

  const newHand = hand.filter(c => !cardIds.includes(c.id));
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  let finishOrder = [...state.finishOrder];
  if (newHand.length === 0) finishOrder = [...finishOrder, seat];

  if (finishOrder.length >= 3) {
    const last = [0, 1, 2, 3].find(s => !finishOrder.includes(s))!;
    const finalOrder = [...finishOrder, last];
    const titleMap: Title[] = ["President", "Vice-President", "Vice-Scum", "Scum"];
    const titles: Title[] = [0, 1, 2, 3].map(s => titleMap[finalOrder.indexOf(s)]!);

    const pWins = state.playerRoundWins + (finalOrder[0] === 0 ? 1 : 0);
    const bWins = state.botRoundWins + (finalOrder[0] !== 0 ? 1 : 0);
    const maxRounds = parseInt(state.settings.rounds, 10);
    const isDone = pWins >= maxRounds || bWins >= maxRounds || state.currentRound >= maxRounds;

    return {
      ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0,
      finishOrder: finalOrder, phase: isDone ? "done" : "roundEnd",
      titles, playerRoundWins: pWins, botRoundWins: bWins,
    };
  }

  const next = nextActive({ ...state, hands: newHands, finishOrder }, seat);
  return { ...state, hands: newHands, lastPlay: played, lastPlaySeat: seat, passCount: 0, turn: next, finishOrder };
}

function applyPass(state: PresidentsState, seat: number): PresidentsState {
  const active = [0, 1, 2, 3].filter(s => !state.finishOrder.includes(s) && state.hands[s]!.length > 0);
  const newPass = state.passCount + 1;
  if (newPass >= active.length - 1) {
    const lead = state.lastPlaySeat ?? active[0]!;
    return { ...state, passCount: 0, lastPlay: null, lastPlaySeat: null, turn: lead };
  }
  return { ...state, passCount: newPass, turn: nextActive(state, seat) };
}

function runBots(state: PresidentsState): PresidentsState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 400) {
    safety++;
    const seat = s.turn;
    if (s.finishOrder.includes(seat)) { s = applyPass(s, seat); continue; }
    const play = botPlay(s.hands[seat]!, s.lastPlay);
    if (play) {
      const next = applyPlay(s, seat, play);
      s = next === s ? applyPass(s, seat) : next;
    } else {
      s = applyPass(s, seat);
    }
  }
  return s;
}

function dealRound(seed: number, settings: PresidentsSettings, prevState: PresidentsState | null): PresidentsState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const hands: Card[][] = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  // Find 3♣ for lead
  let leadSeat = 0;
  for (let s = 0; s < 4; s++) {
    if (hands[s]!.some(c => c.rank === 3 && c.suit === "♣")) { leadSeat = s; break; }
  }

  const state: PresidentsState = {
    settings,
    hands,
    turn: leadSeat,
    lastPlay: null,
    lastPlaySeat: null,
    passCount: 0,
    finishOrder: [],
    phase: prevState?.titles ? "swap" : "playing",
    titles: prevState?.titles ?? null,
    swapDone: false,
    swapCardsSelected: [],
    playerRoundWins: prevState?.playerRoundWins ?? 0,
    botRoundWins: prevState?.botRoundWins ?? 0,
    currentRound: (prevState?.currentRound ?? 0) + 1,
    rngSeed: nextSeed,
  };

  if (state.phase === "playing" && leadSeat !== 0) return runBots(state);
  return state;
}

export function initialState(seed: number, settings: PresidentsSettings): PresidentsState {
  return dealRound(seed, settings, null);
}

export function reducer(state: PresidentsState, action: PresidentsAction): PresidentsState {
  if (state.phase === "done") return state;

  if (state.phase === "swap") {
    if (action.type === "selectSwapCard") {
      const { cardId } = action;
      const already = state.swapCardsSelected.includes(cardId);
      let next: string[];
      if (already) {
        next = state.swapCardsSelected.filter(id => id !== cardId);
      } else {
        if (state.swapCardsSelected.length >= 1) return state; // only give 1 card
        next = [...state.swapCardsSelected, cardId];
      }
      return { ...state, swapCardsSelected: next };
    }

    if (action.type === "confirmSwap") {
      if (state.swapCardsSelected.length !== 1) return state;
      if (!state.titles) return state;

      // President (seat 0 if they were president) gets scum's best card; scum gets president's chosen card
      // Find president seat and scum seat from titles
      const presidSeat = state.titles.indexOf("President");
      const scumSeat = state.titles.indexOf("Scum");

      const playerGiveCard = state.swapCardsSelected[0]!;

      // Player is always seat 0; if player is president, they give to scum and get scum's best
      // If player is scum, they give to president and get president's best
      // Simplified: only swap if player is president or scum
      const newHands = state.hands.map(h => [...h]);

      if (presidSeat === 0) {
        // Player is president: give chosen card to scum, get scum's best
        const scumHand = [...newHands[scumSeat]!];
        const scumBest = [...scumHand].sort((a, b) => rankVal(b.rank) - rankVal(a.rank))[0]!;
        // Remove best from scum
        newHands[scumSeat] = scumHand.filter(c => c.id !== scumBest.id);
        // Add player's chosen card to scum
        const pCard = newHands[0]!.find(c => c.id === playerGiveCard)!;
        newHands[scumSeat] = [...newHands[scumSeat]!, pCard];
        // Remove from player, add scum's best
        newHands[0] = newHands[0]!.filter(c => c.id !== playerGiveCard);
        newHands[0] = [...newHands[0]!, scumBest];
      } else if (scumSeat === 0) {
        // Player is scum: give chosen card to president, get president's best
        const presHand = [...newHands[presidSeat]!];
        const presBest = [...presHand].sort((a, b) => rankVal(b.rank) - rankVal(a.rank))[0]!;
        newHands[presidSeat] = presHand.filter(c => c.id !== presBest.id);
        const pCard = newHands[0]!.find(c => c.id === playerGiveCard)!;
        newHands[presidSeat] = [...newHands[presidSeat]!, pCard];
        newHands[0] = newHands[0]!.filter(c => c.id !== playerGiveCard);
        newHands[0] = [...newHands[0]!, presBest];
      }
      // Vice positions don't swap in simplified version

      // Find 3♣ for lead
      let leadSeat = 0;
      for (let s = 0; s < 4; s++) {
        if (newHands[s]!.some(c => c.rank === 3 && c.suit === "♣")) { leadSeat = s; break; }
      }

      let next: PresidentsState = {
        ...state, hands: newHands, phase: "playing",
        lastPlay: null, lastPlaySeat: null, passCount: 0, finishOrder: [],
        swapDone: true, swapCardsSelected: [], turn: leadSeat,
      };

      if (leadSeat !== 0) next = runBots(next);
      return next;
    }
    return state;
  }

  if (state.phase === "roundEnd") {
    if (action.type === "nextRound") {
      return dealRound(state.rngSeed, state.settings, state);
    }
    return state;
  }

  if (state.phase === "playing") {
    if (state.turn !== 0) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let s: PresidentsState = { ...state, rngSeed: nextSeed };

    if (action.type === "play") {
      const next = applyPlay(s, 0, action.cardIds);
      if (next === s) return state;
      s = next;
    } else if (action.type === "pass") {
      s = applyPass(s, 0);
    } else {
      return state;
    }

    if (s.phase === "roundEnd" || s.phase === "done") return s;
    return runBots(s);
  }

  return state;
}

export function isTerminal(state: PresidentsState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.playerRoundWins > state.botRoundWins ? 100 : 20 };
}
