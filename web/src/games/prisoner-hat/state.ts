import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HatPuzzle {
  id: string;
  title: string;
  scenario: string;
  prisoners: PrisonerInfo[];
  /** correct answer index in options */
  correctOption: number;
  options: string[];
  explanation: string;
}

export interface PrisonerInfo {
  name: string;
  hatColor: "black" | "white";
  canSee: string[]; // names of prisoners they can see
  says: string; // what they say (pass or color)
}

export interface HatSettings {
  dummy?: string;
}

export interface HatState {
  settings: HatSettings;
  puzzle: HatPuzzle;
  selectedOption: number | null;
  submitted: boolean;
  correct: boolean;
  rngSeed: number;
  score: number;
  totalScore: number;
  puzzleIndex: number;
}

export type HatAction =
  | { type: "selectOption"; option: number }
  | { type: "submit" }
  | { type: "next" };

export const PUZZLES: HatPuzzle[] = [
  {
    id: "classic3",
    title: "Three Prisoners in a Line",
    scenario: "Three prisoners (A, B, C) stand in a line facing the same direction. A sees B and C. B sees C. C sees nobody. There are 3 white hats and 2 black hats. After a moment of silence, A says 'I don't know my hat color.' B says 'I don't know mine.' What color is C's hat?",
    prisoners: [
      { name: "A", hatColor: "white", canSee: ["B", "C"], says: "Pass" },
      { name: "B", hatColor: "white", canSee: ["C"], says: "Pass" },
      { name: "C", hatColor: "white", canSee: [], says: "White!" },
    ],
    correctOption: 0,
    options: ["White", "Black", "Cannot be determined"],
    explanation: "A sees two hats. If both B and C wore black, A would know she's white (only 2 black hats). A passes, so B and C aren't both black. B sees C. B knows A passed — if C were black, B would know she must be white. B passes too, meaning C is NOT black. So C deduces her hat is White.",
  },
  {
    id: "row4",
    title: "Four Hats, Two Colors",
    scenario: "Four prisoners (A, B, C, D) are in a row. A sees B, C, D. B sees C, D. C sees D. D sees no one. Hats: A=Black, B=White, C=Black, D=White. A passes. B passes. C says 'I know!' What color did C say?",
    prisoners: [
      { name: "A", hatColor: "black", canSee: ["B", "C", "D"], says: "Pass" },
      { name: "B", hatColor: "white", canSee: ["C", "D"], says: "Pass" },
      { name: "C", hatColor: "black", canSee: ["D"], says: "Black!" },
      { name: "D", hatColor: "white", canSee: [], says: "?" },
    ],
    correctOption: 1,
    options: ["White", "Black", "Cannot be determined"],
    explanation: "C sees D (white). From A and B passing, C reasons: if she were white, B would see two whites and know he's the third color. B passed, so C knows she must be Black.",
  },
  {
    id: "tworow",
    title: "Two Rows of Prisoners",
    scenario: "Two groups of 2 prisoners face each other. Group X (X1, X2) and Group Y (Y1, Y2). X1 sees Y1 and Y2. X2 sees Y1 and Y2. Y1 sees X1 and X2. Y2 sees X1 and X2. Hats used: 2 black, 2 white. X1=White, X2=Black, Y1=White, Y2=Black. X1 passes. Then Y2 says 'I know!' What color is Y2?",
    prisoners: [
      { name: "X1", hatColor: "white", canSee: ["Y1", "Y2"], says: "Pass" },
      { name: "X2", hatColor: "black", canSee: ["Y1", "Y2"], says: "Pass" },
      { name: "Y1", hatColor: "white", canSee: ["X1", "X2"], says: "Pass" },
      { name: "Y2", hatColor: "black", canSee: ["X1", "X2"], says: "Black!" },
    ],
    correctOption: 1,
    options: ["White", "Black", "Cannot be determined"],
    explanation: "Y2 sees X1 (white) and X2 (black) — one of each. Since X1 passed, X1 didn't see two of the same color (that would reveal X1's own color). So there's one of each color in X's group. Y2 sees one of each in Y's group too... wait, Y2 sees X1=white, X2=black. With 2 black and 2 white total, if one of Y is white, the other must be black. Y1 also passed (didn't know). Y2 deduces she is Black.",
  },
  {
    id: "always3",
    title: "Three Hats, Same Color?",
    scenario: "Three prisoners are in a circle — each can see the other two. Hats are placed randomly: either all white, or two white and one black. The warden says at least one hat is white. Each prisoner passes or guesses simultaneously. What is the optimal strategy for at least one prisoner to always guess correctly?",
    prisoners: [
      { name: "P1", hatColor: "white", canSee: ["P2", "P3"], says: "White if I see a black" },
      { name: "P2", hatColor: "white", canSee: ["P1", "P3"], says: "White if I see a black" },
      { name: "P3", hatColor: "white", canSee: ["P1", "P2"], says: "White if I see a black" },
    ],
    correctOption: 0,
    options: [
      "Each prisoner guesses 'white' if they see a black hat on someone else, else passes",
      "Everyone guesses 'white' no matter what",
      "Everyone passes until the last prisoner guesses",
      "There is no guaranteed strategy",
    ],
    explanation: "If any prisoner sees a black hat, they know the others may be white or black. The strategy: 'If I see at least one black hat, guess white; otherwise pass.' If all hats are white, all pass — then each reconsiders: nobody guessed, so I must be white! At least one will speak up. This strategy guarantees a correct guess.",
  },
  {
    id: "infrow",
    title: "Infinite Prisoners",
    scenario: "Infinitely many prisoners are numbered 0, 1, 2, ... and each gets a hat (black or white). Prisoner n can see all prisoners with numbers greater than n. They must simultaneously guess their own hat color. How many prisoners can be guaranteed to guess wrong?",
    prisoners: [],
    correctOption: 1,
    options: [
      "All prisoners may guess wrong",
      "Only finitely many prisoners guess wrong",
      "Exactly one prisoner guesses wrong",
      "No prisoners guess wrong",
    ],
    explanation: "Using the axiom of choice, prisoners agree on a strategy where they look at the tail sequence of hats they see and guess based on the equivalence class of hat sequences. In this strategy, only finitely many prisoners guess wrong — specifically at most a finite number determined by where the chosen representative differs from the actual sequence.",
  },
  {
    id: "blindhat",
    title: "Blind Prisoner",
    scenario: "Four prisoners stand in a line behind a wall. Prisoner 1 is separated. Prisoners 2, 3, 4 stand in order. Prisoner 4 sees 2 and 3. Prisoner 3 sees 2. Prisoner 2 sees nobody. Prisoner 1 sees nobody. Hats: 2 black, 2 white. Prisoner 4 has White. Prisoner 3 has Black. Prisoner 2 has White. Prisoner 1 has Black. After a pause, one prisoner correctly guesses. Which prisoner?",
    prisoners: [
      { name: "P1", hatColor: "black", canSee: [], says: "Pass" },
      { name: "P2", hatColor: "white", canSee: [], says: "Pass" },
      { name: "P3", hatColor: "black", canSee: ["P2"], says: "Pass" },
      { name: "P4", hatColor: "white", canSee: ["P2", "P3"], says: "White!" },
    ],
    correctOption: 2,
    options: ["Prisoner 1", "Prisoner 2", "Prisoner 4", "Prisoner 3"],
    explanation: "Prisoner 4 sees P2 (white) and P3 (black) — one of each. Since two hats of each color are used and P4 sees one white and one black, P4 can't determine their own from that alone. But wait — P3 sees only P2 (white). If P3 were white, P3 couldn't know. P3 passes. P4 deduces from P3's silence that P3 sees something uncertain. P4, seeing one of each color, knows her own isn't forced by what she sees — but P3's silence tells P4 that P3 is NOT white (if P3 were white and saw white on P2, P3 would still not know). Actually P4 sees P2 white, P3 black → since there are 2 of each and both are accounted for, P4 knows P4 is white!",
  },
  {
    id: "sequential3",
    title: "Sequential Guessing",
    scenario: "Three prisoners in a line (A sees B and C; B sees C; C sees nobody). 3 white hats, 2 black. A says 'I don't know.' B says 'I don't know.' Now it's C's turn. Without seeing anything, what must C deduce?",
    prisoners: [
      { name: "A", hatColor: "white", canSee: ["B", "C"], says: "I don't know" },
      { name: "B", hatColor: "white", canSee: ["C"], says: "I don't know" },
      { name: "C", hatColor: "white", canSee: [], says: "White!" },
    ],
    correctOption: 0,
    options: ["White — C knows by elimination", "Black — C guesses randomly", "C cannot determine the answer", "Either color — 50/50"],
    explanation: "A passing means B and C are not both black (only 2 black hats; if B=black and C=black, A would know A=white). So at most one of B, C is black. B knows this. B sees C. If C were black, B would know B is white (since only one black remains after A's pass). B passes anyway — so C is NOT black. C deduces: I must be White.",
  },
  {
    id: "singleblack",
    title: "One Black Hat",
    scenario: "There are 5 prisoners in a circle. Only ONE black hat is among the 5 white hats. Each prisoner can see everyone else's hat. The warden says 'At least one hat is black.' What happens?",
    prisoners: [],
    correctOption: 0,
    options: [
      "The prisoner with the black hat immediately knows their hat color",
      "No one can determine their hat color",
      "Everyone simultaneously guesses correctly",
      "The prisoner with the black hat needs one round of silence first",
    ],
    explanation: "Each prisoner sees everyone else. The prisoner who sees 4 white hats knows they must be the one wearing black (since the warden confirmed at least one is black). They immediately identify their own hat color. The other 4 prisoners each see one black hat and 3 whites — they cannot immediately conclude their own color, but the black-hat prisoner can.",
  },
];

export function initialState(seed: number, settings: HatSettings): HatState {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * PUZZLES.length);
  return {
    settings,
    puzzle: PUZZLES[idx]!,
    selectedOption: null,
    submitted: false,
    correct: false,
    rngSeed: seed,
    score: 0,
    totalScore: 0,
    puzzleIndex: idx,
  };
}

export function reducer(state: HatState, action: HatAction): HatState {
  if (state.submitted && action.type !== "next") return state;
  switch (action.type) {
    case "selectOption":
      return { ...state, selectedOption: action.option };
    case "submit": {
      if (state.selectedOption === null) return state;
      const correct = state.selectedOption === state.puzzle.correctOption;
      const score = correct ? 500 : 0;
      return { ...state, submitted: true, correct, score, totalScore: state.totalScore + score };
    }
    case "next": {
      const rng = mulberry32(state.rngSeed + 1);
      const idx = Math.floor(rng() * PUZZLES.length);
      return {
        ...state,
        puzzle: PUZZLES[idx]!,
        selectedOption: null,
        submitted: false,
        correct: false,
        rngSeed: state.rngSeed + 1,
        score: 0,
        puzzleIndex: idx,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: HatState): { score: number } | null {
  if (!state.submitted) return null;
  return { score: state.totalScore };
}
