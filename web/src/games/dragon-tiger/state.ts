import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DragonTigerSettings {
  handsPerSession: number;
  bet: "10" | "25" | "50";
}

export type DragonTigerPhase = "betting" | "settled";

export type DragonTigerBetChoice = "dragon" | "tiger" | "tie";

export interface DragonTigerState {
  settings: DragonTigerSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: DragonTigerPhase;
  shoe: Card[];
  discardPile: Card[];
  betChoice: DragonTigerBetChoice | null;
  dragonCard: Card | null;
  tigerCard: Card | null;
  lastResult: string;
}

export type DragonTigerAction =
  | { type: "bet"; on: DragonTigerBetChoice }
  | { type: "deal" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(n: number, shoe: Card[], disc: Card[], rng: () => number) {
  let cur = shoe; let d = disc; const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (cur.length < 10) { const rs = shuffle([...cur, ...d], rng); const r = deal(rs, 1); cards.push(r.drawn[0]!); cur = r.remaining; d = []; }
    else { const r = deal(cur, 1); cards.push(r.drawn[0]!); cur = r.remaining; }
  }
  return { cards, shoe: cur, discardPile: d };
}

function rankVal(r: Card["rank"]): number { return r === 1 ? 14 : r; }

export function initialState(seed: number, settings: DragonTigerSettings): DragonTigerState {
  const { rng, nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, handsPlayed: 0,
    phase: "betting", shoe: shuffle(newDeck(8), rng), discardPile: [],
    betChoice: null, dragonCard: null, tigerCard: null, lastResult: "",
  };
}

export function reducer(state: DragonTigerState, action: DragonTigerAction): DragonTigerState {
  const bet = parseInt(state.settings.bet, 10);
  switch (action.type) {
    case "bet": {
      if (state.phase !== "betting") return state;
      return { ...state, betChoice: action.on };
    }
    case "deal": {
      if (state.phase !== "betting") return state;
      if (!state.betChoice) return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      if (state.bankroll < bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const drawn = drawN(2, state.shoe, state.discardPile, rng);
      const [dragonCard, tigerCard] = drawn.cards as [Card, Card];
      const dv = rankVal(dragonCard.rank);
      const tv = rankVal(tigerCard.rank);

      let winner: DragonTigerBetChoice;
      let payout = 0;
      if (dv > tv) winner = "dragon";
      else if (tv > dv) winner = "tiger";
      else winner = "tie";

      if (winner === "tie") {
        if (state.betChoice === "tie") {
          payout = bet * 8; // tie pays 8:1
        } else {
          payout = Math.floor(bet / 2); // push: get half back
        }
      } else if (state.betChoice === winner) {
        payout = bet * 2; // 1:1
      }
      // lose: payout = 0

      const bankrollDelta = payout - bet;
      let msg = "";
      if (winner === "tie") {
        msg = state.betChoice === "tie"
          ? `Tie! Dragon ${dv} = Tiger ${tv}. Tie bet pays 8:1! +$${payout - bet}`
          : `Tie! Dragon ${dv} = Tiger ${tv}. Half ante returned ($${Math.floor(bet / 2)}).`;
      } else if (state.betChoice === winner) {
        msg = `${winner === "dragon" ? "Dragon" : "Tiger"} wins! ${dv} vs ${tv}. +$${bet}`;
      } else {
        msg = `${winner === "dragon" ? "Dragon" : "Tiger"} wins. Lost -$${bet}.`;
      }

      return {
        ...state, rngSeed: nextSeed,
        bankroll: Math.max(0, state.bankroll - bet + payout),
        handsPlayed: state.handsPlayed + 1,
        phase: "settled", shoe: drawn.shoe,
        discardPile: [...drawn.discardPile, dragonCard, tigerCard],
        dragonCard, tigerCard, lastResult: msg,
      };
    }
    default: return state;
  }
}

export function isTerminal(state: DragonTigerState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
