import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, deal } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CasinoWarSettings {
  startingBankroll: number;
  anteSize: "10" | "25" | "50";
  handsPerSession: number;
}

export type CasinoWarPhase = "betting" | "tie-decision" | "settled";

export interface CasinoWarState {
  settings: CasinoWarSettings;
  rngSeed: number;
  bankroll: number;
  handsPlayed: number;
  phase: CasinoWarPhase;
  shoe: Card[];
  discardPile: Card[];
  playerCard: Card | null;
  dealerCard: Card | null;
  playerFinal: Card | null; // after war
  dealerFinal: Card | null; // after war
  lastResult: string;
}

export type CasinoWarAction =
  | { type: "deal" }
  | { type: "surrender" } // lose half
  | { type: "go-to-war" }; // match ante

const HIGH = (r: number) => r === 1 ? 14 : r;

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function drawN(n: number, shoe: Card[], discardPile: Card[], rng: () => number): {
  cards: Card[]; shoe: Card[]; discardPile: Card[];
} {
  let cur = shoe;
  let disc = discardPile;
  const cards: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (cur.length < 15) {
      const reshuffled = shuffle([...cur, ...disc], rng);
      const r = deal(reshuffled, 1);
      cards.push(r.drawn[0]!);
      cur = r.remaining;
      disc = [];
    } else {
      const r = deal(cur, 1);
      cards.push(r.drawn[0]!);
      cur = r.remaining;
    }
  }
  return { cards, shoe: cur, discardPile: disc };
}

export function initialState(seed: number, settings: CasinoWarSettings): CasinoWarState {
  const { rng, nextSeed } = advanceSeed(seed);
  const shoe = shuffle(newDeck(6), rng); // 6-deck shoe like casino
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: settings.startingBankroll,
    handsPlayed: 0,
    phase: "betting",
    shoe,
    discardPile: [],
    playerCard: null,
    dealerCard: null,
    playerFinal: null,
    dealerFinal: null,
    lastResult: "",
  };
}

export function reducer(state: CasinoWarState, action: CasinoWarAction): CasinoWarState {
  const ante = parseInt(state.settings.anteSize, 10);

  switch (action.type) {
    case "deal": {
      if (state.phase !== "betting" && state.phase !== "settled") return state;
      if (state.handsPlayed >= state.settings.handsPerSession) return state;
      if (state.bankroll < ante) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const draw2 = drawN(2, state.shoe, state.discardPile, rng);
      const [playerCard, dealerCard] = draw2.cards as [Card, Card];

      const pr = HIGH(playerCard.rank);
      const dr = HIGH(dealerCard.rank);

      if (pr > dr) {
        const discardPile = [...draw2.discardPile, playerCard, dealerCard];
        return {
          ...state,
          rngSeed: nextSeed,
          bankroll: state.bankroll + ante, // win 1:1, original ante stays
          phase: "settled",
          handsPlayed: state.handsPlayed + 1,
          shoe: draw2.shoe,
          discardPile,
          playerCard,
          dealerCard,
          playerFinal: null,
          dealerFinal: null,
          lastResult: `Win! Your ${pr} beats dealer's ${dr}. +$${ante}`,
        };
      }

      if (pr < dr) {
        const bankroll = state.bankroll - ante;
        const discardPile = [...draw2.discardPile, playerCard, dealerCard];
        return {
          ...state,
          rngSeed: nextSeed,
          bankroll: Math.max(0, bankroll),
          phase: "settled",
          handsPlayed: state.handsPlayed + 1,
          shoe: draw2.shoe,
          discardPile,
          playerCard,
          dealerCard,
          playerFinal: null,
          dealerFinal: null,
          lastResult: `Lose. Dealer's ${dr} beats your ${pr}. -$${ante}`,
        };
      }

      // Tie
      const bankroll = state.bankroll - ante; // ante is wagered
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll,
        phase: "tie-decision",
        shoe: draw2.shoe,
        discardPile: draw2.discardPile,
        playerCard,
        dealerCard,
        playerFinal: null,
        dealerFinal: null,
        lastResult: "",
      };
    }

    case "surrender": {
      if (state.phase !== "tie-decision") return state;
      const ante = parseInt(state.settings.anteSize, 10);
      const halfAnte = Math.floor(ante / 2);
      const discardPile = [...state.discardPile, state.playerCard!, state.dealerCard!];
      return {
        ...state,
        bankroll: state.bankroll + halfAnte, // get half back
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        discardPile,
        lastResult: `Surrender. Lost half ante (-$${halfAnte}).`,
      };
    }

    case "go-to-war": {
      if (state.phase !== "tie-decision") return state;
      if (state.bankroll < ante) return state; // need to match ante

      const bankrollAfterRaise = state.bankroll - ante;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);

      // Burn 3 cards each then deal 1 final card each
      const draw8 = drawN(8, state.shoe, state.discardPile, rng); // 3 burn each + 1 each
      const playerFinal = draw8.cards[6]!; // index 6
      const dealerFinal = draw8.cards[7]!; // index 7
      const burned = draw8.cards.slice(0, 6);

      const pr = HIGH(playerFinal.rank);
      const dr = HIGH(dealerFinal.rank);

      let bankrollDelta = 0;
      let resultMsg = "";

      if (pr >= dr) {
        // Player wins war: win 1:1 on raise only, original ante pushes
        bankrollDelta = ante * 2 + ante * 2; // return original ante + return raise + raise win
        // Wait: "original ante pushes" means we get it back
        // And raise pays 1:1 on the raise
        bankrollDelta = ante + ante * 2; // original ante returned + raise returned + raise won
        resultMsg = `War! Your ${pr} ≥ dealer's ${dr}. Win raise! +$${ante}. Original ante pushes.`;
      } else {
        // Lose both ante and raise
        resultMsg = `War! Dealer's ${dr} beats your ${pr}. Lost both bets (-$${ante * 2}).`;
      }

      const discardPile = [...draw8.discardPile, state.playerCard!, state.dealerCard!, ...burned, playerFinal, dealerFinal];
      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankrollAfterRaise + bankrollDelta),
        phase: "settled",
        handsPlayed: state.handsPlayed + 1,
        shoe: draw8.shoe,
        discardPile,
        playerFinal,
        dealerFinal,
        lastResult: resultMsg,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CasinoWarState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.handsPlayed >= state.settings.handsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
