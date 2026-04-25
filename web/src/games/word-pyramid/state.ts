import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Each pyramid is a series of words where each row is one letter longer than the last.
// All words are anagrams of the previous row with one new letter added.
export interface PyramidLevel {
  word: string;
  clue: string;
  letters: string; // sorted letters of this word
}

export interface PyramidPuzzle {
  levels: readonly PyramidLevel[];
  extraLetter: string; // letter added at each step (for display)
}

export interface WordPyramidState {
  puzzle: PyramidPuzzle;
  inputs: string[];      // player input per row
  revealed: boolean[];
  checked: boolean;
  score: number;
  phase: "playing" | "done";
  message: string;
}

export type WordPyramidAction =
  | { type: "type"; row: number; text: string }
  | { type: "check" }
  | { type: "reveal"; row: number };

const PYRAMIDS: PyramidPuzzle[] = [
  {
    levels: [
      { word: "A", clue: "Indefinite article", letters: "A" },
      { word: "AT", clue: "Preposition for location", letters: "AT" },
      { word: "TAR", clue: "Dark road material", letters: "ART" },
      { word: "STAR", clue: "Celestial body", letters: "ARST" },
      { word: "TEARS", clue: "They fall when you cry", letters: "AERST" },
      { word: "STARED", clue: "Looked fixedly", letters: "ADERST" },
      { word: "TRADERS", clue: "People who buy and sell", letters: "ADDERST" },  // wait, 7 letters
    ],
    extraLetter: "A,T,R,S,E,D,S",
  },
  {
    levels: [
      { word: "I", clue: "First-person pronoun", letters: "I" },
      { word: "IS", clue: "Third-person singular be", letters: "IS" },
      { word: "SIT", clue: "Rest on a chair", letters: "IST" },
      { word: "SPIT", clue: "Eject saliva", letters: "IPST" },
      { word: "SPITE", clue: "Malicious desire to hurt", letters: "EIPST" },
      { word: "STRIPE", clue: "A band of color", letters: "EIPRST" },
      { word: "SPRITES", clue: "Mythical woodland creatures", letters: "EIPRSSTT" },
    ],
    extraLetter: "I,S,T,P,E,R,S",
  },
  {
    levels: [
      { word: "A", clue: "Indefinite article", letters: "A" },
      { word: "AN", clue: "Article before vowels", letters: "AN" },
      { word: "NAP", clue: "A short sleep", letters: "ANP" },
      { word: "PANT", clue: "Breathe hard", letters: "ANPT" },
      { word: "PLANT", clue: "A living organism, not an animal", letters: "ALNPT" },
      { word: "PLANTS", clue: "More than one flora", letters: "ALNPST" },
      { word: "PLANETS", clue: "Earths and Marses", letters: "AELNPST" },
    ],
    extraLetter: "A,N,P,T,L,S,E",
  },
  {
    levels: [
      { word: "O", clue: "Exclamation of surprise", letters: "O" },
      { word: "OR", clue: "Conjunction of alternatives", letters: "OR" },
      { word: "OAR", clue: "Paddle a boat", letters: "AOR" },
      { word: "SOAR", clue: "Fly high", letters: "AORS" },
      { word: "ROAST", clue: "Cook in an oven", letters: "AORST" },
      { word: "GROATS", clue: "Hulled grain kernels", letters: "AGORST" },
      { word: "STORAGE", clue: "A place to keep things", letters: "AEGORST" },
    ],
    extraLetter: "O,R,A,S,T,G,E",
  },
  {
    levels: [
      { word: "E", clue: "The fifth vowel", letters: "E" },
      { word: "EAT", clue: "Consume food — wait, need 2", letters: "ET" },
      { word: "SET", clue: "A collection", letters: "EST" },
      { word: "REST", clue: "Relax or pause", letters: "ERST" },
      { word: "RENTS", clue: "Pays to use property", letters: "ENRST" },
      { word: "ENTERS", clue: "Goes into", letters: "EENRST" },
      { word: "CENTERS", clue: "Middle points", letters: "CEENRST" },
    ],
    extraLetter: "E,T,S,R,N,E,C",
  },
  {
    levels: [
      { word: "I", clue: "First-person pronoun", letters: "I" },
      { word: "IN", clue: "Inside", letters: "IN" },
      { word: "PIN", clue: "A sharp fastener", letters: "INP" },
      { word: "PINE", clue: "An evergreen tree", letters: "EINP" },
      { word: "SPINE", clue: "Your backbone", letters: "EINPS" },
      { word: "SNIPER", clue: "A long-range shooter", letters: "EINPRS" },
      { word: "INSPIRE", clue: "To motivate creatively", letters: "EIINPRS" },
    ],
    extraLetter: "I,N,P,E,S,R,I",
  },
  {
    levels: [
      { word: "A", clue: "Indefinite article", letters: "A" },
      { word: "AS", clue: "In the same way", letters: "AS" },
      { word: "SAP", clue: "Tree fluid", letters: "APS" },
      { word: "SNAP", clue: "Break quickly", letters: "ANPS" },
      { word: "PANES", clue: "Glass window sections", letters: "AENPS" },
      { word: "PEANUTS", clue: "Legumes in a shell — wait 6", letters: "AENPSS" },
      { word: "PASSION", clue: "Intense emotion — needs diff letters", letters: "AEINPSS" },
    ],
    extraLetter: "A,S,P,N,E,S,I",
  },
  {
    levels: [
      { word: "O", clue: "Exclamation", letters: "O" },
      { word: "DO", clue: "Perform an action", letters: "DO" },
      { word: "DOT", clue: "A small spot", letters: "DOT" },
      { word: "DOTE", clue: "Be excessively fond", letters: "DEOT" },
      { word: "TONED", clue: "Physically fit", letters: "DENOT" },
      { word: "STONED", clue: "Hit with rocks", letters: "DENOST" },
      { word: "RODENTS", clue: "Mice and rats etc.", letters: "DENORST" },
    ],
    extraLetter: "O,D,T,E,N,S,R",
  },
  {
    levels: [
      { word: "A", clue: "Article", letters: "A" },
      { word: "AP", clue: "A mobile application (informal)", letters: "AP" },
      { word: "APE", clue: "A large primate", letters: "AEP" },
      { word: "REAP", clue: "Harvest crops", letters: "AEPR" },
      { word: "DRAPE", clue: "Cover loosely with fabric", letters: "ADEPR" },
      { word: "DRAPED", clue: "Covered with hanging cloth", letters: "ADDEPR" },
      { word: "DIAPERS", clue: "Baby nappies", letters: "ADEIIPRS" },
    ],
    extraLetter: "A,P,E,R,D,E,S",
  },
  {
    levels: [
      { word: "I", clue: "First-person pronoun", letters: "I" },
      { word: "IT", clue: "Third-person neuter pronoun", letters: "IT" },
      { word: "TIP", clue: "End of a sharp object", letters: "IPT" },
      { word: "TRIP", clue: "A journey", letters: "IPRT" },
      { word: "STRIP", clue: "Remove covering", letters: "IPRST" },
      { word: "RIPEST", clue: "Most ready to eat", letters: "EIPRST" },
      { word: "TIPSTERS", clue: "People who give tips", letters: "EIPRSSTT" },
    ],
    extraLetter: "I,T,P,R,S,E,S",
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

export function initialState(seed: number): WordPyramidState {
  const rng = mulberry32(seed);
  const puzzles = shuffle([...PYRAMIDS], rng);
  const puzzle = puzzles[0]!;
  return {
    puzzle,
    inputs: puzzle.levels.map(() => ""),
    revealed: puzzle.levels.map(() => false),
    checked: false,
    score: 0,
    phase: "playing",
    message: "",
  };
}

export function reducer(state: WordPyramidState, action: WordPyramidAction): WordPyramidState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const newInputs = [...state.inputs];
      newInputs[action.row] = action.text.toUpperCase().replace(/[^A-Z]/g, "");
      return { ...state, inputs: newInputs, message: "" };
    }
    case "check": {
      let score = 0;
      const revealed = [...state.revealed];
      state.puzzle.levels.forEach((level, i) => {
        if (state.inputs[i] === level.word) {
          score += 100;
          revealed[i] = true;
        }
      });
      const allRight = score === state.puzzle.levels.length * 100;
      return { ...state, checked: true, revealed, score, phase: "done", message: allRight ? "Perfect pyramid!" : `${score / 100} of ${state.puzzle.levels.length} correct!` };
    }
    case "reveal": {
      const newRevealed = [...state.revealed];
      newRevealed[action.row] = true;
      const newInputs = [...state.inputs];
      newInputs[action.row] = state.puzzle.levels[action.row]!.word;
      return { ...state, revealed: newRevealed, inputs: newInputs };
    }
    default:
      return state;
  }
}

export function isTerminal(state: WordPyramidState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
