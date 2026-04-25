import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SeatingPuzzle {
  title: string;
  people: string[];
  seats: number;
  clues: string[];
  /** solution[seatIdx] = personName */
  solution: string[];
}

export interface SeatingSettings {
  dummy?: string;
}

export interface SeatingState {
  settings: SeatingSettings;
  puzzle: SeatingPuzzle;
  /** assignment[seatIdx] = personName | null */
  assignment: (string | null)[];
  /** draggedPerson: currently being placed */
  selected: string | null;
  won: boolean;
  moves: number;
  rngSeed: number;
}

export type SeatingAction =
  | { type: "selectPerson"; person: string | null }
  | { type: "placePerson"; seat: number }
  | { type: "removePerson"; seat: number }
  | { type: "reset" };

export const PUZZLES: SeatingPuzzle[] = [
  {
    title: "Dinner Party",
    people: ["Alice", "Bob", "Carol", "Dave", "Eve"],
    seats: 5,
    clues: [
      "Alice is not at seat 1.",
      "Bob sits immediately to the right of Alice.",
      "Carol is at an odd-numbered seat.",
      "Dave is not adjacent to Eve.",
      "Eve is at the rightmost seat.",
      "Carol is not next to Dave.",
    ],
    solution: ["Carol", "Alice", "Bob", "Dave", "Eve"],
  },
  {
    title: "Movie Row",
    people: ["Ann", "Ben", "Cleo", "Dan", "Fay"],
    seats: 5,
    clues: [
      "Ann is at seat 2.",
      "Ben is next to Ann.",
      "Cleo is at seat 5.",
      "Dan is not at seat 1.",
      "Fay is between Dan and Cleo.",
    ],
    solution: ["Ben", "Ann", "Dan", "Fay", "Cleo"],
  },
  {
    title: "Conference Table",
    people: ["Lena", "Mark", "Nina", "Oscar", "Pam"],
    seats: 5,
    clues: [
      "Mark is at seat 3.",
      "Lena is immediately left of Mark.",
      "Nina is at an even-numbered seat.",
      "Oscar is at seat 5.",
      "Pam is not next to Mark.",
    ],
    solution: ["Pam", "Lena", "Mark", "Nina", "Oscar"],
  },
  {
    title: "Classroom Row",
    people: ["Sara", "Tim", "Uma", "Vic", "Wendy"],
    seats: 5,
    clues: [
      "Sara is at seat 1.",
      "Tim is not adjacent to Sara.",
      "Uma is at seat 4.",
      "Vic is immediately right of Uma.",
      "Wendy is between Sara and Tim.",
    ],
    solution: ["Sara", "Wendy", "Tim", "Uma", "Vic"],
  },
  {
    title: "Train Compartment",
    people: ["Aria", "Bryce", "Chen", "Dana", "Erik"],
    seats: 5,
    clues: [
      "Chen is at seat 1.",
      "Aria is at seat 3.",
      "Bryce is not next to Chen.",
      "Dana is immediately left of Erik.",
      "Erik is at seat 5.",
    ],
    solution: ["Chen", "Bryce", "Aria", "Dana", "Erik"],
  },
  {
    title: "Birthday Seats",
    people: ["Hana", "Ivan", "Jess", "Kim", "Leo"],
    seats: 5,
    clues: [
      "Hana is at seat 2.",
      "Ivan is at seat 4.",
      "Jess is immediately right of Hana.",
      "Kim is not adjacent to Ivan.",
      "Leo is at seat 5.",
    ],
    solution: ["Kim", "Hana", "Jess", "Ivan", "Leo"],
  },
  {
    title: "Exam Hall",
    people: ["Mia", "Ned", "Ora", "Pete", "Quinn"],
    seats: 5,
    clues: [
      "Quinn is at seat 5.",
      "Pete is at seat 3.",
      "Mia is not next to Pete.",
      "Ned is immediately left of Pete.",
      "Ora is not at seat 1.",
    ],
    solution: ["Mia", "Ned", "Pete", "Ora", "Quinn"],
  },
  {
    title: "Waiting Room",
    people: ["Ruby", "Sam", "Tara", "Ulric", "Val"],
    seats: 5,
    clues: [
      "Val is at seat 1.",
      "Sam is immediately right of Val.",
      "Ruby is at seat 5.",
      "Tara is not adjacent to Ruby.",
      "Ulric is at seat 4.",
    ],
    solution: ["Val", "Sam", "Tara", "Ulric", "Ruby"],
  },
];

function checkWon(puzzle: SeatingPuzzle, assignment: (string | null)[]): boolean {
  if (assignment.some((a) => a === null)) return false;
  return assignment.every((a, i) => a === puzzle.solution[i]);
}

export function initialState(seed: number, settings: SeatingSettings): SeatingState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    assignment: new Array<null>(puzzle.seats).fill(null),
    selected: null,
    won: false,
    moves: 0,
    rngSeed: seed,
  };
}

export function reducer(state: SeatingState, action: SeatingAction): SeatingState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectPerson":
      return { ...state, selected: action.person };
    case "placePerson": {
      const { seat } = action;
      if (state.selected === null) return state;
      // Remove person from any current seat
      const prev = state.assignment.map((a) => (a === state.selected ? null : a));
      // Also evict whoever is in the target seat
      prev[seat] = state.selected;
      const won = checkWon(state.puzzle, prev);
      return { ...state, assignment: prev, selected: null, won, moves: state.moves + 1 };
    }
    case "removePerson": {
      const next = [...state.assignment];
      next[action.seat] = null;
      return { ...state, assignment: next, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        assignment: new Array<null>(state.puzzle.seats).fill(null),
        selected: null,
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: SeatingState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 10) };
}
