import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface VideoKenoSettings {
  pickCount: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
  bet: "1" | "2" | "5" | "10";
  roundsPerSession: number;
}

export type KenoPhase = "picking" | "drawn" | "settled";

export interface VideoKenoState {
  settings: VideoKenoSettings;
  rngSeed: number;
  bankroll: number;
  roundsPlayed: number;
  phase: KenoPhase;
  playerPicks: number[]; // 1-80
  drawnNumbers: number[]; // 20 drawn numbers
  matches: number;
  lastResult: string;
  lastPayout: number;
}

export type VideoKenoAction =
  | { type: "toggle-pick"; number: number }
  | { type: "draw" }
  | { type: "play-again" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Draw 20 unique numbers from 1-80 */
function drawKeno(rng: () => number): number[] {
  const pool = Array.from({ length: 80 }, (_, i) => i + 1);
  const shuffled = shuffle(pool, rng);
  return shuffled.slice(0, 20).sort((a, b) => a - b);
}

/** Keno pay table: [pick count] → [hits needed][payout multiplier] */
const PAY_TABLE: Record<number, Record<number, number>> = {
  2:  { 2: 12 },
  3:  { 2: 2, 3: 40 },
  4:  { 2: 1, 3: 5, 4: 80 },
  5:  { 3: 3, 4: 12, 5: 200 },
  6:  { 3: 2, 4: 8, 5: 50, 6: 1500 },
  7:  { 3: 1, 4: 4, 5: 25, 6: 300, 7: 5000 },
  8:  { 4: 2, 5: 12, 6: 100, 7: 1000, 8: 15000 },
  9:  { 4: 1, 5: 6, 6: 44, 7: 300, 8: 4000, 9: 30000 },
  10: { 5: 5, 6: 25, 7: 200, 8: 2000, 9: 20000, 10: 100000 },
};

export function calcPayout(pickCount: number, matches: number, bet: number): number {
  const table = PAY_TABLE[pickCount];
  if (!table) return 0;
  const mult = table[matches] ?? 0;
  return mult * bet;
}

export function initialState(seed: number, settings: VideoKenoSettings): VideoKenoState {
  const { nextSeed } = advanceSeed(seed);
  return {
    settings,
    rngSeed: nextSeed,
    bankroll: 200,
    roundsPlayed: 0,
    phase: "picking",
    playerPicks: [],
    drawnNumbers: [],
    matches: 0,
    lastResult: "",
    lastPayout: 0,
  };
}

export function reducer(state: VideoKenoState, action: VideoKenoAction): VideoKenoState {
  switch (action.type) {
    case "toggle-pick": {
      if (state.phase !== "picking") return state;
      const maxPicks = parseInt(state.settings.pickCount, 10);
      const { number: n } = action;
      if (n < 1 || n > 80) return state;

      if (state.playerPicks.includes(n)) {
        return { ...state, playerPicks: state.playerPicks.filter(p => p !== n) };
      }
      if (state.playerPicks.length >= maxPicks) return state; // at limit
      return { ...state, playerPicks: [...state.playerPicks, n].sort((a, b) => a - b) };
    }

    case "draw": {
      if (state.phase !== "picking") return state;
      const pickCount = parseInt(state.settings.pickCount, 10);
      if (state.playerPicks.length !== pickCount) return state;

      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const drawnNumbers = drawKeno(rng);

      const matches = state.playerPicks.filter(p => drawnNumbers.includes(p)).length;
      const payout = calcPayout(pickCount, matches, bet);
      const bankroll = state.bankroll - bet + payout;

      let result = `Matched ${matches} of ${pickCount}. `;
      if (payout > 0) result += `Won $${payout}!`;
      else result += `No win.`;

      return {
        ...state,
        rngSeed: nextSeed,
        bankroll: Math.max(0, bankroll),
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled",
        drawnNumbers,
        matches,
        lastResult: result,
        lastPayout: payout,
      };
    }

    case "play-again": {
      if (state.phase !== "settled") return state;
      const bet = parseInt(state.settings.bet, 10);
      if (state.bankroll < bet) return state;
      if (state.roundsPlayed >= state.settings.roundsPerSession) return state;
      return {
        ...state,
        phase: "picking",
        playerPicks: [],
        drawnNumbers: [],
        matches: 0,
        lastResult: "",
        lastPayout: 0,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: VideoKenoState): { score: number } | null {
  const bet = parseInt(state.settings.bet, 10);
  if (state.phase === "settled" && (state.roundsPlayed >= state.settings.roundsPerSession || state.bankroll < bet)) {
    return { score: state.bankroll };
  }
  return null;
}
