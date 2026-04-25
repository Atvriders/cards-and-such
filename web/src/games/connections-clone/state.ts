import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ConnectionGroup {
  label: string;
  words: readonly string[];
  color: "yellow" | "green" | "blue" | "purple";
}

export interface ConnectionsState {
  groups: readonly ConnectionGroup[];
  allWords: string[];       // shuffled
  selected: string[];
  solvedColors: string[];   // colors solved so far
  attempts: number;
  maxAttempts: number;
  message: string;
  phase: "playing" | "won" | "lost";
}

export type ConnectionsAction =
  | { type: "toggle"; word: string }
  | { type: "submit" }
  | { type: "shuffle" };

const PUZZLES: ConnectionGroup[][] = [
  [
    { label: "Types of bread", words: ["BAGEL", "BAGUETTE", "BRIOCHE", "CIABATTA"], color: "yellow" },
    { label: "Musical genres", words: ["BLUES", "JAZZ", "REGGAE", "SOUL"], color: "green" },
    { label: "Planet moons", words: ["EUROPA", "GANYMEDE", "IO", "TITAN"], color: "blue" },
    { label: "Card games", words: ["BRIDGE", "CANASTA", "POKER", "RUMMY"], color: "purple" },
  ],
  [
    { label: "Shades of red", words: ["CRIMSON", "MAROON", "RUBY", "SCARLET"], color: "yellow" },
    { label: "Big cats", words: ["CHEETAH", "JAGUAR", "LEOPARD", "PUMA"], color: "green" },
    { label: "Pasta shapes", words: ["FUSILLI", "LINGUINE", "PENNE", "RIGATONI"], color: "blue" },
    { label: "Famous islands", words: ["BALI", "CORSICA", "CRETE", "MALTA"], color: "purple" },
  ],
  [
    { label: "Tree types", words: ["BIRCH", "ELM", "MAPLE", "OAK"], color: "yellow" },
    { label: "Gem stones", words: ["GARNET", "ONYX", "RUBY", "TOPAZ"], color: "green" },
    { label: "Dance styles", words: ["FOXTROT", "MAMBO", "SAMBA", "TANGO"], color: "blue" },
    { label: "Mountain ranges", words: ["ALPS", "ANDES", "ATLAS", "URALS"], color: "purple" },
  ],
  [
    { label: "Hot drinks", words: ["CHAI", "COCOA", "COFFEE", "TEA"], color: "yellow" },
    { label: "Reptiles", words: ["GECKO", "IGUANA", "SKINK", "TUATARA"], color: "green" },
    { label: "Board games", words: ["CHESS", "GO", "OTHELLO", "SCRABBLE"], color: "blue" },
    { label: "Greek letters", words: ["ALPHA", "DELTA", "GAMMA", "OMEGA"], color: "purple" },
  ],
  [
    { label: "Knitting terms", words: ["CABLE", "KNIT", "PURL", "YARN"], color: "yellow" },
    { label: "Camera parts", words: ["APERTURE", "LENS", "SHUTTER", "ZOOM"], color: "green" },
    { label: "Fairy tale characters", words: ["CINDERELLA", "RAPUNZEL", "THUMBELINA", "AURORA"], color: "blue" },
    { label: "Cheese types", words: ["BRIE", "CHEDDAR", "GOUDA", "MOZZARELLA"], color: "purple" },
  ],
  [
    { label: "Wind instruments", words: ["FLUTE", "OBOE", "TUBA", "CLARINET"], color: "yellow" },
    { label: "Cereals", words: ["BARLEY", "MILLET", "OATS", "RYE"], color: "green" },
    { label: "Martial arts", words: ["JUDO", "KARATE", "KENDO", "TAEKWONDO"], color: "blue" },
    { label: "Weather phenomena", words: ["HAIL", "SLEET", "SMOG", "TORNADO"], color: "purple" },
  ],
  [
    { label: "Cooking methods", words: ["BASTE", "BRAISE", "POACH", "SEAR"], color: "yellow" },
    { label: "Spices", words: ["CARDAMOM", "CUMIN", "PAPRIKA", "TURMERIC"], color: "green" },
    { label: "Space agencies", words: ["ESA", "ISRO", "JAXA", "NASA"], color: "blue" },
    { label: "Architectural styles", words: ["BAROQUE", "GOTHIC", "MODERNIST", "ROMANESQUE"], color: "purple" },
  ],
  [
    { label: "Hockey terms", words: ["ASSIST", "ICING", "OFFSIDE", "PUCK"], color: "yellow" },
    { label: "Philosophers", words: ["ARISTOTLE", "HUME", "KANT", "PLATO"], color: "green" },
    { label: "Coding languages", words: ["ELIXIR", "JULIA", "KOTLIN", "RUST"], color: "blue" },
    { label: "Ocean zones", words: ["ABYSSAL", "BATHYAL", "HADAL", "PHOTIC"], color: "purple" },
  ],
  [
    { label: "Types of poetry", words: ["ELEGY", "HAIKU", "LIMERICK", "SONNET"], color: "yellow" },
    { label: "Fabrics", words: ["CASHMERE", "DENIM", "MUSLIN", "VELVET"], color: "green" },
    { label: "Volcanic features", words: ["CALDERA", "FUMAROLE", "LAHAR", "MAGMA"], color: "blue" },
    { label: "Navigation tools", words: ["COMPASS", "GYROSCOPE", "SEXTANT", "SONAR"], color: "purple" },
  ],
  [
    { label: "Ice cream flavors", words: ["CARAMEL", "MINT", "PISTACHIO", "VANILLA"], color: "yellow" },
    { label: "Insects", words: ["CICADA", "EARWIG", "MANTIS", "WEEVIL"], color: "green" },
    { label: "Ancient wonders", words: ["COLOSSUS", "LIGHTHOUSE", "MAUSOLEUM", "SPHINX"], color: "blue" },
    { label: "Writing tools", words: ["CHISEL", "QUILL", "REED", "STYLUS"], color: "purple" },
  ],
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number): ConnectionsState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  const allWords = shuffle(puzzle.flatMap(g => [...g.words]), rng);
  return {
    groups: puzzle,
    allWords,
    selected: [],
    solvedColors: [],
    attempts: 0,
    maxAttempts: 4,
    message: "",
    phase: "playing",
  };
}

export function reducer(state: ConnectionsState, action: ConnectionsAction): ConnectionsState {
  if (state.phase !== "playing") return state;

  switch (action.type) {
    case "toggle": {
      const { word } = action;
      const sel = state.selected.includes(word)
        ? state.selected.filter(w => w !== word)
        : state.selected.length < 4
          ? [...state.selected, word]
          : state.selected;
      return { ...state, selected: sel, message: "" };
    }
    case "submit": {
      if (state.selected.length !== 4) return { ...state, message: "Select exactly 4 words." };
      const selSet = new Set(state.selected);
      const matched = state.groups.find(g => g.words.every(w => selSet.has(w)));
      if (matched) {
        const newSolved = [...state.solvedColors, matched.color];
        const allSolved = newSolved.length === state.groups.length;
        const newWords = state.allWords.filter(w => !matched.words.includes(w));
        return {
          ...state,
          allWords: newWords,
          selected: [],
          solvedColors: newSolved,
          message: allSolved ? "Brilliant!" : `Correct! "${matched.label}"`,
          phase: allSolved ? "won" : "playing",
          attempts: state.attempts + 1,
        };
      } else {
        // Check if one away
        const oneAway = state.groups.some(g => {
          const overlap = g.words.filter(w => selSet.has(w)).length;
          return overlap === 3;
        });
        const newAttempts = state.attempts + 1;
        const lost = newAttempts >= state.maxAttempts && state.solvedColors.length < state.groups.length;
        return {
          ...state,
          selected: [],
          attempts: newAttempts,
          message: oneAway ? "One away!" : "Wrong — try again.",
          phase: lost ? "lost" : "playing",
        };
      }
    }
    case "shuffle": {
      const rng = mulberry32(Date.now());
      return { ...state, allWords: shuffle(state.allWords, rng), message: "" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: ConnectionsState): { score: number } | null {
  if (state.phase === "won") return { score: Math.max(0, (state.maxAttempts - state.attempts + state.groups.length) * 50) };
  if (state.phase === "lost") return { score: state.solvedColors.length * 50 };
  return null;
}
