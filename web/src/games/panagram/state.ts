import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PanagramState {
  centerLetter: string;
  outerLetters: string[];  // 6 letters
  allLetters: string[];    // 7 letters total
  found: string[];
  current: string;
  score: number;
  message: string;
  phase: "playing" | "done";
  wordList: string[];      // valid words for this puzzle
  pangrams: string[];      // words using all 7 letters
}

export type PanagramAction =
  | { type: "letter"; char: string }
  | { type: "backspace" }
  | { type: "submit" }
  | { type: "shuffle" }
  | { type: "endGame" };

// Curated puzzles: centerLetter, outerLetters, wordList, pangrams
const PUZZLES: Array<{
  center: string;
  outer: string[];
  words: string[];
  pangrams: string[];
}> = [
  {
    center: "T",
    outer: ["R", "A", "P", "I", "C", "S"],
    words: ["TRAP", "TRIP", "TARP", "STIR", "SPIT", "SPAR", "STAR", "SCAT", "CART", "CARP",
            "RAPT", "PART", "PACT", "PAST", "RATS", "TAPS", "TIPS", "CAPS", "CATS", "STAP",
            "TAPIR", "TAPIRS", "CRAPS", "TRAPS", "TRIPS", "PARTS", "TARS", "ARTS", "PAIRS",
            "SPRAT", "SPRATS", "SCRIPT", "SCRIP"],
    pangrams: ["TRICAPS", "SCRIPTS"],
  },
  {
    center: "E",
    outer: ["R", "A", "D", "N", "G", "L"],
    words: ["EARN", "LEARN", "LANE", "LEAN", "DEAR", "DARE", "GALE", "NERD", "REND", "LEND",
            "REGAL", "LARGE", "ANGEL", "ANGER", "RANGE", "GRADE", "CRANE", "GLAND", "BLAND",
            "GRAND", "DANGLE", "GLARE", "LAGER", "LEGER", "GENDER", "LANDER", "RENDER",
            "GLARED", "ANGLED", "DANGER", "LEANED", "EARNED", "LEGEND", "GARDEN"],
    pangrams: ["GARLAND", "GARLANDS", "LANDERED"],
  },
  {
    center: "N",
    outer: ["O", "I", "T", "A", "R", "S"],
    words: ["NAOS", "NOTA", "IRON", "RANT", "RAIN", "ROAN", "TORN", "TARN", "SNOT", "SNOB",
            "ANTI", "ANTS", "OARS", "RATS", "ARTS", "NORI", "TORN", "IONS", "NOIR",
            "ARSON", "SNORT", "ROSIN", "INTRA", "TRAIN", "RATIO", "RATION", "NATION",
            "ONRUSH", "NITRO", "TRIOS", "RAINS", "RANTS"],
    pangrams: ["RATIONS", "NOTARIS"],
  },
  {
    center: "L",
    outer: ["O", "W", "F", "E", "R", "S"],
    words: ["LORE", "SOLE", "ROLE", "SLOW", "FLOW", "FOWL", "WOLF", "WORE", "FORE", "FOES",
            "ROES", "WOES", "OWLS", "ROWS", "ORES", "FLOE", "FLOES", "FLOOR", "FLOORS",
            "LOWER", "LOWER", "LOWES", "FLOWERS", "FELLOWS", "SORROW", "FOLLOWER"],
    pangrams: ["FLOWERS", "FOWLERS"],
  },
  {
    center: "A",
    outer: ["C", "H", "R", "M", "N", "E"],
    words: ["EACH", "ARCH", "MARE", "HARM", "HARE", "CHAR", "CAME", "CARE", "NAME",
            "HEAR", "NEAR", "RACE", "MACE", "ACHE", "CRANE", "RANCH", "MARCH", "REACH",
            "CREAM", "ARMEN", "MANCH", "CHARM", "CHARE", "ENARM", "NARC", "NAMER",
            "MARCHE", "RANCHER", "MARCHEN", "ENCHARM"],
    pangrams: ["ENCHARM", "MANCHER"],
  },
  {
    center: "S",
    outer: ["P", "O", "T", "L", "E", "I"],
    words: ["SPOT", "STOP", "TOPS", "POTS", "LOST", "LOTS", "OILS", "TOIL", "SOIL",
            "SOLE", "POLE", "TOLE", "ISLE", "SLOP", "SLIP", "SPIT", "SITE", "TIES",
            "PIES", "LIES", "SPLIT", "PILOT", "SPOIL", "SPILE", "STOLE", "OILIEST",
            "POLITE", "POLITEST", "STIPPLE", "EPISTLE"],
    pangrams: ["APOSTLE", "TOPSAIL"],
  },
  {
    center: "R",
    outer: ["U", "N", "B", "H", "O", "A"],
    words: ["BURN", "HORN", "BORN", "BOAR", "BRAN", "BARN", "HORA", "HOUR",
            "NOUN", "ROAN", "BOON", "RUNO", "HURL", "UNBAR", "HONOR", "URBAN",
            "BOURBON", "HARBOUR", "HONOUR", "HARBOUR"],
    pangrams: ["BOURBON", "HARBOUR"],
  },
  {
    center: "M",
    outer: ["A", "R", "K", "E", "T", "S"],
    words: ["MARK", "MAKE", "TAKE", "RAKE", "MARE", "RATE", "MATE", "MEAT",
            "TEAM", "TRAM", "STEM", "MAST", "MART", "RAMS", "ARMS", "ARTS",
            "MARKET", "MASTER", "STREAM", "REAMS", "TEAMS", "MARKS",
            "MARKETS", "MASTERS", "STREAMS"],
    pangrams: ["MARKETS", "MASTERS"],
  },
  {
    center: "G",
    outer: ["I", "N", "D", "L", "O", "E"],
    words: ["DINE", "DONE", "LION", "LOIN", "OGLE", "LODE", "NODE", "BODE",
            "DING", "LONG", "GONE", "GILD", "GOLD", "LINGO", "OGLED", "OGLING",
            "DONG", "DINGO", "OGLE", "ELIDING", "LORDING", "IDLING", "DOLING"],
    pangrams: ["LONGING", "DINGOLE"],
  },
  {
    center: "P",
    outer: ["R", "O", "U", "D", "H", "A"],
    words: ["POUR", "HOUR", "ROAD", "DOUR", "HARD", "HOARD", "PROUD", "UPROAD",
            "PRAHU", "HADOUR", "OUTPOUR", "UPHOLD", "ODRAPH"],
    pangrams: ["RAPHOUD", "UPHARОД"],
  },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number): PanagramState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  const outer = shuffle([...puzzle.outer], rng);
  return {
    centerLetter: puzzle.center,
    outerLetters: outer,
    allLetters: [puzzle.center, ...outer],
    found: [],
    current: "",
    score: 0,
    message: "",
    phase: "playing",
    wordList: puzzle.words.map(w => w.toUpperCase()),
    pangrams: puzzle.pangrams.map(w => w.toUpperCase()),
  };
}

export function reducer(state: PanagramState, action: PanagramAction): PanagramAction extends { type: "endGame" } ? PanagramState : PanagramState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "letter": {
      const ch = action.char.toUpperCase();
      if (!state.allLetters.includes(ch)) return { ...state, message: "Letter not in puzzle" };
      return { ...state, current: state.current + ch, message: "" };
    }
    case "backspace": {
      return { ...state, current: state.current.slice(0, -1), message: "" };
    }
    case "submit": {
      const word = state.current;
      if (word.length < 4) return { ...state, message: "Too short (min 4 letters)", current: "" };
      if (!word.includes(state.centerLetter)) return { ...state, message: `Must include center letter ${state.centerLetter}`, current: "" };
      if (state.found.includes(word)) return { ...state, message: "Already found!", current: "" };
      if (!state.wordList.includes(word)) return { ...state, message: "Not in word list", current: "" };
      const isPangram = state.allLetters.every(l => word.includes(l));
      const points = isPangram ? word.length * 2 + 7 : word.length === 4 ? 1 : word.length;
      return {
        ...state,
        found: [...state.found, word],
        current: "",
        score: state.score + points,
        message: isPangram ? "PANGRAM! +" + points : "+" + points,
      };
    }
    case "shuffle": {
      const rng = mulberry32(Date.now());
      return { ...state, outerLetters: shuffle([...state.outerLetters], rng) };
    }
    case "endGame": {
      return { ...state, phase: "done" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: PanagramState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
