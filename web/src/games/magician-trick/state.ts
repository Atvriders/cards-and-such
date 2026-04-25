import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MagicianTrickSettings {
  cups: "3" | "4" | "5";
}

export type TrickPhase = "reveal" | "shuffle" | "guess" | "result";

export interface MagicianTrickState {
  settings: MagicianTrickSettings;
  numCups: number;
  ballPos: number;
  displayPos: number | null;  // shown position (during reveal/result)
  phase: TrickPhase;
  shuffleHistory: [number, number][];
  shuffleStep: number;
  guessed: number | null;
  correct: boolean;
  wins: number;
  round: number;
  totalRounds: number;
  score: number;
  gameOver: boolean;
  message: string;
  rngSeed: number;
}

export type MagicianTrickAction =
  | { type: "startShuffle" }
  | { type: "nextShuffle" }
  | { type: "guess"; cup: number }
  | { type: "nextRound" }
  | { type: "restart" };

const TOTAL_ROUNDS = 5;

function generateShuffles(seed: number, numCups: number, shuffleCount: number): [number, number][] {
  const rng = mulberry32(seed);
  const swaps: [number, number][] = [];
  for (let i = 0; i < shuffleCount; i++) {
    let a = Math.floor(rng() * numCups);
    let b = Math.floor(rng() * numCups);
    while (b === a) b = Math.floor(rng() * numCups);
    swaps.push([a, b]);
  }
  return swaps;
}

export function initialState(seed: number, settings: MagicianTrickSettings): MagicianTrickState {
  const numCups = parseInt(settings.cups, 10);
  const rng = mulberry32(seed);
  const ballPos = Math.floor(rng() * numCups);
  const shuffleCount = 3 + numCups;
  const shuffles = generateShuffles(seed + 1, numCups, shuffleCount);
  return {
    settings,
    numCups,
    ballPos,
    displayPos: ballPos,
    phase: "reveal",
    shuffleHistory: shuffles,
    shuffleStep: 0,
    guessed: null,
    correct: false,
    wins: 0,
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    score: 0,
    gameOver: false,
    message: "Watch the ball under the cup...",
    rngSeed: seed,
  };
}

export function reducer(state: MagicianTrickState, action: MagicianTrickAction): MagicianTrickState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "startShuffle" && state.phase === "reveal") {
    return { ...state, phase: "shuffle", displayPos: null, message: "Follow the cup with the ball!" };
  }
  if (action.type === "nextShuffle" && state.phase === "shuffle") {
    const nextStep = state.shuffleStep + 1;
    if (nextStep >= state.shuffleHistory.length) {
      return { ...state, shuffleStep: nextStep, phase: "guess", message: "Which cup hides the ball?" };
    }
    const [a, b] = state.shuffleHistory[nextStep - 1]!;
    let newBall = state.ballPos;
    if (newBall === a) newBall = b;
    else if (newBall === b) newBall = a;
    return { ...state, shuffleStep: nextStep, ballPos: newBall, message: `Shuffling... (${nextStep}/${state.shuffleHistory.length})` };
  }
  if (action.type === "guess" && state.phase === "guess") {
    const correct = action.cup === state.ballPos;
    const wins = correct ? state.wins + 1 : state.wins;
    const scoreGain = correct ? Math.floor(1000 / state.totalRounds) : 0;
    return {
      ...state,
      guessed: action.cup,
      correct,
      wins,
      score: state.score + scoreGain,
      displayPos: state.ballPos,
      phase: "result",
      message: correct ? "Correct! You found it!" : `Wrong! It was cup ${state.ballPos + 1}.`,
    };
  }
  if (action.type === "nextRound" && state.phase === "result") {
    const newRound = state.round + 1;
    if (newRound > state.totalRounds) {
      return { ...state, round: newRound, gameOver: true, message: `Game over! ${state.wins}/${state.totalRounds} correct.` };
    }
    const rng = mulberry32(state.rngSeed + newRound * 31);
    const newBall = Math.floor(rng() * state.numCups);
    const shuffles = generateShuffles(state.rngSeed + newRound * 37, state.numCups, 3 + state.numCups);
    return {
      ...state,
      ballPos: newBall,
      displayPos: newBall,
      phase: "reveal",
      shuffleHistory: shuffles,
      shuffleStep: 0,
      guessed: null,
      round: newRound,
      message: "Watch the ball under the cup...",
    };
  }
  return state;
}

export function isTerminal(state: MagicianTrickState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, state.score) };
}
