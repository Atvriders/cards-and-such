import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type TileType = "agent" | "neutral" | "opponent" | "assassin";

export interface Tile {
  word: string;
  type: TileType;
  revealed: boolean;
}

export interface Clue {
  word: string;
  count: number;
}

export interface CodenamesState {
  tiles: Tile[];
  clue: Clue | null;
  guessesLeft: number;
  agentsLeft: number;
  agentsTotal: number;
  turn: "clue" | "guess";
  won: boolean;
  lost: boolean;
  lastReveal: TileType | null;
  log: string[];
}

export type CodenamesAction =
  | { type: "guess"; tileIndex: number }
  | { type: "endGuessing" };

const WORDS = [
  "AGENT","ANCHOR","APPLE","ARCTIC","ARROW","BALL","BANK","BARK","BASE","BELL",
  "BLADE","BLAST","BLOCK","BOARD","BOLT","BOMB","BOOK","BOOT","BORDER","BOXER",
  "BRIDGE","BUCK","BURN","CABLE","CAMP","CAP","CAR","CARD","CASTLE","CELL",
  "CHAIN","CHANGE","CHARGE","CHART","CHIEF","CHIP","CLIP","CLOCK","CLUB","CODE",
  "COIN","COLD","COLUMN","COMPASS","CONTEST","CONTROL","CORE","CORNER","COVER","CRACK",
  "CRANE","CRASH","CROSS","CUP","CURVE","DARK","DATE","DECK","DEEP","DESK",
  "DIAL","DISC","DOCK","DOME","DOOR","DRAFT","DRAGON","DRILL","DRIVE","DROP",
  "DRUM","DUCK","DUST","EAGLE","EARTH","EDGE","ENGINE","FACE","FAIL","FALL",
  "FAULT","FIELD","FILE","FIN","FIRE","FISH","FIST","FIX","FLAG","FLAME",
  "FLASH","FLAT","FLIGHT","FLOOD","FLOOR","FLOW","FLY","FOAM","FOLD","FORCE",
];

// Associations map for spymaster clues (simplified)
const ASSOCIATIONS: Record<string, string[]> = {
  WATER: ["ANCHOR","FISH","DOCK","FOAM","FLOOD","BRIDGE","DEEP"],
  SHARP: ["BLADE","ARROW","DRILL","EDGE","CHIP","CLIP"],
  FIRE: ["FLAME","BLAST","BURN","BOMB","DRILL","HEAT"],
  HIGH: ["EAGLE","FLIGHT","FLY","FALL","DOME","CRASH"],
  ROUND: ["BALL","DISC","RING","DRUM","COIN","CLOCK"],
  WRITE: ["BOOK","CARD","CODE","FILE","DESK","DATE"],
  POWER: ["CHARGE","CONTROL","FORCE","ENGINE","BOLT","CABLE"],
  COLD: ["DARK","DEEP","EDGE","FROST","ICE"],
  GAME: ["CARD","BOARD","CHIP","CODE","DECK","CLUB"],
  BUILD: ["BLOCK","CRANE","COLUMN","DOOR","FLOOR","FRAME"],
};

function chooseClue(agentWords: string[], rng: () => number): Clue {
  // Find an association that covers at least 1 agent word
  const entries = Object.entries(ASSOCIATIONS);
  for (let attempt = 0; attempt < 20; attempt++) {
    const [clueWord, related] = entries[Math.floor(rng() * entries.length)]!;
    const matching = agentWords.filter(w => related.includes(w));
    if (matching.length > 0) {
      return { word: clueWord, count: matching.length };
    }
  }
  // Fallback: pick random association clue
  const [clueWord] = entries[Math.floor(rng() * entries.length)]!;
  return { word: clueWord!, count: 1 };
}

export function initialState(seed: number): CodenamesState {
  const rng = mulberry32(seed);

  // Pick 25 unique words
  const shuffled = [...WORDS].sort(() => rng() - 0.5);
  const chosen = shuffled.slice(0, 25);

  // Assign types: 9 agent, 7 opponent, 7 neutral, 1 assassin (for 25 tiles, team goes first)
  const types: TileType[] = [
    ...Array(9).fill("agent"),
    ...Array(7).fill("opponent"),
    ...Array(7).fill("neutral"),
    "assassin",
  ] as TileType[];

  // Shuffle types
  types.sort(() => rng() - 0.5);

  const tiles: Tile[] = chosen.map((word, i) => ({
    word,
    type: types[i]!,
    revealed: false,
  }));

  const agentsTotal = 9;
  const agentWords = tiles.filter(t => t.type === "agent").map(t => t.word);
  const clue = chooseClue(agentWords, rng);

  return {
    tiles,
    clue,
    guessesLeft: clue.count + 1, // bonus guess
    agentsLeft: agentsTotal,
    agentsTotal,
    turn: "guess",
    won: false,
    lost: false,
    lastReveal: null,
    log: [`Spymaster clue: "${clue.word}" — ${clue.count}`],
  };
}

function nextClue(state: CodenamesState, rng: () => number): CodenamesState {
  const agentWords = state.tiles
    .filter(t => t.type === "agent" && !t.revealed)
    .map(t => t.word);
  const clue = chooseClue(agentWords, rng);
  return {
    ...state,
    clue,
    guessesLeft: clue.count + 1,
    turn: "guess",
    log: [...state.log, `New clue: "${clue.word}" — ${clue.count}`],
  };
}

export function reducer(state: CodenamesState, action: CodenamesAction): CodenamesState {
  if (state.won || state.lost) return state;

  if (action.type === "endGuessing") {
    const rng = mulberry32(state.agentsLeft * 7 + state.log.length + 13);
    return nextClue({ ...state, turn: "clue" }, rng);
  }

  if (action.type === "guess") {
    const { tileIndex } = action;
    const tile = state.tiles[tileIndex];
    if (!tile || tile.revealed) return state;

    const tiles = state.tiles.map((t, i) => i === tileIndex ? { ...t, revealed: true } : t);
    const log = [...state.log, `Guessed: ${tile.word} → ${tile.type}`];
    let agentsLeft = state.agentsLeft;
    let guessesLeft = state.guessesLeft;
    let won: boolean = state.won;
    let lost: boolean = state.lost;

    if (tile.type === "assassin") {
      return { ...state, tiles, lastReveal: "assassin", won: false, lost: true, log };
    }
    if (tile.type === "opponent") {
      // End turn, give point to opponent
      const rng = mulberry32(agentsLeft * 11 + log.length);
      return nextClue({ ...state, tiles, lastReveal: "opponent", log }, rng);
    }
    if (tile.type === "neutral") {
      const rng = mulberry32(agentsLeft * 5 + log.length + 3);
      return nextClue({ ...state, tiles, lastReveal: "neutral", log }, rng);
    }
    // Agent
    agentsLeft--;
    guessesLeft--;
    won = agentsLeft === 0;
    if (won || guessesLeft <= 0) {
      const rng = mulberry32(agentsLeft * 9 + log.length + 5);
      const next = nextClue({ ...state, tiles, agentsLeft, lastReveal: "agent", won, log }, rng);
      return { ...next, won };
    }
    return { ...state, tiles, agentsLeft, guessesLeft, lastReveal: "agent", log };
  }

  return state;
}

export function isTerminal(state: CodenamesState): { score: number } | null {
  if (state.won) return { score: 100 };
  if (state.lost) return { score: 0 };
  return null;
}
