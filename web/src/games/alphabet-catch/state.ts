import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Alphabet Catch — a letter falls from the sky; tap the matching letter button

export interface AlphabetSettings {
  rounds: "5" | "10" | "15";
}

export interface AlphabetState {
  settings: AlphabetSettings;
  rngSeed: number;
  target: string; // single uppercase letter
  choices: string[]; // 4 choices including target
  roundNum: number;
  totalRounds: number;
  score: number;
  lastCorrect: boolean | null;
  message: string;
  done: boolean;
}

export type AlphabetAction = { type: "catch"; letter: string };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function makeRound(seed: number): { target: string; choices: string[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const target = ALPHABET[Math.floor(rng() * 26)]!;
  const choiceSet = new Set<string>([target]);
  while (choiceSet.size < 4) {
    choiceSet.add(ALPHABET[Math.floor(rng() * 26)]!);
  }
  // Shuffle choices
  const choices = Array.from(choiceSet);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = choices[i]!;
    choices[i] = choices[j]!;
    choices[j] = tmp;
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { target, choices, nextSeed };
}

export function initialState(seed: number, settings: AlphabetSettings): AlphabetState {
  const totalRounds = parseInt(settings.rounds);
  const { target, choices, nextSeed } = makeRound(seed);
  return {
    settings,
    rngSeed: nextSeed,
    target,
    choices,
    roundNum: 1,
    totalRounds,
    score: 0,
    lastCorrect: null,
    message: `Catch the letter: ${target}`,
    done: false,
  };
}

export function reducer(state: AlphabetState, action: AlphabetAction): AlphabetState {
  if (state.done) return state;
  if (action.type !== "catch") return state;

  const correct = action.letter === state.target;
  const score = state.score + (correct ? Math.round(100 / state.totalRounds) : 0);

  if (state.roundNum >= state.totalRounds) {
    return {
      ...state,
      score,
      lastCorrect: correct,
      done: true,
      message: correct ? `${action.letter}! Final score: ${score}. Great catch!` : `It was ${state.target}! Final score: ${score}.`,
    };
  }

  const { target, choices, nextSeed } = makeRound(state.rngSeed);
  return {
    ...state,
    rngSeed: nextSeed,
    target,
    choices,
    roundNum: state.roundNum + 1,
    score,
    lastCorrect: correct,
    message: correct ? `${action.letter}! Next: catch ${target}` : `Oops — it was ${state.target}. Next: catch ${target}`,
  };
}

export function isTerminal(state: AlphabetState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.score };
}
