import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CasinoWarMultiSettings {
  handsPerSession: number;
  antePerHand: "5" | "10" | "25";
  numHands: "2" | "3" | "5";
}

export type CasinoWarMultiPhase = "betting" | "tie-decision" | "settled";

export interface WarHand {
  playerCard: Card;
  dealerCard: Card;
  playerFinal: Card | null;
  dealerFinal: Card | null;
  state: "pending" | "won" | "lost" | "tie" | "war-won" | "war-lost" | "surrender";
}

export interface CasinoWarMultiState {
  settings: CasinoWarMultiSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: CasinoWarMultiPhase;
  shoe: Card[];
  discardPile: Card[];
  hands: WarHand[];
  tieHandIndexes: number[]; // which hands are in tie state
  lastResult: string;
}

export type CasinoWarMultiAction =
  | { type: "deal" }
  | { type: "go-to-war" }
  | { type: "surrender-all" };

const HIGH = (r: number) => r === 1 ? 14 : r;

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(n: number, shoe: Card[], disc: Card[], rng: () => number) {
  let cur = shoe; let d = disc; const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (cur.length < 15) { const rs = shuffle([...cur, ...d], rng); const r = deal(rs, 1); cards.push(r.drawn[0]!); cur = r.remaining; d = []; }
    else { const r = deal(cur, 1); cards.push(r.drawn[0]!); cur = r.remaining; }
  }
  return { cards, shoe: cur, discardPile: d };
}

export function initialState(seed: number, settings: CasinoWarMultiSettings): CasinoWarMultiState {
  const { rng, nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, handsPlayed: 0,
    phase: "betting", shoe: shuffle(newDeck(6), rng), discardPile: [],
    hands: [], tieHandIndexes: [], lastResult: "",
  };
}

export function reducer(state: CasinoWarMultiState, action: CasinoWarMultiAction): CasinoWarMultiState {
  const ante = parseInt(state.settings.antePerHand, 10);
  const numHands = parseInt(state.settings.numHands, 10);

  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      const totalCost = ante * numHands;
      if (state.bankroll < totalCost) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const drawn = drawN(numHands * 2, state.shoe, state.discardPile, rng);
      const hands: WarHand[] = [];
      const tieIndexes: number[] = [];
      let bankroll = state.bankroll - totalCost;

      for (let i = 0; i < numHands; i++) {
        const pc = drawn.cards[i * 2]!;
        const dc = drawn.cards[i * 2 + 1]!;
        const pv = HIGH(pc.rank);
        const dv = HIGH(dc.rank);
        let handState: WarHand["state"] = "pending";
        if (pv > dv) handState = "won";
        else if (pv < dv) handState = "lost";
        else { handState = "tie"; tieIndexes.push(i); }
        hands.push({ playerCard: pc, dealerCard: dc, playerFinal: null, dealerFinal: null, state: handState });
      }

      if (tieIndexes.length === 0) {
        // Resolve immediately
        let delta = 0;
        const parts: string[] = [];
        for (const h of hands) {
          if (h.state === "won") { delta += ante * 2; parts.push("W"); }
          else { parts.push("L"); }
        }
        return {
          ...state, rngSeed: nextSeed, bankroll: bankroll + delta,
          phase: "settled", handsPlayed: state.handsPlayed + 1,
          shoe: drawn.shoe, discardPile: [...drawn.discardPile, ...hands.flatMap(h => [h.playerCard, h.dealerCard])],
          hands, tieHandIndexes: [], lastResult: `${parts.join(" ")} — Net: ${delta - totalCost >= 0 ? "+" : ""}$${delta - totalCost}`,
        };
      }

      return {
        ...state, rngSeed: nextSeed, bankroll, phase: "tie-decision",
        shoe: drawn.shoe, discardPile: drawn.discardPile,
        hands, tieHandIndexes: tieIndexes, lastResult: `${tieIndexes.length} tie(s)! Go to War or Surrender?`,
      };
    }

    case "surrender-all": {
      if (state.phase !== "tie-decision") return state;
      const ante = parseInt(state.settings.antePerHand, 10);
      let bankroll = state.bankroll;
      let delta = 0;
      const parts: string[] = [];
      const newHands = state.hands.map((h, i) => {
        if (state.tieHandIndexes.includes(i)) {
          bankroll += Math.floor(ante / 2); // get half back
          delta += Math.floor(ante / 2) - ante;
          parts.push("S(tie)");
          return { ...h, state: "surrender" as const };
        }
        if (h.state === "won") { delta += ante; parts.push("W"); }
        else { parts.push("L"); }
        return h;
      });
      // Add winnings from non-tie hands
      for (const h of newHands) { if (h.state === "won") bankroll += ante * 2; }
      return {
        ...state, bankroll: Math.max(0, bankroll),
        phase: "settled", handsPlayed: state.handsPlayed + 1,
        hands: newHands, tieHandIndexes: [],
        discardPile: [...state.discardPile, ...newHands.flatMap(h => [h.playerCard, h.dealerCard])],
        lastResult: `${parts.join(" ")} — Surrendered ties.`,
      };
    }

    case "go-to-war": {
      if (state.phase !== "tie-decision") return state;
      const ante = parseInt(state.settings.antePerHand, 10);
      const tieCost = ante * state.tieHandIndexes.length; // match ante per tie hand
      if (state.bankroll < tieCost) return state;

      const bankrollAfterRaise = state.bankroll - tieCost;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      // Burn 3 per tie hand, then deal 1 per tie hand each for player+dealer
      const burnCount = state.tieHandIndexes.length * 3 * 2;
      const warCount = state.tieHandIndexes.length * 2;
      const drawn = drawN(burnCount + warCount, state.shoe, state.discardPile, rng);
      const warCards = drawn.cards.slice(burnCount);

      let bankroll = bankrollAfterRaise;
      const newHands = [...state.hands];
      const parts: string[] = [];

      state.tieHandIndexes.forEach((handIdx, ti) => {
        const pf = warCards[ti * 2]!;
        const df = warCards[ti * 2 + 1]!;
        const pv = HIGH(pf.rank);
        const dv = HIGH(df.rank);
        if (pv >= dv) {
          // Win: original ante pushed + raise 1:1
          bankroll += ante + ante * 2; // original return + raise 1:1
          newHands[handIdx] = { ...newHands[handIdx]!, playerFinal: pf, dealerFinal: df, state: "war-won" };
          parts.push(`W-War(${pv}v${dv})`);
        } else {
          newHands[handIdx] = { ...newHands[handIdx]!, playerFinal: pf, dealerFinal: df, state: "war-lost" };
          parts.push(`L-War(${pv}v${dv})`);
        }
      });
      // Non-tie hands
      for (let i = 0; i < newHands.length; i++) {
        if (!state.tieHandIndexes.includes(i)) {
          const h = newHands[i]!;
          if (h.state === "won") { bankroll += ante * 2; parts.splice(i, 0, "W"); }
          else { parts.splice(i, 0, "L"); }
        }
      }

      const allCards = [...drawn.discardPile, ...state.hands.flatMap(h => [h.playerCard, h.dealerCard]), ...warCards];
      return {
        ...state, rngSeed: nextSeed, bankroll: Math.max(0, bankroll),
        phase: "settled", handsPlayed: state.handsPlayed + 1,
        shoe: drawn.shoe, discardPile: allCards,
        hands: newHands, tieHandIndexes: [],
        lastResult: `${parts.join(" ")}`,
      };
    }

    default: return state;
  }
}

export function isTerminal(state: CasinoWarMultiState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
