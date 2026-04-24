import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Magic8BallSettings {
  shakeCount: "10" | "20" | "unlimited";
}

export type AnswerKind = "positive" | "neutral" | "negative";

export interface Answer {
  text: string;
  kind: AnswerKind;
}

export const ANSWERS: Answer[] = [
  { text: "It is certain.", kind: "positive" },
  { text: "It is decidedly so.", kind: "positive" },
  { text: "Without a doubt.", kind: "positive" },
  { text: "Yes, definitely.", kind: "positive" },
  { text: "You may rely on it.", kind: "positive" },
  { text: "As I see it, yes.", kind: "positive" },
  { text: "Most likely.", kind: "positive" },
  { text: "Outlook good.", kind: "positive" },
  { text: "Yes.", kind: "positive" },
  { text: "Signs point to yes.", kind: "positive" },
  { text: "Reply hazy, try again.", kind: "neutral" },
  { text: "Ask again later.", kind: "neutral" },
  { text: "Better not tell you now.", kind: "neutral" },
  { text: "Cannot predict now.", kind: "neutral" },
  { text: "Concentrate and ask again.", kind: "neutral" },
  { text: "Don't count on it.", kind: "negative" },
  { text: "My reply is no.", kind: "negative" },
  { text: "My sources say no.", kind: "negative" },
  { text: "Outlook not so good.", kind: "negative" },
  { text: "Very doubtful.", kind: "negative" },
];

export interface ShakeEntry {
  question: string;
  answer: Answer;
}

export interface Magic8BallState {
  settings: Magic8BallSettings;
  rngSeed: number;
  question: string;
  shaking: boolean;
  currentAnswer: Answer | null;
  history: ShakeEntry[];
  shakesUsed: number;
  maxShakes: number;
  gameOver: boolean;
}

export type Magic8BallAction =
  | { type: "setQuestion"; question: string }
  | { type: "shake" }
  | { type: "reset" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

export function initialState(seed: number, settings: Magic8BallSettings): Magic8BallState {
  const maxShakes = settings.shakeCount === "unlimited" ? 9999 : parseInt(settings.shakeCount, 10);
  return {
    settings,
    rngSeed: seed >>> 0,
    question: "",
    shaking: false,
    currentAnswer: null,
    history: [],
    shakesUsed: 0,
    maxShakes,
    gameOver: false,
  };
}

export function reducer(state: Magic8BallState, action: Magic8BallAction): Magic8BallState {
  if (action.type === "reset") {
    return initialState(nextSeed(state.rngSeed), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "setQuestion") {
    return { ...state, question: action.question };
  }

  if (action.type === "shake") {
    if (!state.question.trim()) return state;
    if (state.shakesUsed >= state.maxShakes) return state;

    const rng = mulberry32(state.rngSeed);
    const idx = Math.floor(rng() * ANSWERS.length);
    const answer = ANSWERS[idx]!;
    const newSeed = nextSeed(state.rngSeed);
    const shakesUsed = state.shakesUsed + 1;
    const entry: ShakeEntry = { question: state.question.trim(), answer };
    const gameOver = shakesUsed >= state.maxShakes && state.maxShakes !== 9999;

    return {
      ...state,
      rngSeed: newSeed,
      currentAnswer: answer,
      history: [entry, ...state.history],
      shakesUsed,
      question: "",
      shaking: false,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: Magic8BallState): { score: number } | null {
  if (!state.gameOver) return null;
  const positives = state.history.filter(h => h.answer.kind === "positive").length;
  return { score: positives * 50 + state.shakesUsed * 10 };
}
