import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Crown and Anchor: 6 symbols on 3 dice.
// Player bets on one symbol; payout = number of matching dice.
export type Symbol = "crown" | "anchor" | "heart" | "diamond" | "club" | "spade";
export const SYMBOLS: Symbol[] = ["crown", "anchor", "heart", "diamond", "club", "spade"];
export const SYMBOL_LABELS: Record<Symbol, string> = {
  crown: "Crown 👑",
  anchor: "Anchor ⚓",
  heart: "Heart ♥",
  diamond: "Diamond ♦",
  club: "Club ♣",
  spade: "Spade ♠",
};

export interface CrownAndAnchorSettings {
  startingCoins: "10" | "20" | "50";
}

export type CaPhase = "betting" | "rolled" | "gameDone";

export interface CrownAndAnchorState {
  settings: CrownAndAnchorSettings;
  rngSeed: number;
  coins: number;
  bet: number;
  betSymbol: Symbol | null;
  lastRoll: Symbol[];
  lastWin: number;
  roundsPlayed: number;
  phase: CaPhase;
}

export type CrownAndAnchorAction =
  | { type: "setBet"; amount: number }
  | { type: "setBetSymbol"; symbol: Symbol }
  | { type: "roll" }
  | { type: "nextRound" };

function symbolFromRoll(n: number): Symbol {
  return SYMBOLS[n % 6]!;
}

export function initialState(seed: number, settings: CrownAndAnchorSettings): CrownAndAnchorState {
  return {
    settings,
    rngSeed: seed,
    coins: parseInt(settings.startingCoins, 10),
    bet: 1,
    betSymbol: "crown",
    lastRoll: [],
    lastWin: 0,
    roundsPlayed: 0,
    phase: "betting",
  };
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

export function reducer(state: CrownAndAnchorState, action: CrownAndAnchorAction): CrownAndAnchorState {
  if (state.phase === "gameDone") return state;

  switch (action.type) {
    case "setBet": {
      if (state.phase !== "betting") return state;
      const amount = Math.max(1, Math.min(action.amount, state.coins));
      return { ...state, bet: amount };
    }

    case "setBetSymbol": {
      if (state.phase !== "betting") return state;
      return { ...state, betSymbol: action.symbol };
    }

    case "roll": {
      if (state.phase !== "betting") return state;
      if (!state.betSymbol) return state;
      if (state.bet > state.coins) return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const roll: Symbol[] = [
        symbolFromRoll(Math.floor(rng() * 6)),
        symbolFromRoll(Math.floor(rng() * 6)),
        symbolFromRoll(Math.floor(rng() * 6)),
      ];

      const matches = roll.filter((s) => s === state.betSymbol).length;
      // Win = bet * matches (lose bet if 0 matches)
      const winAmount = matches > 0 ? state.bet * matches : -state.bet;
      const newCoins = state.coins + winAmount;
      const gameDone = newCoins <= 0;

      return {
        ...state,
        rngSeed: newSeed,
        coins: newCoins,
        lastRoll: roll,
        lastWin: winAmount,
        roundsPlayed: state.roundsPlayed + 1,
        phase: gameDone ? "gameDone" : "rolled",
      };
    }

    case "nextRound": {
      if (state.phase !== "rolled") return state;
      const bet = Math.min(state.bet, state.coins);
      return {
        ...state,
        bet,
        lastRoll: [],
        lastWin: 0,
        phase: "betting",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CrownAndAnchorState): { score: number } | null {
  if (state.phase !== "gameDone") return null;
  return { score: Math.max(0, state.roundsPlayed * 10) };
}
