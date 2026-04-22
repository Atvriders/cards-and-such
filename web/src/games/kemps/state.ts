import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Kemps: 4 players, 2 teams
// Solo variant: you + bot partner vs 2 bot opponents
// 4 cards dealt to each player, 4 center cards face-up
// Swap: discard one card to center, pick up one from center
// Goal: get 4-of-a-kind in your hand → signal partner → partner calls KEMPS
// Opponent can call STOP-KEMPS if they think you have 4-of-a-kind

export interface KempsSettings {
  rounds: "3" | "5";
}

export type KempsPhase = "swapping" | "kemps-called" | "round-over" | "done";

export interface KempsState {
  settings: KempsSettings;
  phase: KempsPhase;
  // Hands: 0=player, 1=partner(bot), 2=opp1(bot), 3=opp2(bot)
  hands: readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[]];
  center: readonly Card[];   // 4 face-up center cards to swap with
  // Scoring
  teamScore: number;    // player + partner score
  oppScore: number;     // opponent team score
  roundsPlayed: number;
  targetRounds: number;
  winner: "team" | "opp" | null;
  // Round state
  roundWinner: "team" | "opp" | "none" | null;
  roundMessage: string;
  // Bot state
  rngSeed: number;
  botTickCounter: number;
  // Signal: player signals partner
  playerSignaled: boolean;
  // Prevent instant re-kemps
  kempsCalledBy: number | null; // seat index
}

export type KempsAction =
  | { type: "swap"; handIdx: number; centerIdx: number }  // swap player card with center card
  | { type: "signal" }     // player signals partner (they have 4-of-a-kind)
  | { type: "stop-kemps" } // player calls stop-kemps on opponent
  | { type: "next-round" }
  | { type: "bot-tick" }
  | { type: "restart" };

function hasFourOfAKind(hand: readonly Card[]): Rank | null {
  const counts: Partial<Record<Rank, number>> = {};
  for (const c of hand) counts[c.rank] = (counts[c.rank] ?? 0) + 1;
  for (const [rank, count] of Object.entries(counts)) {
    if (count === 4) return Number(rank) as Rank;
  }
  return null;
}

export function initialState(seed: number, settings: KempsSettings): KempsState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: [Card[], Card[], Card[], Card[]] = [
    deck.slice(0, 4),
    deck.slice(4, 8),
    deck.slice(8, 12),
    deck.slice(12, 16),
  ];
  const center = deck.slice(16, 20);

  return {
    settings,
    phase: "swapping",
    hands,
    center,
    teamScore: 0,
    oppScore: 0,
    roundsPlayed: 0,
    targetRounds: Number(settings.rounds),
    winner: null,
    roundWinner: null,
    roundMessage: "",
    rngSeed: nextSeed,
    botTickCounter: 0,
    playerSignaled: false,
    kempsCalledBy: null,
  };
}

type Hands4 = readonly [readonly Card[], readonly Card[], readonly Card[], readonly Card[]];

function setHand(hands: Hands4, idx: number, val: readonly Card[]): Hands4 {
  const out = [...hands] as [readonly Card[], readonly Card[], readonly Card[], readonly Card[]];
  out[idx] = val;
  return out;
}

export function reducer(state: KempsState, action: KempsAction): KempsState {
  if (state.phase === "done" && action.type !== "restart") return state;
  if (action.type === "restart") return initialState(state.rngSeed, state.settings);

  if (action.type === "next-round") {
    if (state.phase !== "round-over") return state;
    // Check if game over
    if (state.teamScore >= state.targetRounds || state.oppScore >= state.targetRounds) {
      const winner = state.teamScore >= state.targetRounds ? "team" : "opp";
      return { ...state, phase: "done", winner };
    }
    // Deal new round
    const rng = mulberry32(state.rngSeed);
    const deck = shuffle(newDeck(), rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const hands: Hands4 = [deck.slice(0, 4), deck.slice(4, 8), deck.slice(8, 12), deck.slice(12, 16)];
    const center = deck.slice(16, 20);
    return {
      ...state,
      phase: "swapping",
      hands,
      center,
      rngSeed: nextSeed,
      roundWinner: null,
      roundMessage: "",
      playerSignaled: false,
      kempsCalledBy: null,
    };
  }

  if (action.type === "swap") {
    if (state.phase !== "swapping") return state;
    const { handIdx, centerIdx } = action;
    const playerHand = state.hands[0]!;
    const cardFromHand = playerHand[handIdx];
    const cardFromCenter = state.center[centerIdx];
    if (!cardFromHand || !cardFromCenter) return state;

    const newPlayerHand = playerHand.map((c, i) => i === handIdx ? cardFromCenter : c);
    const newCenter = state.center.map((c, i) => i === centerIdx ? cardFromHand : c);
    const newHands = setHand(state.hands, 0, newPlayerHand);

    return { ...state, hands: newHands, center: newCenter };
  }

  if (action.type === "signal") {
    // Player signals partner — partner auto-calls KEMPS if partner has 4-of-a-kind
    if (state.phase !== "swapping") return state;
    const partnerHand = state.hands[1]!;
    const partnerKemps = hasFourOfAKind(partnerHand);
    if (partnerKemps !== null) {
      // Team wins round
      const newTeamScore = state.teamScore + 1;
      const msg = `Your partner had four ${partnerKemps}s! KEMPS! Team scores a point.`;
      const phase: KempsPhase = newTeamScore >= state.targetRounds ? "done" : "round-over";
      return {
        ...state,
        phase,
        roundWinner: "team",
        roundMessage: msg,
        teamScore: newTeamScore,
        winner: phase === "done" ? "team" : null,
        kempsCalledBy: 1,
        roundsPlayed: state.roundsPlayed + 1,
      };
    } else {
      // Wrong signal — lose the round
      const newOppScore = state.oppScore + 1;
      const msg = `Your partner didn't have 4-of-a-kind! False signal — opponents score a point.`;
      const phase: KempsPhase = newOppScore >= state.targetRounds ? "done" : "round-over";
      return {
        ...state,
        phase,
        roundWinner: "opp",
        roundMessage: msg,
        oppScore: newOppScore,
        winner: phase === "done" ? "opp" : null,
        roundsPlayed: state.roundsPlayed + 1,
      };
    }
  }

  if (action.type === "stop-kemps") {
    // Player calls stop-kemps on opponents — check if opp1 or opp2 has 4-of-a-kind
    if (state.phase !== "swapping") return state;
    const opp1Kemps = hasFourOfAKind(state.hands[2]!);
    const opp2Kemps = hasFourOfAKind(state.hands[3]!);
    if (opp1Kemps !== null || opp2Kemps !== null) {
      const rank = opp1Kemps ?? opp2Kemps;
      const msg = `Correct! Opponent had four ${rank}s — you stopped KEMPS! Your team scores a point.`;
      const newTeamScore = state.teamScore + 1;
      const phase: KempsPhase = newTeamScore >= state.targetRounds ? "done" : "round-over";
      return { ...state, phase, roundWinner: "team", roundMessage: msg, teamScore: newTeamScore, winner: phase === "done" ? "team" : null, roundsPlayed: state.roundsPlayed + 1 };
    } else {
      const msg = `Wrong! No opponent had 4-of-a-kind — opponents score a point.`;
      const newOppScore = state.oppScore + 1;
      const phase: KempsPhase = newOppScore >= state.targetRounds ? "done" : "round-over";
      return { ...state, phase, roundWinner: "opp", roundMessage: msg, oppScore: newOppScore, winner: phase === "done" ? "opp" : null, roundsPlayed: state.roundsPlayed + 1 };
    }
  }

  if (action.type === "bot-tick") {
    let s = state;
    if (s.phase !== "swapping") return s;

    const tickTarget = 3;
    const newCounter = s.botTickCounter + 1;
    if (newCounter < tickTarget) return { ...s, botTickCounter: newCounter };
    s = { ...s, botTickCounter: 0 };

    // Check if any bot has kemps and should call
    // Partner (seat 1) calls kemps if they have 4-of-a-kind and player signaled
    if (s.playerSignaled) {
      const partnerKemps = hasFourOfAKind(s.hands[1]!);
      if (partnerKemps) {
        const newTeamScore = s.teamScore + 1;
        const phase: KempsPhase = newTeamScore >= s.targetRounds ? "done" : "round-over";
        return { ...s, phase, roundWinner: "team", roundMessage: `Partner called KEMPS with four ${partnerKemps}s!`, teamScore: newTeamScore, winner: phase === "done" ? "team" : null, roundsPlayed: s.roundsPlayed + 1 };
      }
    }

    // Opponent bots call kemps if they have 4-of-a-kind
    for (const seat of [2, 3]) {
      const oppKemps = hasFourOfAKind(s.hands[seat]!);
      if (oppKemps) {
        const newOppScore = s.oppScore + 1;
        const phase: KempsPhase = newOppScore >= s.targetRounds ? "done" : "round-over";
        const partner = seat === 2 ? 3 : 2;
        const partnerKemps2 = hasFourOfAKind(s.hands[partner]!);
        // Opp partner auto-calls kemps
        if (partnerKemps2 !== null || oppKemps !== null) {
          return { ...s, phase, roundWinner: "opp", roundMessage: `Opponent called KEMPS with four ${oppKemps}s!`, oppScore: newOppScore, winner: phase === "done" ? "opp" : null, roundsPlayed: s.roundsPlayed + 1 };
        }
      }
    }

    // Bots swap cards
    // Partner (seat 1): try to swap toward 4-of-a-kind
    const partnerHand = s.hands[1]!;
    const partnerSwap = findBestSwap(partnerHand, s.center);
    if (partnerSwap) {
      const newHand = partnerHand.map((c, i) => i === partnerSwap.handIdx ? s.center[partnerSwap.centerIdx]! : c);
      const newCenter = s.center.map((c, i) => i === partnerSwap.centerIdx ? partnerHand[partnerSwap.handIdx]! : c);
      s = { ...s, hands: setHand(s.hands, 1, newHand), center: newCenter };
    }

    // Opp bots swap
    for (const seat of [2, 3]) {
      const oppHand = s.hands[seat]!;
      const oppSwap = findBestSwap(oppHand, s.center);
      if (oppSwap) {
        const newHand = oppHand.map((c, i) => i === oppSwap.handIdx ? s.center[oppSwap.centerIdx]! : c);
        const newCenter = s.center.map((c, i) => i === oppSwap.centerIdx ? oppHand[oppSwap.handIdx]! : c);
        s = { ...s, hands: setHand(s.hands, seat, newHand), center: newCenter };
      }
    }

    return s;
  }

  return state;
}

function findBestSwap(hand: readonly Card[], center: readonly Card[]): { handIdx: number; centerIdx: number } | null {
  // Find rank with most in hand, swap weakest card for center card that matches that rank
  const counts: Partial<Record<Rank, number>> = {};
  for (const c of hand) counts[c.rank] = (counts[c.rank] ?? 0) + 1;
  let bestRank: Rank | null = null;
  let bestCount = 0;
  for (const [r, cnt] of Object.entries(counts) as [string, number][]) {
    if (cnt > bestCount) { bestCount = cnt; bestRank = Number(r) as Rank; }
  }
  if (!bestRank) return null;

  // Find center card that matches best rank
  for (let ci = 0; ci < center.length; ci++) {
    if (center[ci]!.rank === bestRank) {
      // Find worst card in hand (not best rank)
      for (let hi = 0; hi < hand.length; hi++) {
        if (hand[hi]!.rank !== bestRank) return { handIdx: hi, centerIdx: ci };
      }
    }
  }
  return null;
}

export function isTerminal(state: KempsState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return { score: state.winner === "team" ? 100 : 0 };
}

export { hasFourOfAKind };
