import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceBasketballSettings {
  periods: "2" | "4";
}

export type ShotType = "layup" | "midrange" | "three" | "freethrow";

export interface DiceBasketballState {
  settings: DiceBasketballSettings;
  playerScore: number;
  aiScore: number;
  period: number;
  totalPeriods: number;
  playerBall: boolean;
  lastPlay: string;
  lastDice: number[];
  phase: "play" | "gameOver";
  possession: number; // plays in this possession
  seed: number;
}

export type DiceBasketballAction = { type: "shoot"; shotType: ShotType };

function roll(rng: () => number, sides: number): number {
  return Math.floor(rng() * sides) + 1;
}

export function initialState(seed: number, settings: DiceBasketballSettings): DiceBasketballState {
  return {
    settings,
    playerScore: 0,
    aiScore: 0,
    period: 1,
    totalPeriods: parseInt(settings.periods, 10),
    playerBall: true,
    lastPlay: "Tip-off! You have the ball.",
    lastDice: [],
    phase: "play",
    possession: 0,
    seed,
  };
}

function aiPlay(state: DiceBasketballState): DiceBasketballState {
  const rng = mulberry32(state.seed + state.aiScore * 3 + state.period * 7);
  const r = roll(rng, 6);
  let points = 0;
  let desc = "";
  const dice = [r];

  if (r <= 2) {
    // turnover
    desc = "AI turns it over! Your ball.";
    return {
      ...state,
      playerBall: true,
      possession: 0,
      lastPlay: desc,
      lastDice: dice,
      seed: state.seed + 1,
    };
  } else if (r === 3) {
    const d2 = roll(rng, 6);
    dice.push(d2);
    if (d2 >= 4) { points = 1; desc = `AI makes free throws. AI +1.`; }
    else { desc = "AI misses free throws."; }
  } else if (r === 4) {
    points = 2;
    desc = `AI scores a layup! AI +2.`;
  } else if (r === 5) {
    const d2 = roll(rng, 6);
    dice.push(d2);
    if (d2 >= 3) { points = 2; desc = `AI hits a mid-range jumper! AI +2.`; }
    else { desc = "AI misses the mid-ranger."; }
  } else {
    const d2 = roll(rng, 6);
    dice.push(d2);
    if (d2 >= 4) { points = 3; desc = `AI hits a three! AI +3.`; }
    else { desc = "AI bricks the three. Your ball."; }
  }

  const newPeriod = state.possession + 1 >= 6 ? state.period + 1 : state.period;
  const isOver = newPeriod > state.totalPeriods;

  return {
    ...state,
    aiScore: state.aiScore + points,
    playerBall: true,
    possession: 0,
    period: Math.min(newPeriod, state.totalPeriods),
    phase: isOver ? "gameOver" : "play",
    lastPlay: desc + (isOver ? " Game over!" : ""),
    lastDice: dice,
    seed: state.seed + 1,
  };
}

export function reducer(state: DiceBasketballState, action: DiceBasketballAction): DiceBasketballState {
  if (state.phase === "gameOver") return state;
  if (action.type !== "shoot") return state;

  const rng = mulberry32(state.seed + state.playerScore * 5 + state.possession);
  const { shotType } = action;

  let points = 0;
  let desc = "";
  const dice: number[] = [];
  let turnover = false;

  if (shotType === "layup") {
    const d = roll(rng, 6);
    dice.push(d);
    if (d >= 3) { points = 2; desc = `Layup is good! You +2.`; }
    else { desc = "Layup missed."; turnover = true; }
  } else if (shotType === "midrange") {
    const d1 = roll(rng, 6), d2 = roll(rng, 6);
    dice.push(d1, d2);
    if (d1 + d2 >= 8) { points = 2; desc = `Mid-range jumper! You +2.`; }
    else { desc = "Mid-range missed."; turnover = true; }
  } else if (shotType === "three") {
    const d1 = roll(rng, 6), d2 = roll(rng, 6);
    dice.push(d1, d2);
    if (d1 + d2 >= 10) { points = 3; desc = `Three-pointer! You +3!`; }
    else { desc = "Three missed."; turnover = true; }
  } else {
    // Free throw: roll 1d6, need 4+ per shot, 2 shots
    const d1 = roll(rng, 6), d2 = roll(rng, 6);
    dice.push(d1, d2);
    const made = (d1 >= 4 ? 1 : 0) + (d2 >= 4 ? 1 : 0);
    points = made;
    desc = `Free throws: ${made}/2. You +${made}.`;
    turnover = made === 0;
  }

  const newPlayerScore = state.playerScore + points;
  const newPossession = state.possession + 1;

  let newState: DiceBasketballState = {
    ...state,
    playerScore: newPlayerScore,
    lastPlay: desc,
    lastDice: dice,
    seed: state.seed + 1,
    possession: newPossession,
    playerBall: !turnover,
  };

  // After player scores or turnover, AI plays
  return aiPlay(newState);
}

export function isTerminal(state: DiceBasketballState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  const base = state.playerScore > state.aiScore ? 1000
             : state.playerScore === state.aiScore ? 500 : 100;
  return { score: base };
}
