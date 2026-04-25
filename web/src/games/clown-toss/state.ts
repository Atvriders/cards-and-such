import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ClownTossSettings {
  pegs: "3" | "5" | "7";
}

export interface Peg {
  id: number;
  label: string;
  points: number;
  rings: number;
}

export interface ClownTossState {
  settings: ClownTossSettings;
  pegs: Peg[];
  ringsLeft: number;
  totalRings: number;
  score: number;
  lastToss: string;
  gameOver: boolean;
  message: string;
  consecutiveHits: number;
  bestStreak: number;
  rngSeed: number;
}

export type ClownTossAction =
  | { type: "toss"; pegId: number }
  | { type: "restart" };

const PEG_LABELS = ["🤡", "🎯", "⭐", "🎪", "🎭", "🎡", "🃏"];
const PEG_POINTS = [50, 100, 75, 150, 80, 120, 200];
const MISS_CHANCE = 0.3;

function buildPegs(count: number): Peg[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: PEG_LABELS[i % PEG_LABELS.length]!,
    points: PEG_POINTS[i % PEG_POINTS.length]!,
    rings: 0,
  }));
}

export function initialState(seed: number, settings: ClownTossSettings): ClownTossState {
  const numPegs = parseInt(settings.pegs, 10);
  const totalRings = numPegs * 3;
  return {
    settings,
    pegs: buildPegs(numPegs),
    ringsLeft: totalRings,
    totalRings,
    score: 0,
    lastToss: "",
    gameOver: false,
    message: "Toss rings onto the pegs!",
    consecutiveHits: 0,
    bestStreak: 0,
    rngSeed: seed,
  };
}

export function reducer(state: ClownTossState, action: ClownTossAction): ClownTossState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "toss" && !state.gameOver) {
    const rng = mulberry32(state.rngSeed + state.totalRings - state.ringsLeft);
    const hit = rng() > MISS_CHANCE;
    const peg = state.pegs.find(p => p.id === action.pegId);
    if (!peg) return state;

    const ringsLeft = state.ringsLeft - 1;
    const gameOver = ringsLeft <= 0;

    if (!hit) {
      return {
        ...state,
        ringsLeft,
        gameOver,
        consecutiveHits: 0,
        lastToss: "Miss! Ring bounced off.",
        message: gameOver ? `Game over! Score: ${state.score}` : `${ringsLeft} rings left.`,
      };
    }

    const streakBonus = state.consecutiveHits >= 2 ? Math.floor(peg.points * 0.5) : 0;
    const earned = peg.points + streakBonus;
    const consecutive = state.consecutiveHits + 1;
    const bestStreak = Math.max(state.bestStreak, consecutive);
    const newPegs = state.pegs.map(p => p.id === action.pegId ? { ...p, rings: p.rings + 1 } : p);

    return {
      ...state,
      pegs: newPegs,
      ringsLeft,
      score: state.score + earned,
      consecutiveHits: consecutive,
      bestStreak,
      gameOver,
      lastToss: streakBonus > 0 ? `Hit! +${earned} (streak bonus +${streakBonus})` : `Hit! +${earned}`,
      message: gameOver ? `Game over! Score: ${state.score + earned}` : `${ringsLeft} rings left. Streak: ${consecutive}`,
    };
  }
  return state;
}

export function isTerminal(state: ClownTossState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, Math.floor(state.score / 5)) };
}
