import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KenoMiniSettings {
  roundsPerSession: number;
  bet: "5" | "10" | "25";
  spotsToPlay: "1" | "2" | "3" | "4" | "5";
}

export type KenoMiniPhase = "picking" | "drawing" | "settled";

export interface KenoMiniState {
  settings: KenoMiniSettings;
  rngSeed: number;
  bankroll: number;
  roundsPlayed: number;
  phase: KenoMiniPhase;
  picked: number[];   // numbers picked by player (1-40)
  drawn: number[];    // 10 numbers drawn by house
  hits: number;       // matching numbers
  lastResult: string;
}

export type KenoMiniAction =
  | { type: "pick"; number: number }
  | { type: "unpick"; number: number }
  | { type: "draw" }
  | { type: "new-round" };

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

// Mini Keno: 40 numbers, pick 1-5, house draws 10
// Pay table (multiplier of bet):
const PAYTABLE: Record<number, Record<number, number>> = {
  1: { 1: 3 },
  2: { 2: 12, 1: 1 },
  3: { 3: 45, 2: 4, 1: 1 },
  4: { 4: 120, 3: 6, 2: 2 },
  5: { 5: 350, 4: 20, 3: 4, 2: 1 },
};

export function calculatePayout(spots: number, hits: number, bet: number): number {
  const table = PAYTABLE[spots];
  if (!table) return 0;
  return (table[hits] ?? 0) * bet;
}

function drawKeno(seed: number): { drawn: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const pool = Array.from({ length: 40 }, (_, i) => i + 1);
  const drawn: number[] = [];
  let remaining = [...pool];
  const rng2 = mulberry32(seed);
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(rng2() * remaining.length);
    drawn.push(remaining[idx]!);
    remaining = [...remaining.slice(0, idx), ...remaining.slice(idx + 1)];
  }
  return { drawn, nextSeed };
}

export function initialState(seed: number, settings: KenoMiniSettings): KenoMiniState {
  const { nextSeed } = advanceSeed(seed);
  return {
    settings, rngSeed: nextSeed, bankroll: 1000, roundsPlayed: 0,
    phase: "picking", picked: [], drawn: [], hits: 0, lastResult: "",
  };
}

export function reducer(state: KenoMiniState, action: KenoMiniAction): KenoMiniState {
  const bet = parseInt(state.settings.bet, 10);
  const spots = parseInt(state.settings.spotsToPlay, 10);

  switch (action.type) {
    case "pick": {
      if (state.phase !== "picking") return state;
      if (state.picked.includes(action.number)) return state;
      if (state.picked.length >= spots) return state;
      return { ...state, picked: [...state.picked, action.number] };
    }
    case "unpick": {
      if (state.phase !== "picking") return state;
      return { ...state, picked: state.picked.filter(n => n !== action.number) };
    }
    case "draw": {
      if (state.phase !== "picking") return state;
      if (state.picked.length !== spots) return state;
      if (state.bankroll < bet) return state;
      if (state.roundsPlayed >= state.settings.roundsPerSession) return state;

      const { drawn, nextSeed } = drawKeno(state.rngSeed);
      const pickedSet = new Set(state.picked);
      const hits = drawn.filter(n => pickedSet.has(n)).length;
      const payout = calculatePayout(spots, hits, bet);
      return {
        ...state, rngSeed: nextSeed,
        bankroll: state.bankroll - bet + payout,
        roundsPlayed: state.roundsPlayed + 1,
        phase: "settled", drawn, hits,
        lastResult: `${hits}/${spots} hits! ${payout > 0 ? `+$${payout - bet}` : `-$${bet}`} (payout: $${payout})`,
      };
    }
    case "new-round": {
      if (state.phase !== "settled") return state;
      return { ...state, phase: "picking", picked: [], drawn: [], hits: 0, lastResult: "" };
    }
    default: return state;
  }
}

export function isTerminal(state: KenoMiniState): { score: number } | null {
  if (state.phase === "settled" &&
    (state.roundsPlayed >= state.settings.roundsPerSession || state.bankroll <= 0)) {
    return { score: state.bankroll };
  }
  return null;
}
