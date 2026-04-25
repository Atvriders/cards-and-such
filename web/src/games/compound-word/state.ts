import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CompoundPuzzle {
  clueA: string;  // e.g. "SUN"
  clueB: string;  // e.g. "FLOWER"
  answer: string; // e.g. "SUNFLOWER"
  hintA: string;  // plain-language hint for the first part
  hintB: string;
}

export interface CompoundState {
  puzzles: readonly CompoundPuzzle[];
  current: number;
  input: string;
  solved: boolean[];
  score: number;
  error: string;
  phase: "playing" | "done";
}

export type CompoundAction =
  | { type: "type"; text: string }
  | { type: "submit" }
  | { type: "skip" };

const PUZZLES: CompoundPuzzle[] = [
  { clueA: "SUN", clueB: "FLOWER", answer: "SUNFLOWER", hintA: "our star", hintB: "a plant part" },
  { clueA: "BOOK", clueB: "WORM", answer: "BOOKWORM", hintA: "you read it", hintB: "a small creature" },
  { clueA: "FIRE", clueB: "WORKS", answer: "FIREWORKS", hintA: "combustion", hintB: "labors" },
  { clueA: "RAIN", clueB: "BOW", answer: "RAINBOW", hintA: "precipitation", hintB: "archery tool" },
  { clueA: "BUTTER", clueB: "FLY", answer: "BUTTERFLY", hintA: "dairy spread", hintB: "to soar" },
  { clueA: "DOOR", clueB: "BELL", answer: "DOORBELL", hintA: "entry point", hintB: "it rings" },
  { clueA: "SAND", clueB: "CASTLE", answer: "SANDCASTLE", hintA: "beach material", hintB: "a fortress" },
  { clueA: "BACK", clueB: "PACK", answer: "BACKPACK", hintA: "opposite of front", hintB: "a bundle" },
  { clueA: "MOON", clueB: "LIGHT", answer: "MOONLIGHT", hintA: "earth's satellite", hintB: "illumination" },
  { clueA: "STAR", clueB: "FISH", answer: "STARFISH", hintA: "celestial body", hintB: "aquatic creature" },
  { clueA: "EYE", clueB: "LASH", answer: "EYELASH", hintA: "organ of sight", hintB: "a whip stroke" },
  { clueA: "HAIR", clueB: "CUT", answer: "HAIRCUT", hintA: "grows on head", hintB: "a snip" },
  { clueA: "TOOTH", clueB: "PASTE", answer: "TOOTHPASTE", hintA: "biting organ", hintB: "a glue" },
  { clueA: "EAR", clueB: "RING", answer: "EARRING", hintA: "hearing organ", hintB: "a circle" },
  { clueA: "SNOW", clueB: "BALL", answer: "SNOWBALL", hintA: "frozen precipitation", hintB: "a sphere" },
  { clueA: "BASE", clueB: "BALL", answer: "BASEBALL", hintA: "the bottom", hintB: "a sphere" },
  { clueA: "FOOT", clueB: "PRINT", answer: "FOOTPRINT", hintA: "below the ankle", hintB: "a mark" },
  { clueA: "HAND", clueB: "SHAKE", answer: "HANDSHAKE", hintA: "at end of arm", hintB: "a tremble" },
  { clueA: "OVER", clueB: "COAT", answer: "OVERCOAT", hintA: "above or beyond", hintB: "a jacket" },
  { clueA: "UP", clueB: "STAIRS", answer: "UPSTAIRS", hintA: "higher direction", hintB: "steps" },
  { clueA: "DOWN", clueB: "STAIRS", answer: "DOWNSTAIRS", hintA: "lower direction", hintB: "steps" },
  { clueA: "SEA", clueB: "SHELL", answer: "SEASHELL", hintA: "ocean", hintB: "a hard casing" },
  { clueA: "WATER", clueB: "FALL", answer: "WATERFALL", hintA: "H2O", hintB: "to descend" },
  { clueA: "THUNDER", clueB: "STORM", answer: "THUNDERSTORM", hintA: "loud sky sound", hintB: "bad weather" },
  { clueA: "BIRTH", clueB: "DAY", answer: "BIRTHDAY", hintA: "to be born", hintB: "24 hours" },
  { clueA: "HEAD", clueB: "BAND", answer: "HEADBAND", hintA: "top of body", hintB: "a strip" },
  { clueA: "LIGHT", clueB: "HOUSE", answer: "LIGHTHOUSE", hintA: "illumination", hintB: "a dwelling" },
  { clueA: "BLACK", clueB: "BIRD", answer: "BLACKBIRD", hintA: "darkest color", hintB: "a feathered friend" },
  { clueA: "BLUE", clueB: "BELL", answer: "BLUEBELL", hintA: "sky color", hintB: "it rings" },
  { clueA: "GREEN", clueB: "HOUSE", answer: "GREENHOUSE", hintA: "nature's color", hintB: "a dwelling" },
  { clueA: "KEY", clueB: "BOARD", answer: "KEYBOARD", hintA: "opens locks", hintB: "a plank" },
  { clueA: "NOTE", clueB: "BOOK", answer: "NOTEBOOK", hintA: "a memo", hintB: "you read it" },
  { clueA: "PAN", clueB: "CAKE", answer: "PANCAKE", hintA: "a cooking vessel", hintB: "a baked treat" },
  { clueA: "CHEESE", clueB: "CAKE", answer: "CHEESECAKE", hintA: "dairy product", hintB: "a baked treat" },
  { clueA: "WIND", clueB: "MILL", answer: "WINDMILL", hintA: "moving air", hintB: "a grinder" },
  { clueA: "WORD", clueB: "PLAY", answer: "WORDPLAY", hintA: "language unit", hintB: "fun activity" },
  { clueA: "TIME", clueB: "TABLE", answer: "TIMETABLE", hintA: "measured hours", hintB: "furniture" },
  { clueA: "OVER", clueB: "TIME", answer: "OVERTIME", hintA: "above/beyond", hintB: "measured hours" },
  { clueA: "UNDER", clueB: "WATER", answer: "UNDERWATER", hintA: "below", hintB: "H2O" },
  { clueA: "OUT", clueB: "SIDE", answer: "OUTSIDE", hintA: "exterior", hintB: "flank" },
  { clueA: "IN", clueB: "SIDE", answer: "INSIDE", hintA: "interior", hintB: "flank" },
  { clueA: "PLAY", clueB: "GROUND", answer: "PLAYGROUND", hintA: "fun activity", hintB: "earth surface" },
  { clueA: "BACK", clueB: "YARD", answer: "BACKYARD", hintA: "behind", hintB: "unit of measure / garden" },
  { clueA: "COURT", clueB: "YARD", answer: "COURTYARD", hintA: "legal arena", hintB: "unit of measure / garden" },
  { clueA: "CAR", clueB: "PARK", answer: "CARPARK", hintA: "a vehicle", hintB: "a green space" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number): CompoundState {
  const rng = mulberry32(seed);
  const shuffled = shuffle([...PUZZLES], rng).slice(0, 10);
  return {
    puzzles: shuffled,
    current: 0,
    input: "",
    solved: new Array(shuffled.length).fill(false),
    score: 0,
    error: "",
    phase: "playing",
  };
}

export function reducer(state: CompoundState, action: CompoundAction): CompoundState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      return { ...state, input: action.text.toUpperCase().replace(/[^A-Z]/g, ""), error: "" };
    }
    case "submit": {
      const puzzle = state.puzzles[state.current]!;
      if (state.input === puzzle.answer) {
        const newSolved = [...state.solved];
        newSolved[state.current] = true;
        const newScore = state.score + 100;
        const next = state.current + 1;
        const done = next >= state.puzzles.length;
        return { ...state, solved: newSolved, score: newScore, input: "", error: "", current: next, phase: done ? "done" : "playing" };
      }
      return { ...state, error: `Not quite — try again! (${state.input.length} letters entered)`, input: "" };
    }
    case "skip": {
      const next = state.current + 1;
      const done = next >= state.puzzles.length;
      return { ...state, current: next, input: "", error: "", phase: done ? "done" : "playing" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: CompoundState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
