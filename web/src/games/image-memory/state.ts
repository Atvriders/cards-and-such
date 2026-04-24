import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type IMPhase = "idle" | "showing" | "input" | "result" | "done";
export type Difficulty = "6" | "8" | "9";

export const IMAGE_ICONS = [
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
  "🦁","🐮","🐷","🐸","🐵","🦋","🐢","🦄","🐳","🦈",
  "🌸","🌺","🌻","🌹","🍎","🍊","🍋","🍇","🍓","🍕",
  "⭐","🌙","☀️","🔥","💧","🎈","🎁","🎵","🎮","🏆",
];

export interface ImageMemoryState {
  settings: { difficulty: Difficulty };
  phase: IMPhase;
  /** The icons in display order (for showing phase) */
  icons: readonly string[];
  /** Order in which icons were shown (indices into icons array) */
  showOrder: readonly number[];
  /** Which icon index the player must click next */
  playerStep: number;
  /** Icons the player has clicked so far (indices) */
  playerClicks: readonly number[];
  /** Which icons have been correctly recalled */
  correctClicks: readonly number[];
  round: number;
  score: number;
  lastRoundCorrect: boolean | null;
  flashIndex: number;
  rngSeed: number;
  rngCounter: number;
}

export type ImageMemoryAction =
  | { type: "start" }
  | { type: "advance-flash" }
  | { type: "click-icon"; index: number }
  | { type: "next" };

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(
  seed: number,
  settings: { difficulty: Difficulty },
): ImageMemoryState {
  return {
    settings,
    phase: "idle",
    icons: [],
    showOrder: [],
    playerStep: 0,
    playerClicks: [],
    correctClicks: [],
    round: 0,
    score: 0,
    lastRoundCorrect: null,
    flashIndex: -1,
    rngSeed: seed,
    rngCounter: 0,
  };
}

function buildRound(seed: number, counter: number, count: number) {
  const rng = mulberry32(seed + counter * 999983);
  const shuffledIcons = seededShuffle([...IMAGE_ICONS], rng);
  const icons = shuffledIcons.slice(0, count);
  // Generate a random show order
  const indices = icons.map((_, i) => i);
  const showOrder = seededShuffle(indices, rng);
  return { icons, showOrder };
}

export function reducer(state: ImageMemoryState, action: ImageMemoryAction): ImageMemoryState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const count = parseInt(state.settings.difficulty, 10);
      const { icons, showOrder } = buildRound(state.rngSeed, state.rngCounter, count);
      return {
        ...state,
        phase: "showing",
        icons,
        showOrder,
        playerStep: 0,
        playerClicks: [],
        correctClicks: [],
        round: 1,
        score: 0,
        lastRoundCorrect: null,
        flashIndex: 0,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "advance-flash": {
      if (state.phase !== "showing") return state;
      const nextFlash = state.flashIndex + 1;
      if (nextFlash >= state.showOrder.length) {
        return { ...state, phase: "input", flashIndex: -1 };
      }
      return { ...state, flashIndex: nextFlash };
    }

    case "click-icon": {
      if (state.phase !== "input") return state;
      const { index } = action;
      const expectedIconIdx = state.showOrder[state.playerStep];
      const correct = index === expectedIconIdx;

      const newClicks = [...state.playerClicks, index];
      const newCorrect = correct ? [...state.correctClicks, index] : state.correctClicks;
      const newStep = state.playerStep + 1;

      if (!correct || newStep >= state.showOrder.length) {
        // Round over
        const roundScore = newCorrect.length * parseInt(state.settings.difficulty, 10);
        return {
          ...state,
          phase: "result",
          playerClicks: newClicks,
          correctClicks: newCorrect,
          playerStep: newStep,
          lastRoundCorrect: correct && newStep >= state.showOrder.length,
          score: state.score + roundScore,
        };
      }

      return {
        ...state,
        playerClicks: newClicks,
        correctClicks: newCorrect,
        playerStep: newStep,
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      if (state.round >= 5) {
        return { ...state, phase: "done" };
      }
      const count = parseInt(state.settings.difficulty, 10);
      const { icons, showOrder } = buildRound(state.rngSeed, state.rngCounter, count);
      return {
        ...state,
        phase: "showing",
        icons,
        showOrder,
        playerStep: 0,
        playerClicks: [],
        correctClicks: [],
        round: state.round + 1,
        lastRoundCorrect: null,
        flashIndex: 0,
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ImageMemoryState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
