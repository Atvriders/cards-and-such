import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_SIZE = 4;
export const TIME_LIMIT = 60; // seconds (simulated as turns)
export const MAX_TURNS = 20;

export type Phase = "play" | "done";

export interface BoggleProState {
  rngSeed: number;
  grid: string[];
  foundWords: readonly string[];
  score: number;
  turns: number;
  phase: Phase;
  lastWord: string;
  lastValid: boolean;
  log: readonly string[];
}

export type BoggleProAction =
  | { type: "submitWord"; word: string }
  | { type: "pass" }
  | { type: "endGame" };

// Small word list embedded for offline play
const VALID_WORDS = new Set([
  "cat", "bat", "rat", "sat", "mat", "fat", "hat", "pat", "vat",
  "car", "bar", "far", "jar", "tar", "war", "star", "scar",
  "tan", "ran", "ban", "can", "man", "pan", "fan", "van",
  "ten", "hen", "den", "pen", "men", "yen", "zen",
  "top", "pop", "cop", "hop", "mop", "sop",
  "ace", "ice", "are", "ore", "ire", "eve",
  "in", "is", "it", "at", "on", "or", "an",
  "sit", "bit", "hit", "fit", "kit", "pit", "wit",
  "cut", "but", "gut", "hut", "nut", "put", "rut",
  "arm", "art", "ant", "apt", "arc",
  "ear", "eat", "era", "err",
  "oak", "oar", "oat",
  "tab", "tip", "tap", "tie",
  "sir", "sea", "set", "sin", "sob",
  "net", "nap", "nab", "nil",
  "one", "our",
  "per", "pet", "pie", "pin", "pit",
  "rim", "rip", "rob", "rot", "row", "rue", "run",
  "scan", "span", "spin", "spit", "spot", "stem",
  "trap", "trip", "trot", "trim",
  "vest", "vent", "vane", "vain",
  "writ", "wren", "wrap", "wren",
  "torn", "tone", "tore", "tire",
  "bare", "bane", "bale", "bait",
  "care", "cane", "came", "cape", "case", "cave",
  "dare", "daze", "dame", "date", "dave",
  "fare", "fame", "face", "fade", "fake", "fate",
  "gale", "game", "gate", "gave", "gaze",
  "hare", "hale", "hate", "have", "haze",
  "lame", "lane", "late", "lave", "laze",
  "mane", "made", "mate", "maze", "make",
  "name", "nave", "nape",
  "pale", "pave", "page", "pane", "pare",
  "race", "rave", "rake", "rate", "rage",
  "sale", "same", "sane", "save", "sake", "safe",
  "tale", "tame", "take", "tape", "tare",
  "vale", "vase",
  "wake", "wade", "wage", "wave", "wane", "ware",
  "tile", "time", "tide", "tied", "tier", "ties",
  "bile", "bike", "bite", "bind",
  "dine", "dire", "dive", "dike",
  "fine", "file", "fire", "five",
  "hire", "hide", "hike", "hive", "hike",
  "kite", "kind", "kill",
  "life", "like", "lime", "line", "lire", "live",
  "mine", "mike", "mile", "mime", "mind", "mint", "miss",
  "nine", "nice", "mice",
  "pine", "pike", "pile", "pipe", "pint",
  "rise", "ride", "rile", "rime", "rice",
  "side", "sire", "site", "sine",
  "vine", "vile", "vice",
  "wide", "wife", "wine", "wise", "will",
  "bone", "bore", "bole", "bolt",
  "code", "come", "cone", "cope", "core", "corn",
  "dome", "done", "dote", "dove", "dole",
  "fore", "form", "fort", "fold", "folk",
  "gore", "gory", "gone", "gold", "golf",
  "hole", "home", "hope", "hose", "horn", "hold", "host",
  "mode", "more", "mole", "mope", "molt",
  "note", "nose", "norm", "noel",
  "pore", "pose", "pole", "port",
  "role", "rope", "rose", "rote", "rode",
  "sole", "some", "sore", "sort", "sold", "song",
  "tore", "tome", "tote", "told", "toll", "tons",
  "vote", "vole", "volt",
  "wore", "woke", "wove", "wolf", "word", "work", "worm",
  "zone", "zeal",
]);

// Letters weighted for interesting gameplay
const LETTER_POOL = "AAABBBCCDDDEEEEFFFGGHHIIIJJKLLLLMMMNNNOOOOPPQRRRSSSSTTTTTUUUVVWWXYYZZ";

export function makeGrid(rng: () => number): string[] {
  const grid: string[] = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    grid.push(LETTER_POOL[Math.floor(rng() * LETTER_POOL.length)] ?? "A");
  }
  return grid;
}

export function scoreWord(word: string): number {
  const len = word.length;
  if (len < 3) return 0;
  if (len === 3) return 1;
  if (len === 4) return 2;
  if (len === 5) return 4;
  if (len === 6) return 6;
  if (len === 7) return 10;
  return 14;
}

export function isValidWord(word: string, grid: string[], foundWords: readonly string[]): boolean {
  const w = word.toUpperCase();
  if (word.length < 3) return false;
  if (foundWords.includes(word.toLowerCase())) return false;
  if (!VALID_WORDS.has(word.toLowerCase())) return false;
  // Check if all letters exist in grid (simplified: just count characters)
  const gridCopy = [...grid];
  for (const ch of w) {
    const idx = gridCopy.indexOf(ch);
    if (idx === -1) return false;
    gridCopy[idx] = "";
  }
  return true;
}

export function initialState(seed: number): BoggleProState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const grid = makeGrid(rng2);
  return {
    rngSeed: nextSeed,
    grid,
    foundWords: [],
    score: 0,
    turns: 0,
    phase: "play",
    lastWord: "",
    lastValid: false,
    log: [],
  };
}

export function reducer(state: BoggleProState, action: BoggleProAction): BoggleProState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "submitWord": {
      const word = action.word.toLowerCase().trim();
      const valid = isValidWord(word, state.grid, state.foundWords);
      const pts = valid ? scoreWord(word) : 0;
      const newTurns = state.turns + 1;
      const done = newTurns >= MAX_TURNS;
      return {
        ...state,
        foundWords: valid ? [...state.foundWords, word] : state.foundWords,
        score: state.score + pts,
        turns: newTurns,
        lastWord: word,
        lastValid: valid,
        phase: done ? "done" : "play",
        log: [...state.log, valid ? `+${pts} for "${word}"` : `"${word}" not valid`],
      };
    }

    case "pass": {
      const newTurns = state.turns + 1;
      const done = newTurns >= MAX_TURNS;
      return {
        ...state,
        turns: newTurns,
        lastWord: "",
        lastValid: false,
        phase: done ? "done" : "play",
        log: [...state.log, "Passed turn."],
      };
    }

    case "endGame":
      return { ...state, phase: "done" };
  }
}

export function isTerminal(state: BoggleProState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, state.score * 2)) };
}
