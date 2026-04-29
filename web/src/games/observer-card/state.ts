import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const ITEMS_PER_TRAY = 6;

export interface ObserverCardSettings { dummy: boolean; }

const ITEMS: string[] = ["house","car","tree","dog","cat","bicycle","scooter","tulip","parrot","fox","traffic","sign","sun","moon","star","rainbow","umbrella","rain","snow","fire","leaf","grass","sunflower","cactus"];

export interface ObserverCardRound {
  tray: string[];
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export interface ObserverCardState {
  rounds: ObserverCardRound[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ObserverCardAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genRounds(rng: () => number): ObserverCardRound[] {
  const out: ObserverCardRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const trayItems = shuffle(ITEMS, rng).slice(0, ITEMS_PER_TRAY);
    const isPositive = rng() < 0.5;
    let answer: string;
    if (isPositive) {
      answer = trayItems[Math.floor(rng() * trayItems.length)]!;
    } else {
      let notIn = ITEMS[Math.floor(rng() * ITEMS.length)]!;
      let tries = 0;
      while (trayItems.includes(notIn) && tries < 60) {
        notIn = ITEMS[Math.floor(rng() * ITEMS.length)]!;
        tries++;
      }
      answer = notIn;
    }
    const correctAnsText = isPositive ? "YES - was in tray" : "NO - wasn't in tray";
    const wrongs = ["Maybe in tray", "Tray was empty", isPositive ? "NO - wasn't in tray" : "YES - was in tray"];
    const choices = shuffle([correctAnsText, ...wrongs], rng);
    const correctIdx = choices.indexOf(correctAnsText) as 0 | 1 | 2 | 3;
    out.push({
      tray: trayItems,
      question: "Did this appear in the tray? - " + answer,
      choices: choices as [string, string, string, string],
      correct: correctIdx,
    });
  }
  return out;
}

export function initialState(seed: number, _s: ObserverCardSettings): ObserverCardState {
  const rng = mulberry32(seed);
  return {
    rounds: genRounds(rng),
    currentIndex: 0,
    selected: null,
    submitted: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: ObserverCardState, action: ObserverCardAction): ObserverCardState {
  if (state.phase === "done") return state;
  if (action.type === "select") {
    if (state.submitted) return state;
    return { ...state, selected: action.choice };
  }
  if (action.type === "submit") {
    if (state.submitted || state.selected === null) return state;
    const r = state.rounds[state.currentIndex]!;
    const ok = state.selected === r.correct;
    return {
      ...state,
      submitted: true,
      score: state.score + (ok ? 10 : 0),
      correctCount: state.correctCount + (ok ? 1 : 0),
      phase: "result",
    };
  }
  if (action.type === "next") {
    const ni = state.currentIndex + 1;
    if (ni >= state.rounds.length) return { ...state, phase: "done" };
    return { ...state, currentIndex: ni, selected: null, submitted: false, phase: "playing" };
  }
  return state;
}

export function isTerminal(state: ObserverCardState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
