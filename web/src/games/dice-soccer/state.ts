import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceSoccerSettings {
  halves: "2" | "4";
}

export type SoccerAction = "shoot" | "dribble" | "defend";

export interface DiceSoccerState {
  settings: DiceSoccerSettings;
  playerScore: number;
  aiScore: number;
  half: number;
  totalHalves: number;
  possession: "player" | "ai";
  ballPosition: number;  // 0..10, 5=center, 10=player goal, 0=ai goal
  lastPlay: string;
  lastDice: number[];
  phase: "play" | "gameOver";
  seed: number;
}

export type DiceSoccerAction =
  | { type: "play"; move: SoccerAction }
  | { type: "restart" };

function roll(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * 6) + 1);
}

function aiPlay(state: DiceSoccerState): DiceSoccerState {
  const rng = mulberry32(state.seed + state.half * 50 + state.ballPosition);
  const r = rng();
  const dice = roll(rng, 2);
  const sum = dice[0]! + dice[1]!;

  // AI closer to player goal = shoots more
  if (state.ballPosition >= 7 && r < 0.5) {
    // AI shoots
    const scored = sum >= 8;
    if (scored) {
      const nextHalf = state.half % 2 === 0 ? state.half + 1 : state.half;
      const isLast = state.half >= state.totalHalves;
      return {
        ...state,
        aiScore: state.aiScore + 1,
        ballPosition: 5,
        possession: "player",
        lastPlay: `AI shoots and SCORES! AI ${state.aiScore + 1} — ${state.playerScore}`,
        lastDice: dice,
        half: isLast ? state.half : nextHalf,
        phase: isLast ? "gameOver" : "play",
        seed: state.seed + 7,
      };
    }
    return { ...state, ballPosition: Math.max(0, state.ballPosition - 3), possession: "player", lastPlay: "AI shot saved!", lastDice: dice, seed: state.seed + 7 };
  }
  // Dribble
  const gained = sum - 5;
  const newPos = Math.max(0, Math.min(10, state.ballPosition + gained));
  return { ...state, ballPosition: newPos, lastPlay: `AI dribbles to pos ${newPos}`, lastDice: dice, seed: state.seed + 7 };
}

export function initialState(seed: number, settings: DiceSoccerSettings): DiceSoccerState {
  return {
    settings,
    playerScore: 0,
    aiScore: 0,
    half: 1,
    totalHalves: parseInt(settings.halves, 10),
    possession: "player",
    ballPosition: 5,
    lastPlay: "Kickoff! You have the ball.",
    lastDice: [],
    phase: "play",
    seed,
  };
}

export function reducer(state: DiceSoccerState, action: DiceSoccerAction): DiceSoccerState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.phase === "gameOver") return state;

  const rng = mulberry32(state.seed + state.playerScore * 13 + state.half);
  const dice = roll(rng, 2);
  const sum = dice[0]! + dice[1]!;
  const newSeed = state.seed + 11;

  const { move } = action as { type: "play"; move: SoccerAction };

  if (move === "shoot") {
    if (state.possession !== "player") return { ...state, lastPlay: "You don't have the ball!", lastDice: [] };
    if (state.ballPosition < 6) return { ...state, lastPlay: "Too far to shoot! Dribble closer.", lastDice: [] };
    const scored = sum >= 9;
    if (scored) {
      const nextHalf = state.half + 1;
      const isLast = nextHalf > state.totalHalves;
      return {
        ...state,
        playerScore: state.playerScore + 1,
        ballPosition: 5,
        possession: "ai",
        lastPlay: `GOAL! You score! ${state.playerScore + 1} — ${state.aiScore}`,
        lastDice: dice,
        half: isLast ? state.half : nextHalf,
        phase: isLast ? "gameOver" : "play",
        seed: newSeed,
      };
    }
    const afterMiss = { ...state, ballPosition: Math.max(0, state.ballPosition - 2), possession: "ai" as const, lastPlay: `Shot saved! AI ball.`, lastDice: dice, seed: newSeed };
    return aiPlay(afterMiss);
  }

  if (move === "dribble") {
    if (state.possession !== "player") return { ...state, lastPlay: "You don't have the ball!", lastDice: [] };
    const gained = Math.max(-2, sum - 5);
    const newPos = Math.max(0, Math.min(10, state.ballPosition + gained));
    if (newPos <= 0) {
      // AI got ball via turnover
      const after = { ...state, ballPosition: 2, possession: "ai" as const, lastPlay: `Dribbled out of bounds! AI ball.`, lastDice: dice, seed: newSeed };
      return aiPlay(after);
    }
    const after = { ...state, ballPosition: newPos, lastPlay: `Dribbled to position ${newPos}. Dice: ${sum}`, lastDice: dice, seed: newSeed };
    return aiPlay(after);
  }

  if (move === "defend") {
    // Intercept chance
    const intercepted = sum >= 8;
    if (intercepted) {
      const after = { ...state, possession: "player" as const, ballPosition: 5, lastPlay: `Interception! You win the ball.`, lastDice: dice, seed: newSeed };
      return after;
    }
    const after = { ...state, lastPlay: `Defend failed. AI keeps ball.`, lastDice: dice, seed: newSeed };
    return aiPlay(after);
  }

  return state;
}

export function isTerminal(state: DiceSoccerState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  const base = state.playerScore > state.aiScore ? 1000 :
               state.playerScore === state.aiScore ? 500 : 100;
  return { score: base };
}
