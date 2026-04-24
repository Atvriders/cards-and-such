import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

const WORD_POOL = [
  "apple", "bridge", "cloud", "dance", "eagle", "flame", "garden", "harbor",
  "island", "jungle", "kettle", "lantern", "marble", "needle", "ocean", "pillow",
  "quartz", "river", "shadow", "tunnel", "umbrella", "valley", "window", "xerox",
  "yellow", "zipper", "basket", "candle", "dragon", "engine", "forest", "guitar",
  "hammer", "income", "jacket", "kernel", "lemon", "mirror", "napkin", "orange",
  "pencil", "rabbit", "silver", "timber", "unique", "violin", "wallet", "accent",
  "barrel", "castle", "desert", "eyelid", "feather", "glider", "helmet", "insect",
  "jewel", "knight", "logger", "magnet", "noodle", "oyster", "parrot", "quiver",
  "rocket", "salmon", "tablet", "urchin", "vessel", "weasel", "xylophone", "yogurt",
  "zenith", "anchor", "beetle", "cobalt", "donkey", "ellipse", "falcon", "goblin",
  "hatchet", "igloo", "jaguar", "knapsack", "lobster", "muffin", "nugget", "obelisk",
  "pebble", "quail", "radish", "saddle", "throne", "ukulele", "vortex", "walrus",
  "xylem", "yacht", "zephyr", "acorn", "blizzard", "crater", "dagger", "eclipse",
  "fissure", "glacier", "horizon", "impulse", "javelin", "lanyard", "mosaic", "nimbus",
  "obsidian", "pendant", "quarry", "rampart", "sequoia", "tundra", "umber", "venom",
];

function buildQueue(seed: number, count: number): string[] {
  const rng = mulberry32(seed);
  const pool = [...WORD_POOL];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count);
}

export interface VerbalMemoryState {
  settings: { lives: "3" | "5"; difficulty: "easy" | "medium" | "hard" };
  queue: string[];
  seen: string[];
  currentIndex: number;
  score: number;
  lives: number;
  ended: boolean;
  lastResult: "correct" | "wrong" | null;
  rngSeed: number;
}

export type VerbalMemoryAction =
  | { type: "seen" }
  | { type: "new" };

export function initialState(
  seed: number,
  settings: { lives: "3" | "5"; difficulty: "easy" | "medium" | "hard" },
): VerbalMemoryState {
  const count = settings.difficulty === "easy" ? 60 : settings.difficulty === "medium" ? 80 : 100;
  return {
    settings,
    queue: buildQueue(seed, count),
    seen: [],
    currentIndex: 0,
    score: 0,
    lives: parseInt(settings.lives, 10),
    ended: false,
    lastResult: null,
    rngSeed: seed,
  };
}

export function reducer(state: VerbalMemoryState, action: VerbalMemoryAction): VerbalMemoryState {
  if (state.ended) return state;

  const currentWord = state.queue[state.currentIndex];
  if (currentWord === undefined) return { ...state, ended: true };

  const alreadySeen = state.seen.includes(currentWord);

  switch (action.type) {
    case "seen": {
      const correct = alreadySeen;
      const newLives = correct ? state.lives : state.lives - 1;
      const newScore = correct ? state.score + 1 : state.score;
      const ended = newLives <= 0 || state.currentIndex + 1 >= state.queue.length;
      return {
        ...state,
        score: newScore,
        lives: newLives,
        seen: alreadySeen ? state.seen : [...state.seen, currentWord],
        currentIndex: state.currentIndex + 1,
        ended,
        lastResult: correct ? "correct" : "wrong",
      };
    }
    case "new": {
      const correct = !alreadySeen;
      const newLives = correct ? state.lives : state.lives - 1;
      const newScore = correct ? state.score + 1 : state.score;
      const ended = newLives <= 0 || state.currentIndex + 1 >= state.queue.length;
      return {
        ...state,
        score: newScore,
        lives: newLives,
        seen: [...state.seen, currentWord],
        currentIndex: state.currentIndex + 1,
        ended,
        lastResult: correct ? "correct" : "wrong",
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: VerbalMemoryState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
