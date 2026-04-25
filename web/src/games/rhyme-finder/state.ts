import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RhymeFinderSettings {
  questionCount: "5" | "10" | "15";
}

export interface RhymeFinderEntry {
  prompt: string;
  answer: string;
  choices: string[];
}

export interface RhymeFinderState {
  settings: RhymeFinderSettings;
  entries: RhymeFinderEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type RhymeFinderAction =
  | { type: "select"; index: number }
  | { type: "next" };

// Each entry: prompt word + which answer rhymes + distractors that don't rhyme
const BANK: { prompt: string; answer: string; distractors: string[] }[] = [
  { prompt: "CAT", answer: "BAT", distractors: ["DOG", "SHIP", "MOON"] },
  { prompt: "NIGHT", answer: "LIGHT", distractors: ["BOOK", "FROG", "TREE"] },
  { prompt: "MOON", answer: "SPOON", distractors: ["STAR", "CLOUD", "FISH"] },
  { prompt: "LOVE", answer: "DOVE", distractors: ["HATE", "ROCK", "BELL"] },
  { prompt: "RAIN", answer: "TRAIN", distractors: ["SNOW", "WIND", "CLOUD"] },
  { prompt: "BLUE", answer: "CLUE", distractors: ["RED", "GREEN", "PINK"] },
  { prompt: "FIRE", answer: "HIRE", distractors: ["WATER", "EARTH", "WIND"] },
  { prompt: "BREAD", answer: "DREAD", distractors: ["CAKE", "MILK", "SOUP"] },
  { prompt: "DOOR", answer: "FLOOR", distractors: ["WINDOW", "WALL", "ROOF"] },
  { prompt: "DAY", answer: "PLAY", distractors: ["NIGHT", "WEEK", "YEAR"] },
  { prompt: "BRIGHT", answer: "MIGHT", distractors: ["DARK", "GLOW", "SHADE"] },
  { prompt: "RING", answer: "SPRING", distractors: ["BAND", "LOOP", "HOOK"] },
  { prompt: "CHEESE", answer: "BREEZE", distractors: ["BUTTER", "CREAM", "BREAD"] },
  { prompt: "BEAR", answer: "CARE", distractors: ["WOLF", "DEER", "LION"] },
  { prompt: "STONE", answer: "PHONE", distractors: ["ROCK", "SAND", "SOIL"] },
  { prompt: "GRACE", answer: "PLACE", distractors: ["CHARM", "BEAUTY", "POISE"] },
  { prompt: "COLD", answer: "BOLD", distractors: ["WARM", "HOT", "COOL"] },
  { prompt: "TREE", answer: "FREE", distractors: ["BUSH", "LEAF", "ROOT"] },
  { prompt: "LIGHT", answer: "NIGHT", distractors: ["DARK", "DUSK", "DAWN"] },
  { prompt: "STAR", answer: "FAR", distractors: ["MOON", "SUN", "CLOUD"] },
  { prompt: "CAKE", answer: "LAKE", distractors: ["PIE", "TART", "BREAD"] },
  { prompt: "BEST", answer: "REST", distractors: ["GOOD", "TOP", "PRIME"] },
  { prompt: "GROW", answer: "FLOW", distractors: ["SHRINK", "RISE", "CLIMB"] },
  { prompt: "CLOCK", answer: "BLOCK", distractors: ["WATCH", "TIMER", "DIAL"] },
  { prompt: "WHALE", answer: "TALE", distractors: ["SHARK", "SEAL", "ORCA"] },
  { prompt: "DREAM", answer: "STREAM", distractors: ["SLEEP", "CLOUD", "NIGHT"] },
  { prompt: "HIGH", answer: "SKY", distractors: ["LOW", "TALL", "DEEP"] },
  { prompt: "SAND", answer: "HAND", distractors: ["DIRT", "CLAY", "SOIL"] },
  { prompt: "GOLD", answer: "TOLD", distractors: ["SILVER", "BRONZE", "COPPER"] },
  { prompt: "FLIGHT", answer: "WHITE", distractors: ["TRIP", "JOURNEY", "VOYAGE"] },
  { prompt: "ROAM", answer: "HOME", distractors: ["WANDER", "DRIFT", "TRAVEL"] },
  { prompt: "GRACE", answer: "RACE", distractors: ["POISE", "CHARM", "STYLE"] },
  { prompt: "JUMP", answer: "PUMP", distractors: ["RUN", "SKIP", "HOP"] },
  { prompt: "BELL", answer: "WELL", distractors: ["GONG", "CHIME", "RING"] },
  { prompt: "HORN", answer: "BORN", distractors: ["TUSK", "FLUTE", "DRUM"] },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: RhymeFinderSettings): RhymeFinderState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const chosen = shuffledBank.slice(0, count);

  const entries: RhymeFinderEntry[] = chosen.map((item) => {
    const wrongPool = shuffle(item.distractors, rng).slice(0, 3);
    const choices = shuffle([item.answer, ...wrongPool], rng);
    return { prompt: item.prompt, answer: item.answer, choices };
  });

  return {
    settings,
    entries,
    current: 0,
    selected: null,
    score: 0,
    done: false,
  };
}

export function reducer(state: RhymeFinderState, action: RhymeFinderAction): RhymeFinderState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const entry = state.entries[state.current]!;
      const correct = entry.choices[action.index] === entry.answer;
      return {
        ...state,
        selected: action.index,
        score: correct ? state.score + 10 : state.score,
      };
    }
    case "next": {
      if (state.selected === null) return state;
      const nextIdx = state.current + 1;
      if (nextIdx >= state.entries.length) {
        return { ...state, done: true };
      }
      return { ...state, current: nextIdx, selected: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: RhymeFinderState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
