import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceHockeySettings {
  periods: "2" | "3";
}

export type HockeyMove = "slap" | "wrist" | "pass" | "block";

export interface DiceHockeyState {
  settings: DiceHockeySettings;
  playerScore: number;
  aiScore: number;
  period: number;
  totalPeriods: number;
  possession: "player" | "ai";
  puckPosition: number;  // 0..10, 0=AI net, 10=player net
  lastPlay: string;
  lastDice: number[];
  phase: "play" | "gameOver";
  seed: number;
}

export type DiceHockeyAction =
  | { type: "play"; move: HockeyMove }
  | { type: "restart" };

function roll(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(rng() * 6) + 1);
}

function aiTurn(state: DiceHockeyState): DiceHockeyState {
  const rng = mulberry32(state.seed + state.period * 79 + state.puckPosition);
  const dice = roll(rng, 2);
  const sum = dice[0]! + dice[1]!;

  // AI has puck at state.puckPosition — 10=player net
  const aiZonePos = 10 - state.puckPosition;

  if (aiZonePos >= 7 && sum >= 9) {
    // AI scores
    const nextPeriod = state.period + 1;
    const isLast = nextPeriod > state.totalPeriods;
    return {
      ...state,
      aiScore: state.aiScore + 1,
      puckPosition: 5,
      possession: "player",
      lastPlay: state.lastPlay + ` AI scores! ${state.playerScore}–${state.aiScore + 1}`,
      lastDice: dice,
      period: isLast ? state.period : nextPeriod,
      phase: isLast ? "gameOver" : "play",
      seed: state.seed + 7,
    };
  }

  const advance = sum - 5;
  const newPos = Math.max(0, Math.min(10, state.puckPosition + advance));
  return {
    ...state,
    puckPosition: newPos,
    lastPlay: state.lastPlay + ` AI skates to ${newPos}.`,
    lastDice: dice,
    seed: state.seed + 7,
  };
}

export function initialState(seed: number, settings: DiceHockeySettings): DiceHockeyState {
  return {
    settings,
    playerScore: 0,
    aiScore: 0,
    period: 1,
    totalPeriods: parseInt(settings.periods, 10),
    possession: "player",
    puckPosition: 5,
    lastPlay: "Face-off! You have the puck.",
    lastDice: [],
    phase: "play",
    seed,
  };
}

export function reducer(state: DiceHockeyState, action: DiceHockeyAction): DiceHockeyState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.phase === "gameOver") return state;

  const rng = mulberry32(state.seed + state.playerScore * 17 + state.period);
  const dice = roll(rng, 2);
  const sum = dice[0]! + dice[1]!;
  const newSeed = state.seed + 13;

  const { move } = action as { type: "play"; move: HockeyMove };

  if (move === "slap") {
    // Slap shot: needs position <= 4 (close to AI net), succeeds on sum >= 10
    if (state.puckPosition > 4) return { ...state, lastPlay: "Too far for a slap shot!", lastDice: [] };
    const scored = sum >= 10;
    if (scored) {
      const nextPeriod = state.period + 1;
      const isLast = nextPeriod > state.totalPeriods;
      return {
        ...state,
        playerScore: state.playerScore + 1,
        puckPosition: 5,
        possession: "ai",
        lastPlay: `SLAP SHOT GOAL! ${state.playerScore + 1}–${state.aiScore}`,
        lastDice: dice,
        period: isLast ? state.period : nextPeriod,
        phase: isLast ? "gameOver" : "play",
        seed: newSeed,
      };
    }
    const after = { ...state, puckPosition: Math.min(10, state.puckPosition + 3), possession: "ai" as const, lastPlay: `Slap shot saved! AI takes over.`, lastDice: dice, seed: newSeed };
    return aiTurn(after);
  }

  if (move === "wrist") {
    // Wrist shot: needs position <= 5, succeeds on sum >= 8
    if (state.puckPosition > 5) return { ...state, lastPlay: "Too far for a wrist shot!", lastDice: [] };
    const scored = sum >= 8;
    if (scored) {
      const nextPeriod = state.period + 1;
      const isLast = nextPeriod > state.totalPeriods;
      return {
        ...state,
        playerScore: state.playerScore + 1,
        puckPosition: 5,
        possession: "ai",
        lastPlay: `WRIST SHOT GOAL! ${state.playerScore + 1}–${state.aiScore}`,
        lastDice: dice,
        period: isLast ? state.period : nextPeriod,
        phase: isLast ? "gameOver" : "play",
        seed: newSeed,
      };
    }
    const after = { ...state, puckPosition: Math.min(10, state.puckPosition + 2), possession: "ai" as const, lastPlay: `Wrist shot blocked! AI ball.`, lastDice: dice, seed: newSeed };
    return aiTurn(after);
  }

  if (move === "pass") {
    // Skate/pass: moves puck 1-4 positions toward AI net
    const gained = Math.max(1, sum - 8);
    const newPos = Math.max(0, state.puckPosition - gained);
    const after = { ...state, puckPosition: newPos, lastPlay: `Skated! Puck at ${newPos}. (rolled ${sum})`, lastDice: dice, seed: newSeed };
    return aiTurn(after);
  }

  if (move === "block") {
    // Defensive intercept attempt
    const intercepted = sum >= 9;
    if (intercepted) {
      return { ...state, possession: "player", puckPosition: 5, lastPlay: `Blocked! You steal the puck!`, lastDice: dice, seed: newSeed };
    }
    const after = { ...state, lastPlay: `Block failed. AI keeps puck.`, lastDice: dice, seed: newSeed };
    return aiTurn(after);
  }

  return state;
}

export function isTerminal(state: DiceHockeyState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  const base = state.playerScore > state.aiScore ? 1000 :
               state.playerScore === state.aiScore ? 500 : 100;
  return { score: base };
}
