import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Category = "person" | "object" | "action" | "animal" | "difficult";

export interface WordEntry {
  word: string;
  category: Category;
}

export interface PictionarySettings {
  _dummy?: boolean;
}

/** Standard Pictionary board: 50 squares. First team to reach the finish wins. */
export const BOARD_SIZE = 50;
export const TURN_SECONDS = 60;
/** Squares advanced per correct guess by category. Difficult/all-play awards bonus squares. */
export const SQUARES_PER_CATEGORY: Record<Category, number> = {
  person: 3,
  object: 3,
  action: 3,
  animal: 3,
  difficult: 5,
};

export const WORD_BANK: WordEntry[] = [
  // Person (10)
  { word: "Doctor", category: "person" },
  { word: "Astronaut", category: "person" },
  { word: "Chef", category: "person" },
  { word: "Firefighter", category: "person" },
  { word: "Pirate", category: "person" },
  { word: "Wizard", category: "person" },
  { word: "Teacher", category: "person" },
  { word: "Detective", category: "person" },
  { word: "Clown", category: "person" },
  { word: "Soldier", category: "person" },
  // Object (12)
  { word: "Umbrella", category: "object" },
  { word: "Telephone", category: "object" },
  { word: "Bicycle", category: "object" },
  { word: "Toothbrush", category: "object" },
  { word: "Lightbulb", category: "object" },
  { word: "Camera", category: "object" },
  { word: "Pillow", category: "object" },
  { word: "Hammer", category: "object" },
  { word: "Backpack", category: "object" },
  { word: "Sandwich", category: "object" },
  { word: "Ladder", category: "object" },
  { word: "Telescope", category: "object" },
  // Action (10)
  { word: "Running", category: "action" },
  { word: "Sleeping", category: "action" },
  { word: "Dancing", category: "action" },
  { word: "Painting", category: "action" },
  { word: "Swimming", category: "action" },
  { word: "Juggling", category: "action" },
  { word: "Sneezing", category: "action" },
  { word: "Climbing", category: "action" },
  { word: "Reading", category: "action" },
  { word: "Whistling", category: "action" },
  // Animal (10)
  { word: "Elephant", category: "animal" },
  { word: "Penguin", category: "animal" },
  { word: "Octopus", category: "animal" },
  { word: "Giraffe", category: "animal" },
  { word: "Kangaroo", category: "animal" },
  { word: "Hedgehog", category: "animal" },
  { word: "Butterfly", category: "animal" },
  { word: "Crocodile", category: "animal" },
  { word: "Squirrel", category: "animal" },
  { word: "Dolphin", category: "animal" },
  // Difficult / All-Play (10)
  { word: "Democracy", category: "difficult" },
  { word: "Gravity", category: "difficult" },
  { word: "Echo", category: "difficult" },
  { word: "Justice", category: "difficult" },
  { word: "Imagination", category: "difficult" },
  { word: "Whisper", category: "difficult" },
  { word: "Procrastinate", category: "difficult" },
  { word: "Mirage", category: "difficult" },
  { word: "Sympathy", category: "difficult" },
  { word: "Algorithm", category: "difficult" },
];

export type TeamId = 0 | 1;

export type Phase = "setup" | "drawing" | "turnover" | "done";

export interface PictionaryState {
  rngSeed: number;
  teamPositions: [number, number];
  currentTeam: TeamId;
  /** Index into WORD_BANK for the current word; -1 when not in a turn. */
  currentWordIdx: number;
  /** Remaining seconds in the current turn. */
  timeLeft: number;
  /** Words this team has solved in the current turn (advances cumulative). */
  turnAdvance: number;
  /** Words skipped this turn (informational). */
  turnSkips: number;
  phase: Phase;
  winner: TeamId | null;
  /** Cumulative correct guesses across the whole game per team. */
  totalCorrect: [number, number];
  /** Word indices already used in this game (avoid repeats while supply lasts). */
  usedWords: number[];
}

export type PictionaryAction =
  | { type: "start" }
  | { type: "tick" }
  | { type: "correct" }
  | { type: "skip" }
  | { type: "timeout" }
  | { type: "nextTurn" };

function pickWord(seed: number, used: number[]): { idx: number; nextSeed: number } {
  const rng = mulberry32(seed);
  // try a few times to avoid repeats; fall back to allowing repeat if all used
  for (let attempt = 0; attempt < 12; attempt++) {
    const idx = Math.floor(rng() * WORD_BANK.length);
    if (!used.includes(idx)) {
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return { idx, nextSeed };
    }
  }
  const idx = Math.floor(rng() * WORD_BANK.length);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { idx, nextSeed };
}

export function initialState(seed: number, _s: PictionarySettings): PictionaryState {
  void _s;
  return {
    rngSeed: seed >>> 0,
    teamPositions: [0, 0],
    currentTeam: 0,
    currentWordIdx: -1,
    timeLeft: TURN_SECONDS,
    turnAdvance: 0,
    turnSkips: 0,
    phase: "setup",
    winner: null,
    totalCorrect: [0, 0],
    usedWords: [],
  };
}

function advanceTeam(positions: [number, number], team: TeamId, by: number): [number, number] {
  const next: [number, number] = [positions[0], positions[1]];
  next[team] = Math.min(BOARD_SIZE, next[team] + by);
  return next;
}

export function reducer(state: PictionaryState, action: PictionaryAction): PictionaryState {
  if (state.phase === "done") return state;

  if (action.type === "start" && state.phase === "setup") {
    const { idx, nextSeed } = pickWord(state.rngSeed, state.usedWords);
    return {
      ...state,
      phase: "drawing",
      currentWordIdx: idx,
      rngSeed: nextSeed,
      timeLeft: TURN_SECONDS,
      turnAdvance: 0,
      turnSkips: 0,
      usedWords: [...state.usedWords, idx],
    };
  }

  if (action.type === "tick" && state.phase === "drawing") {
    if (state.timeLeft <= 1) {
      // out of time -> turnover
      return { ...state, timeLeft: 0, phase: "turnover" };
    }
    return { ...state, timeLeft: state.timeLeft - 1 };
  }

  if (action.type === "timeout" && state.phase === "drawing") {
    return { ...state, timeLeft: 0, phase: "turnover" };
  }

  if (action.type === "correct" && state.phase === "drawing" && state.currentWordIdx >= 0) {
    const word = WORD_BANK[state.currentWordIdx];
    if (!word) return state;
    const squares = SQUARES_PER_CATEGORY[word.category];
    const newPositions = advanceTeam(state.teamPositions, state.currentTeam, squares);
    const newCorrect: [number, number] = [state.totalCorrect[0], state.totalCorrect[1]];
    newCorrect[state.currentTeam] += 1;
    // Check winner
    if (newPositions[state.currentTeam] >= BOARD_SIZE) {
      return {
        ...state,
        teamPositions: newPositions,
        totalCorrect: newCorrect,
        phase: "done",
        winner: state.currentTeam,
        turnAdvance: state.turnAdvance + squares,
      };
    }
    // Pick a new word, keep drawing (team keeps going within their turn)
    const { idx, nextSeed } = pickWord(state.rngSeed, state.usedWords);
    return {
      ...state,
      teamPositions: newPositions,
      totalCorrect: newCorrect,
      currentWordIdx: idx,
      rngSeed: nextSeed,
      usedWords: [...state.usedWords, idx],
      turnAdvance: state.turnAdvance + squares,
    };
  }

  if (action.type === "skip" && state.phase === "drawing" && state.currentWordIdx >= 0) {
    const { idx, nextSeed } = pickWord(state.rngSeed, state.usedWords);
    return {
      ...state,
      currentWordIdx: idx,
      rngSeed: nextSeed,
      usedWords: [...state.usedWords, idx],
      turnSkips: state.turnSkips + 1,
    };
  }

  if (action.type === "nextTurn" && state.phase === "turnover") {
    const nextTeam: TeamId = state.currentTeam === 0 ? 1 : 0;
    return {
      ...state,
      currentTeam: nextTeam,
      phase: "setup",
      currentWordIdx: -1,
      timeLeft: TURN_SECONDS,
      turnAdvance: 0,
      turnSkips: 0,
    };
  }

  return state;
}

/** Win score: 100 base + bonus per square distance ahead of opponent. Loss = 0. */
export function isTerminal(state: PictionaryState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  const winnerPos = state.teamPositions[state.winner];
  const loserPos = state.teamPositions[state.winner === 0 ? 1 : 0];
  const margin = Math.max(0, winnerPos - loserPos);
  return { score: 100 + margin };
}
