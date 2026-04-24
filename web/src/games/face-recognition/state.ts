import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type FRPhase = "idle" | "memorize" | "choose" | "result" | "done";
export type Difficulty = "easy" | "medium" | "hard";

// Face components
const SKIN_TONES = ["🟡","🟤","🟠","⬜","🩶"] as const;
const EYE_STYLES = ["👀","🔵","🟢","⬛","🟣"] as const;
const HAIR_STYLES = ["🌑","🔴","💛","⬜","🟫"] as const;
const EXTRAS = ["🎩","🎓","👑","🌸","🕶️","🎀","🧢","🎭"] as const;

export interface Face {
  skin: string;
  eyes: string;
  hair: string;
  extra: string;
  seed: number;
}

const MEMORIZE_MS: Record<Difficulty, number> = {
  easy:   5000,
  medium: 3000,
  hard:   2000,
};

const TOTAL_ROUNDS = 10;

function buildFace(seed: number, counter: number): Face {
  const rng = mulberry32(seed + counter * 999983);
  return {
    skin:  SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)]!,
    eyes:  EYE_STYLES[Math.floor(rng() * EYE_STYLES.length)]!,
    hair:  HAIR_STYLES[Math.floor(rng() * HAIR_STYLES.length)]!,
    extra: EXTRAS[Math.floor(rng() * EXTRAS.length)]!,
    seed: counter,
  };
}

function buildRound(seed: number, counter: number): { target: Face; choices: Face[]; correctIdx: number } {
  const target = buildFace(seed, counter * 100);
  // Build 3 distractors
  const distractors: Face[] = [];
  for (let i = 1; i <= 3; i++) {
    let d: Face;
    let attempts = 0;
    do {
      d = buildFace(seed, counter * 100 + i * 10 + attempts);
      attempts++;
    } while (
      attempts < 20 &&
      (d.skin === target.skin && d.eyes === target.eyes && d.hair === target.hair && d.extra === target.extra)
    );
    distractors.push(d);
  }

  // Shuffle the 4 choices
  const rng = mulberry32(seed + counter * 777777);
  const correctIdx = Math.floor(rng() * 4);
  const choices = [...distractors.slice(0, correctIdx), target, ...distractors.slice(correctIdx)];

  return { target, choices, correctIdx };
}

export interface FaceRecognitionState {
  settings: { difficulty: Difficulty };
  phase: FRPhase;
  target: Face | null;
  choices: readonly Face[];
  correctIdx: number;
  round: number;
  score: number;
  lastCorrect: boolean | null;
  memorizeMs: number;
  rngSeed: number;
  rngCounter: number;
}

export type FRAction =
  | { type: "start" }
  | { type: "reveal" }
  | { type: "choose"; index: number }
  | { type: "next" };

export function initialState(
  seed: number,
  settings: { difficulty: Difficulty },
): FaceRecognitionState {
  return {
    settings,
    phase: "idle",
    target: null,
    choices: [],
    correctIdx: -1,
    round: 0,
    score: 0,
    lastCorrect: null,
    memorizeMs: MEMORIZE_MS[settings.difficulty],
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: FaceRecognitionState, action: FRAction): FaceRecognitionState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const { target, choices, correctIdx } = buildRound(state.rngSeed, state.rngCounter);
      return {
        ...state,
        phase: "memorize",
        target,
        choices,
        correctIdx,
        round: 1,
        score: 0,
        lastCorrect: null,
        memorizeMs: MEMORIZE_MS[state.settings.difficulty],
        rngCounter: state.rngCounter + 1,
      };
    }

    case "reveal": {
      if (state.phase !== "memorize") return state;
      return { ...state, phase: "choose" };
    }

    case "choose": {
      if (state.phase !== "choose") return state;
      const correct = action.index === state.correctIdx;
      return {
        ...state,
        phase: "result",
        lastCorrect: correct,
        score: state.score + (correct ? 10 : 0),
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      if (state.round >= TOTAL_ROUNDS) {
        return { ...state, phase: "done" };
      }
      const { target, choices, correctIdx } = buildRound(state.rngSeed, state.rngCounter);
      return {
        ...state,
        phase: "memorize",
        target,
        choices,
        correctIdx,
        round: state.round + 1,
        lastCorrect: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FaceRecognitionState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
