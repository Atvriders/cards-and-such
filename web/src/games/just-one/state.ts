import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Word list for target words (using a curated set of noun/adjective targets)
const TARGET_WORDS = [
  "APPLE","OCEAN","CASTLE","DRAGON","BRIDGE","MUSIC","FLOWER","STORM","LIGHT","SHADOW",
  "FOREST","RIVER","MOUNTAIN","DIAMOND","MIRROR","CROWN","THUNDER","SILVER","CRYSTAL","GARDEN",
  "FALCON","EAGLE","ROCKET","PUZZLE","WIZARD","MARBLE","JUNGLE","DESERT","VOLCANO","PHANTOM",
  "ANCHOR","PLANET","COMPASS","LANTERN","TROPHY","BALLOON","CANNON","PYRAMID","COMPASS","LEGEND",
  "TIGER","SWORD","SHIELD","TOWER","CLOCK","FLAME","GHOST","HONEY","ISLAND","KNIGHT",
  "LEMON","MOON","NIGHT","OLIVE","PEARL","QUEEN","RIDGE","SNAKE","TRAIN","UNION",
  "VENUS","WHEAT","XENON","YACHT","ZEBRA","ARROW","BRUSH","CEDAR","DEPTH","EMBER",
  "FROST","GRAPE","HEART","IVORY","JEWEL","KNIFE","LATCH","MAPLE","NERVE","ORBIT",
];

// Clue words bots might give for each target (related/synonym sets)
const BOT_CLUES: Record<string, string[][]> = {
  APPLE: [["FRUIT","RED","CIDER"],["ORCHARD","TREE","PIE"],["NEWTON","CORE","GREEN"]],
  OCEAN: [["SEA","WATER","WAVE"],["BLUE","DEEP","FISH"],["TIDE","MARINE","VAST"]],
  CASTLE: [["KING","TOWER","WALL"],["FORTRESS","STONE","MOAT"],["KNIGHT","CHESS","ROYAL"]],
  DRAGON: [["FIRE","WING","SCALE"],["MYTH","BEAST","FLIGHT"],["BREATH","LEGEND","SERPENT"]],
  BRIDGE: [["CROSS","RIVER","SPAN"],["ARCH","CONNECT","ROAD"],["CABLE","WATER","STRUCTURE"]],
  MUSIC: [["SONG","NOTE","BEAT"],["RHYTHM","MELODY","SOUND"],["PLAY","BAND","TUNE"]],
  FLOWER: [["ROSE","PETAL","BLOOM"],["GARDEN","COLOR","SMELL"],["SPRING","BEE","PLANT"]],
  STORM: [["RAIN","WIND","THUNDER"],["CLOUD","DARK","LIGHTNING"],["FIERCE","WEATHER","SURGE"]],
  LIGHT: [["SUN","LAMP","GLOW"],["BRIGHT","RAY","BEAM"],["SHINE","TORCH","CANDLE"]],
  SHADOW: [["DARK","SHADE","FOLLOW"],["SILHOUETTE","LURK","ECLIPSE"],["COPY","NIGHT","BEHIND"]],
  FOREST: [["TREE","WOOD","DENSE"],["GREEN","WILD","DEEP"],["PINE","LEAF","JUNGLE"]],
  RIVER: [["WATER","FLOW","FISH"],["STREAM","BANK","CURRENT"],["BRIDGE","SOURCE","DELTA"]],
  MOUNTAIN: [["PEAK","CLIMB","SNOW"],["HIGH","ROCKY","HIKE"],["SUMMIT","RANGE","ALPINE"]],
  DIAMOND: [["GEM","RING","SHINE"],["HARD","CARBON","SPARKLE"],["JEWEL","PRECIOUS","GLITTER"]],
  MIRROR: [["REFLECT","GLASS","FACE"],["COPY","IMAGE","SURFACE"],["SHINE","CLEAR","REVERSE"]],
  CROWN: [["KING","QUEEN","GOLD"],["ROYAL","HEAD","JEWEL"],["TOP","WIN","PRIZE"]],
  THUNDER: [["STORM","BOOM","LOUD"],["LIGHTNING","CLOUD","RUMBLE"],["SKY","CRASH","ECHO"]],
  SILVER: [["METAL","SHINY","MOON"],["COIN","MIRROR","GRAY"],["BULLET","PEWTER","BRIGHT"]],
  CRYSTAL: [["CLEAR","GLASS","SHINE"],["ICE","PURE","PRISM"],["QUARTZ","GEM","LIGHT"]],
  GARDEN: [["FLOWER","PLANT","GREEN"],["GROW","SOIL","YARD"],["HEDGE","WATER","NATURE"]],
};

const DEFAULT_CLUES = [["THING","OBJECT","WORD"],["MYSTERY","UNKNOWN","GUESS"],["HIDDEN","SECRET","CLUE"]];

function getBotClues(word: string, rng: () => number): string[] {
  const sets = BOT_CLUES[word] ?? DEFAULT_CLUES;
  // Each bot picks from a different set
  return [0, 1, 2].map(i => {
    const set = sets[i % sets.length]!;
    return set[Math.floor(rng() * set.length)]!;
  });
}

export interface JustOneState {
  targetWord: string;
  rawClues: string[]; // clues from bots (3)
  visibleClues: string[]; // non-canceled clues (shown to player)
  canceledIndices: number[]; // which bots' clues canceled
  guess: string;
  submitted: boolean;
  won: boolean;
  score: number;
  round: number;
  totalRounds: number;
  totalScore: number;
  words: string[];
  wordIndex: number;
}

export type JustOneAction =
  | { type: "typeGuess"; text: string }
  | { type: "submitGuess" }
  | { type: "nextRound" };

function pickTargetAndClues(words: string[], wordIndex: number, rng: () => number) {
  const targetWord = words[wordIndex]!;
  const rawClues = getBotClues(targetWord, rng);

  // Cancel duplicates (case-insensitive)
  const lower = rawClues.map(c => c.toLowerCase());
  const canceledIndices: number[] = [];
  for (let i = 0; i < rawClues.length; i++) {
    for (let j = i + 1; j < rawClues.length; j++) {
      if (lower[i] === lower[j]) {
        if (!canceledIndices.includes(i)) canceledIndices.push(i);
        if (!canceledIndices.includes(j)) canceledIndices.push(j);
      }
    }
  }
  const visibleClues = rawClues.filter((_, i) => !canceledIndices.includes(i));

  return { targetWord, rawClues, visibleClues, canceledIndices };
}

export function initialState(seed: number): JustOneState {
  const rng = mulberry32(seed);
  // Shuffle target words
  const words = [...TARGET_WORDS].sort(() => rng() - 0.5);
  const totalRounds = 5;
  const wordIndex = 0;
  const { targetWord, rawClues, visibleClues, canceledIndices } = pickTargetAndClues(words, wordIndex, rng);

  return {
    targetWord,
    rawClues,
    visibleClues,
    canceledIndices,
    guess: "",
    submitted: false,
    won: false,
    score: 0,
    round: 1,
    totalRounds,
    totalScore: 0,
    words,
    wordIndex,
  };
}

function nextRoundState(state: JustOneState): JustOneState {
  const rng = mulberry32(state.wordIndex * 13 + state.totalScore + 7);
  const wordIndex = state.wordIndex + 1;
  if (wordIndex >= state.words.length) {
    return { ...state, submitted: true, won: true };
  }
  const { targetWord, rawClues, visibleClues, canceledIndices } = pickTargetAndClues(state.words, wordIndex, rng);
  return {
    ...state,
    targetWord,
    rawClues,
    visibleClues,
    canceledIndices,
    guess: "",
    submitted: false,
    won: false,
    score: 0,
    round: state.round + 1,
    wordIndex,
  };
}

export function reducer(state: JustOneState, action: JustOneAction): JustOneState {
  switch (action.type) {
    case "typeGuess": {
      if (state.submitted) return state;
      return { ...state, guess: action.text.toUpperCase().replace(/[^A-Z]/g, "") };
    }
    case "submitGuess": {
      if (state.submitted || state.guess.trim() === "") return state;
      const won = state.guess.toUpperCase() === state.targetWord.toUpperCase();
      const score = won ? 100 : 0;
      const totalScore = state.totalScore + score;
      const isLastRound = state.round >= state.totalRounds;
      return {
        ...state,
        submitted: true,
        won,
        score,
        totalScore,
        // If last round, stay submitted for terminal check
      };
    }
    case "nextRound": {
      if (!state.submitted) return state;
      if (state.round >= state.totalRounds) return state;
      return nextRoundState(state);
    }
    default:
      return state;
  }
}

export function isTerminal(state: JustOneState): { score: number } | null {
  if (state.submitted && state.round >= state.totalRounds) {
    return { score: state.totalScore };
  }
  return null;
}
