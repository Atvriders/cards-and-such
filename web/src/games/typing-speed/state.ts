import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

const PARAGRAPHS: string[] = [
  "The quick brown fox jumps over the lazy dog near the riverbank where willows sway in the gentle breeze and birds sing their morning songs.",
  "Pack my box with five dozen liquor jugs and leave them by the old wooden dock where fishermen gather at dawn each day.",
  "Sphinx of black quartz judge my vow as the ancient clock tower chimes midnight across the cobblestone square below.",
  "How vexingly quick daft zebras jump over the pale golden fence at the edge of the savanna.",
  "The five boxing wizards jumped quickly over the sleeping fox that lay curled beside the warm hearth on a winter night.",
  "Bright vixens jump dozy fowl quack the old farmer watching from the porch of the red barn as sunset painted the sky.",
  "We promptly judged antique ivory buckles for the next prize as the autumn fair opened its gates to the eager crowd.",
  "Just keep examining every low bid quoted for zinc etchings that adorn the walls of the new gallery downtown.",
  "A mad boxer shot a quick gloved jab to the jaw of his dizzy opponent in the final round of the championship bout.",
  "Six big juicy steaks sizzled in the pan as the chef carefully flipped them over with the worn wooden spatula.",
  "The jazzy saxophone player amazed everyone with his quick improvised solos during the outdoor summer concert festival.",
  "Two driven jocks help fax my big quiz by sending it over the network before the deadline at noon.",
];

const EASY_PARAGRAPHS = PARAGRAPHS.slice(0, 4);
const MEDIUM_PARAGRAPHS = PARAGRAPHS.slice(0, 8);
const HARD_PARAGRAPHS = PARAGRAPHS;

export interface TypingSpeedState {
  settings: { duration: "30" | "60" | "120"; difficulty: "easy" | "medium" | "hard" };
  paragraph: string;
  typed: string;
  elapsed: number;
  ended: boolean;
  rngSeed: number;
}

export type TypingSpeedAction =
  | { type: "tick"; dt: number }
  | { type: "type"; text: string };

export function initialState(
  seed: number,
  settings: { duration: "30" | "60" | "120"; difficulty: "easy" | "medium" | "hard" },
): TypingSpeedState {
  const rng = mulberry32(seed);
  const pool =
    settings.difficulty === "easy"
      ? EASY_PARAGRAPHS
      : settings.difficulty === "medium"
        ? MEDIUM_PARAGRAPHS
        : HARD_PARAGRAPHS;
  const idx = Math.floor(rng() * pool.length);
  const paragraph = pool[idx]!;
  return {
    settings,
    paragraph,
    typed: "",
    elapsed: 0,
    ended: false,
    rngSeed: seed,
  };
}

function calcWpm(typed: string, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / elapsedSeconds) * 60);
}

function calcAccuracy(typed: string, paragraph: string): number {
  if (typed.length === 0) return 100;
  let correct = 0;
  const len = Math.min(typed.length, paragraph.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === paragraph[i]) correct++;
  }
  return Math.round((correct / typed.length) * 100);
}

export function calcScore(state: TypingSpeedState): number {
  const wpm = calcWpm(state.typed, state.elapsed);
  const acc = calcAccuracy(state.typed, state.paragraph);
  return Math.round(wpm * (acc / 100));
}

export function reducer(state: TypingSpeedState, action: TypingSpeedAction): TypingSpeedState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + action.dt;
      if (newElapsed >= duration) {
        return { ...state, elapsed: duration, ended: true };
      }
      return { ...state, elapsed: newElapsed };
    }
    case "type": {
      // Don't allow typing beyond paragraph length
      const text = action.text.slice(0, state.paragraph.length);
      const finished = text === state.paragraph;
      return { ...state, typed: text, ended: finished };
    }
    default:
      return state;
  }
}

export function isTerminal(state: TypingSpeedState): { score: number } | null {
  if (!state.ended) return null;
  return { score: calcScore(state) };
}
