import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HexColorGuessSettings {
  rounds: "5" | "10" | "15";
}

export interface Round {
  color: string; // hex like "#3fa2c1"
  options: string[]; // 4 choices
  chosen: string | null;
  correct: boolean;
}

export interface HexColorGuessState {
  settings: HexColorGuessSettings;
  rngSeed: number;
  totalRounds: number;
  rounds: Round[];
  currentRound: number;
  score: number;
  gameOver: boolean;
}

export type HexColorGuessAction =
  | { type: "choose"; hex: string };

function randomHex(rng: () => number): string {
  const r = Math.floor(rng() * 256);
  const g = Math.floor(rng() * 256);
  const b = Math.floor(rng() * 256);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function generateRound(rng: () => number): { color: string; options: string[] } {
  const color = randomHex(rng);
  const distractors: string[] = [];
  while (distractors.length < 3) {
    distractors.push(randomHex(rng));
  }
  // Shuffle
  const all = [color, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  return { color, options: all };
}

export function initialState(seed: number, settings: HexColorGuessSettings): HexColorGuessState {
  const totalRounds = parseInt(settings.rounds, 10);
  const rng = mulberry32(seed >>> 0);
  const rounds: Round[] = [];
  for (let i = 0; i < totalRounds; i++) {
    const { color, options } = generateRound(rng);
    rounds.push({ color, options, chosen: null, correct: false });
  }
  return {
    settings,
    rngSeed: seed >>> 0,
    totalRounds,
    rounds,
    currentRound: 0,
    score: 0,
    gameOver: false,
  };
}

export function reducer(state: HexColorGuessState, action: HexColorGuessAction): HexColorGuessState {
  if (state.gameOver) return state;

  if (action.type === "choose") {
    const round = state.rounds[state.currentRound];
    if (!round || round.chosen !== null) return state;

    const correct = action.hex === round.color;
    const updatedRound: Round = { ...round, chosen: action.hex, correct };
    const rounds = [
      ...state.rounds.slice(0, state.currentRound),
      updatedRound,
      ...state.rounds.slice(state.currentRound + 1),
    ];
    const score = state.score + (correct ? 100 : 0);
    const nextRound = state.currentRound + 1;
    const gameOver = nextRound >= state.totalRounds;
    return {
      ...state,
      rounds,
      currentRound: gameOver ? state.currentRound : nextRound,
      score,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: HexColorGuessState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
