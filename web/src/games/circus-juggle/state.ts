import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CircusJuggleSettings {
  items: "3" | "4" | "5";
}

export type JuggleItem = "🎪" | "🎭" | "🎡" | "🎠" | "🎢";

export interface JuggleBall {
  id: number;
  label: JuggleItem;
  height: number;    // 0 = lowest, 10 = highest
  ascending: boolean;
  speed: number;
}

export interface CircusJuggleState {
  settings: CircusJuggleSettings;
  balls: JuggleBall[];
  catchCount: number;
  dropCount: number;
  streak: number;
  bestStreak: number;
  round: number;
  totalRounds: number;
  gameOver: boolean;
  message: string;
  lastResult: string;
  rngSeed: number;
}

export type CircusJuggleAction =
  | { type: "catch"; id: number }
  | { type: "tick" }
  | { type: "restart" };

const ITEMS: JuggleItem[] = ["🎪", "🎭", "🎡", "🎠", "🎢"];
const TOTAL_ROUNDS = 20;

function makeBalls(count: number, rng: () => number): JuggleBall[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    label: ITEMS[i % ITEMS.length]!,
    height: Math.floor(rng() * 11),
    ascending: rng() > 0.5,
    speed: 1 + Math.floor(rng() * 3),
  }));
}

export function initialState(seed: number, settings: CircusJuggleSettings): CircusJuggleState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.items, 10);
  const balls = makeBalls(count, rng);
  return {
    settings,
    balls,
    catchCount: 0,
    dropCount: 0,
    streak: 0,
    bestStreak: 0,
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    gameOver: false,
    message: "Click balls at the bottom to catch them!",
    lastResult: "",
    rngSeed: seed,
  };
}

export function reducer(state: CircusJuggleState, action: CircusJuggleAction): CircusJuggleState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "catch") {
    const ball = state.balls.find(b => b.id === action.id);
    if (!ball) return state;
    const catchable = ball.height <= 2;
    const streak = catchable ? state.streak + 1 : 0;
    const dropCount = catchable ? state.dropCount : state.dropCount + 1;
    const catchCount = catchable ? state.catchCount + 1 : state.catchCount;
    const bestStreak = Math.max(state.bestStreak, streak);
    return {
      ...state,
      catchCount,
      dropCount,
      streak,
      bestStreak,
      lastResult: catchable ? `Caught! Streak ${streak}` : "Too high! Miss.",
      message: catchable ? "Great catch!" : "Catch balls when they are low!",
    };
  }

  if (action.type === "tick") {
    const newBalls = state.balls.map(b => {
      let h = b.ascending ? b.height + b.speed : b.height - b.speed;
      let asc = b.ascending;
      if (h > 10) { h = 10; asc = false; }
      if (h < 0) { h = 0; asc = true; }
      return { ...b, height: h, ascending: asc };
    });
    const round = state.round + 1;
    const gameOver = round >= state.totalRounds;
    return {
      ...state,
      balls: newBalls,
      round,
      gameOver,
      message: gameOver ? "Show over!" : `Round ${round}/${state.totalRounds}`,
    };
  }
  return state;
}

export function isTerminal(state: CircusJuggleState): { score: number } | null {
  if (!state.gameOver) return null;
  const catchScore = state.catchCount * 30;
  const streakBonus = state.bestStreak * 20;
  const dropPenalty = state.dropCount * 10;
  return { score: Math.max(0, Math.min(1000, catchScore + streakBonus - dropPenalty)) };
}
