import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Phrase Puzzle: fill in the blanks of a well-known phrase, given a category hint
export interface PhrasePuzzlePuzzle {
  phrase: string;        // full phrase, uppercase
  category: string;      // hint category
  blankedPhrase: string; // phrase with some letters replaced by _
  hint: string;          // additional clue
}

export interface PhrasePuzzleState {
  puzzles: readonly PhrasePuzzlePuzzle[];
  current: number;
  inputs: string[];    // player's letters for each blank
  blankIndexes: number[][]; // per puzzle, which char indexes are blanked
  solved: boolean[];
  score: number;
  checked: boolean;
  phase: "playing" | "done";
  message: string;
}

export type PhrasePuzzleAction =
  | { type: "type"; puzzleIdx: number; blankPos: number; char: string }
  | { type: "check" }
  | { type: "next" };

const RAW_PUZZLES: Array<{ phrase: string; category: string; hint: string }> = [
  { phrase: "THE EARLY BIRD CATCHES THE WORM", category: "Proverb", hint: "Being prompt pays off" },
  { phrase: "ACTIONS SPEAK LOUDER THAN WORDS", category: "Proverb", hint: "What you do matters more" },
  { phrase: "EVERY CLOUD HAS A SILVER LINING", category: "Idiom", hint: "Optimism in bad times" },
  { phrase: "DONT COUNT YOUR CHICKENS", category: "Proverb", hint: "Don't assume too much" },
  { phrase: "THE PROOF IS IN THE PUDDING", category: "Idiom", hint: "Results are what matters" },
  { phrase: "KILL TWO BIRDS WITH ONE STONE", category: "Idiom", hint: "Efficiency proverb" },
  { phrase: "BITE THE BULLET AND MOVE ON", category: "Idiom", hint: "Endure something painful" },
  { phrase: "A PENNY SAVED IS A PENNY EARNED", category: "Proverb", hint: "Franklin's frugality tip" },
  { phrase: "CURIOSITY KILLED THE CAT", category: "Proverb", hint: "Danger of nosiness" },
  { phrase: "PRACTICE MAKES PERFECT", category: "Proverb", hint: "Repetition leads to skill" },
  { phrase: "SPEAK SOFTLY AND CARRY A BIG STICK", category: "Saying", hint: "Theodore Roosevelt quote" },
  { phrase: "ALL THAT GLITTERS IS NOT GOLD", category: "Shakespeare", hint: "Merchant of Venice" },
  { phrase: "TO BE OR NOT TO BE", category: "Shakespeare", hint: "Hamlet's dilemma" },
  { phrase: "BREVITY IS THE SOUL OF WIT", category: "Shakespeare", hint: "Hamlet proverb" },
  { phrase: "BEGGARS CANNOT BE CHOOSERS", category: "Proverb", hint: "Accept what you are given" },
  { phrase: "BETTER LATE THAN NEVER", category: "Proverb", hint: "Arriving eventually is ok" },
  { phrase: "FORTUNE FAVORS THE BOLD", category: "Latin", hint: "Risk-taking pays" },
  { phrase: "NECESSITY IS THE MOTHER OF INVENTION", category: "Proverb", hint: "Need drives creativity" },
  { phrase: "A STITCH IN TIME SAVES NINE", category: "Proverb", hint: "Fix problems early" },
  { phrase: "THE PEN IS MIGHTIER THAN THE SWORD", category: "Saying", hint: "Bulwer-Lytton quote" },
  { phrase: "TIME FLIES WHEN YOU ARE HAVING FUN", category: "Saying", hint: "Enjoyment speeds time" },
  { phrase: "LOOK BEFORE YOU LEAP", category: "Proverb", hint: "Think first" },
  { phrase: "TWO WRONGS DO NOT MAKE A RIGHT", category: "Proverb", hint: "Retaliation ethics" },
  { phrase: "WHEN IN ROME DO AS THE ROMANS DO", category: "Saying", hint: "Adapt to local customs" },
  { phrase: "YOU CANT JUDGE A BOOK BY ITS COVER", category: "Proverb", hint: "Appearances deceive" },
  { phrase: "LAUGHTER IS THE BEST MEDICINE", category: "Saying", hint: "Humor heals" },
  { phrase: "HONESTY IS THE BEST POLICY", category: "Proverb", hint: "Truth pays" },
  { phrase: "WHERE THERE IS SMOKE THERE IS FIRE", category: "Proverb", hint: "Rumors have a basis" },
  { phrase: "THE GRASS IS GREENER ON THE OTHER SIDE", category: "Idiom", hint: "Envy others' situation" },
  { phrase: "HOPE FOR THE BEST PREPARE FOR THE WORST", category: "Saying", hint: "Optimistic realism" },
  { phrase: "GREAT MINDS THINK ALIKE", category: "Saying", hint: "Agreement is smart" },
  { phrase: "NO PAIN NO GAIN", category: "Proverb", hint: "Effort brings reward" },
  { phrase: "THE SHOW MUST GO ON", category: "Show biz", hint: "Carry on regardless" },
  { phrase: "STRIKE WHILE THE IRON IS HOT", category: "Proverb", hint: "Seize the moment" },
  { phrase: "THERE IS NO PLACE LIKE HOME", category: "Saying", hint: "Wizard of Oz" },
  { phrase: "KNOWLEDGE IS POWER", category: "Proverb", hint: "Francis Bacon" },
  { phrase: "BLOOD IS THICKER THAN WATER", category: "Proverb", hint: "Family first" },
  { phrase: "ABSENCE MAKES THE HEART GROW FONDER", category: "Saying", hint: "Distance enhances love" },
  { phrase: "THROW CAUTION TO THE WIND", category: "Idiom", hint: "Act recklessly" },
  { phrase: "EVERY DOG HAS ITS DAY", category: "Proverb", hint: "Everyone gets their moment" },
  { phrase: "THE BALL IS IN YOUR COURT", category: "Idiom", hint: "Your turn to decide" },
  { phrase: "DEAD MEN TELL NO TALES", category: "Saying", hint: "Pirate wisdom" },
  { phrase: "ACTIONS HAVE CONSEQUENCES", category: "Saying", hint: "Cause and effect" },
  { phrase: "SLOW AND STEADY WINS THE RACE", category: "Proverb", hint: "Aesop: tortoise and hare" },
  { phrase: "DO UNTO OTHERS AS YOU WOULD HAVE DONE", category: "Golden Rule", hint: "Empathy maxim" },
];

function blankSomeLetters(phrase: string, rng: () => number): { blanked: string; indexes: number[] } {
  const chars = phrase.split("");
  const letterPositions = chars
    .map((c, i) => (c !== " " ? i : -1))
    .filter(i => i !== -1);
  // Blank ~40% of letters
  const count = Math.max(4, Math.floor(letterPositions.length * 0.4));
  const toBlank = new Set<number>();
  const shuffled = [...letterPositions].sort(() => rng() - 0.5);
  shuffled.slice(0, count).forEach(i => toBlank.add(i));
  const blanked = chars.map((c, i) => (toBlank.has(i) ? "_" : c)).join("");
  return { blanked, indexes: [...toBlank].sort((a, b) => a - b) };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number): PhrasePuzzleState {
  const rng = mulberry32(seed);
  const selected = shuffle([...RAW_PUZZLES], rng).slice(0, 8);
  const puzzles: PhrasePuzzlePuzzle[] = selected.map(p => {
    const { blanked, indexes } = blankSomeLetters(p.phrase, rng);
    return { phrase: p.phrase, category: p.category, blankedPhrase: blanked, hint: p.hint };
  });
  const blankIndexes = puzzles.map((p, i) => {
    const chars = p.phrase.split("");
    const blankedChars = p.blankedPhrase.split("");
    return chars.map((c, ci) => blankedChars[ci] === "_" ? ci : -1).filter(x => x !== -1);
  });
  void blankIndexes;
  // Recalculate properly
  const bi = puzzles.map(p => {
    const result: number[] = [];
    for (let i = 0; i < p.blankedPhrase.length; i++) {
      if (p.blankedPhrase[i] === "_") result.push(i);
    }
    return result;
  });
  return {
    puzzles,
    current: 0,
    inputs: bi[0]!.map(() => ""),
    blankIndexes: bi,
    solved: new Array(puzzles.length).fill(false),
    score: 0,
    checked: false,
    phase: "playing",
    message: "",
  };
}

export function reducer(state: PhrasePuzzleState, action: PhrasePuzzleAction): PhrasePuzzleState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      const { puzzleIdx, blankPos, char } = action;
      if (puzzleIdx !== state.current) return state;
      const newInputs = [...state.inputs];
      newInputs[blankPos] = char.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
      return { ...state, inputs: newInputs, message: "" };
    }
    case "check": {
      const puzzle = state.puzzles[state.current]!;
      const blanks = state.blankIndexes[state.current]!;
      let correct = true;
      for (let i = 0; i < blanks.length; i++) {
        const pos = blanks[i]!;
        if ((state.inputs[i] ?? "") !== puzzle.phrase[pos]) {
          correct = false;
          break;
        }
      }
      const newSolved = [...state.solved];
      newSolved[state.current] = correct;
      const pts = correct ? 100 : 0;
      return {
        ...state,
        solved: newSolved,
        score: state.score + pts,
        checked: true,
        message: correct ? "Correct! +100" : `Not quite — the answer is: ${puzzle.phrase}`,
      };
    }
    case "next": {
      const next = state.current + 1;
      if (next >= state.puzzles.length) return { ...state, phase: "done" };
      const nextBlanks = state.blankIndexes[next]!;
      return {
        ...state,
        current: next,
        inputs: nextBlanks.map(() => ""),
        checked: false,
        message: "",
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: PhrasePuzzleState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
