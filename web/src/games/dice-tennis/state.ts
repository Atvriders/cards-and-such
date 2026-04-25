import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceTennisSettings {
  sets: "1" | "3";
}

// Tennis scoring: 0, 15, 30, 40, game
const SCORE_STEPS = [0, 15, 30, 40];

export interface DiceTennisState {
  settings: DiceTennisSettings;
  totalSets: number;
  playerSets: number;
  aiSets: number;
  currentSet: number;
  playerGames: number;
  aiGames: number;
  playerPoints: number;   // index into SCORE_STEPS (0..3), 4 = game
  aiPoints: number;
  lastRally: string;
  lastDice: number[];
  phase: "play" | "gameOver";
  seed: number;
}

export type DiceTennisAction =
  | { type: "serve"; style: "flat" | "spin" | "slice" }
  | { type: "restart" };

export function initialState(seed: number, settings: DiceTennisSettings): DiceTennisState {
  return {
    settings,
    totalSets: parseInt(settings.sets, 10),
    playerSets: 0,
    aiSets: 0,
    currentSet: 1,
    playerGames: 0,
    aiGames: 0,
    playerPoints: 0,
    aiPoints: 0,
    lastRally: "Match begins! Choose your serve style.",
    lastDice: [],
    phase: "play",
    seed,
  };
}

function rollDice(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => Math.floor(rng() * 6) + 1);
}

function pointLabel(pts: number): string {
  if (pts === 4) return "Game";
  return SCORE_STEPS[pts]?.toString() ?? "Ad";
}

function advancePoint(state: DiceTennisState, playerWon: boolean): DiceTennisState {
  let pPts = state.playerPoints;
  let aPts = state.aiPoints;

  if (playerWon) pPts++;
  else aPts++;

  // Deuce / advantage handling (simplified: first to 4 wins the game)
  // If both at 3 (deuce), next point wins
  let pGames = state.playerGames;
  let aGames = state.aiGames;
  let pSets = state.playerSets;
  let aSets = state.aiSets;
  let currentSet = state.currentSet;
  let msg2 = "";

  if (pPts >= 4 && pPts > aPts) {
    // Player wins game
    pGames++;
    pPts = 0; aPts = 0;
    msg2 = ` Game to you! ${pGames}-${aGames}`;
    if (pGames >= 6 && pGames - aGames >= 2) {
      pSets++;
      pGames = 0; aGames = 0;
      currentSet++;
      msg2 = ` Set to you! ${pSets}-${aSets}`;
    }
  } else if (aPts >= 4 && aPts > pPts) {
    aGames++;
    pPts = 0; aPts = 0;
    msg2 = ` Game to AI! ${pGames}-${aGames}`;
    if (aGames >= 6 && aGames - pGames >= 2) {
      aSets++;
      pGames = 0; aGames = 0;
      currentSet++;
      msg2 = ` Set to AI! ${pSets}-${aSets}`;
    }
  }

  const maxSets = state.totalSets;
  const setsToWin = Math.ceil(maxSets / 2) + (maxSets === 1 ? 0 : 0);
  const isOver = pSets >= setsToWin || aSets >= setsToWin || (maxSets === 1 && (pGames >= 6 || aGames >= 6));

  return {
    ...state,
    playerPoints: pPts,
    aiPoints: aPts,
    playerGames: pGames,
    aiGames: aGames,
    playerSets: pSets,
    aiSets: aSets,
    currentSet,
    lastRally: state.lastRally + msg2,
    phase: isOver ? "gameOver" : "play",
  };
}

export function reducer(state: DiceTennisState, action: DiceTennisAction): DiceTennisState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.phase === "gameOver") return state;

  const rng = mulberry32(state.seed + state.playerSets * 100 + state.currentSet * 10 + state.playerPoints);
  const dice = rollDice(rng, 3);
  const sum = dice[0]! + dice[1]! + dice[2]!;

  const { style } = action as { type: "serve"; style: "flat" | "spin" | "slice" };

  // Flat: high risk/reward — win on 14+, lose on 7-
  // Spin: medium — win on 11+
  // Slice: safe — win on 9+
  const thresholds = { flat: 14, spin: 11, slice: 9 };
  const threshold = thresholds[style];
  const playerWon = sum >= threshold;

  const rallyClaim = playerWon
    ? `You win the rally with a ${style} serve! (${sum})`
    : `AI returns! ${style} failed. (${sum})`;

  const newState = { ...state, lastRally: rallyClaim, lastDice: dice, seed: state.seed + 17 };
  return advancePoint(newState, playerWon);
}

export function isTerminal(state: DiceTennisState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  const won = state.playerSets > state.aiSets || (state.totalSets === 1 && state.playerGames > state.aiGames);
  const tied = state.playerSets === state.aiSets && state.playerGames === state.aiGames;
  return { score: won ? 1000 : tied ? 500 : 100 };
}
