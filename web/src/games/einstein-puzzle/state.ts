import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface EinsteinPuzzle {
  title: string;
  categories: string[];
  values: string[][];
  /** solution[cat][pos] = value index */
  solution: number[][];
  clues: string[];
}

export interface EinsteinSettings {
  dummy?: string;
}

export type CellMark = null | boolean;

export interface EinsteinState {
  settings: EinsteinSettings;
  puzzle: EinsteinPuzzle;
  /** marks[cat][pos][valIdx] */
  marks: CellMark[][][];
  won: boolean;
  moves: number;
  rngSeed: number;
}

export type EinsteinAction =
  | { type: "setMark"; cat: number; pos: number; val: number; mark: CellMark }
  | { type: "reset" };

export const PUZZLES: EinsteinPuzzle[] = [
  {
    title: "The Zebra Puzzle",
    categories: ["Color", "Nationality", "Drink", "Smoke", "Pet"],
    values: [
      ["Yellow", "Blue", "Red", "Ivory", "Green"],
      ["Norwegian", "Ukrainian", "Englishman", "Spaniard", "Japanese"],
      ["Water", "Tea", "Milk", "OJ", "Coffee"],
      ["Kools", "Chesterfield", "Old Gold", "Lucky Strike", "Parliaments"],
      ["Fox", "Horse", "Snails", "Dog", "Zebra"],
    ],
    // house positions 0-4 (left to right)
    // solution[cat][pos] = value index in values[cat]
    solution: [
      [0, 1, 2, 3, 4], // Yellow,Blue,Red,Ivory,Green
      [0, 1, 2, 3, 4], // Norwegian,Ukrainian,Englishman,Spaniard,Japanese
      [0, 1, 2, 3, 4], // Water,Tea,Milk,OJ,Coffee
      [0, 1, 2, 3, 4], // Kools,Chesterfield,Old Gold,Lucky Strike,Parliaments
      [0, 1, 2, 3, 4], // Fox,Horse,Snails,Dog,Zebra
    ],
    clues: [
      "The Englishman lives in the Red house.",
      "The Spaniard owns the Dog.",
      "Coffee is drunk in the Green house.",
      "The Ukrainian drinks Tea.",
      "The Green house is immediately to the right of the Ivory house.",
      "The Old Gold smoker owns Snails.",
      "Kools are smoked in the Yellow house.",
      "Milk is drunk in the middle house (#3).",
      "The Norwegian lives in house #1.",
      "The Chesterfield smoker lives next to the Fox owner.",
      "Kools are smoked next to the Horse owner.",
      "The Lucky Strike smoker drinks OJ.",
      "The Japanese smokes Parliaments.",
      "The Norwegian lives next to the Blue house.",
    ],
  },
  {
    title: "Five Friends",
    categories: ["Position", "Name", "Color", "Job", "Sport"],
    values: [
      ["1st", "2nd", "3rd", "4th", "5th"],
      ["Alice", "Bob", "Carol", "Dave", "Eve"],
      ["Red", "Blue", "Green", "Yellow", "Purple"],
      ["Chef", "Doctor", "Lawyer", "Teacher", "Pilot"],
      ["Tennis", "Soccer", "Chess", "Swimming", "Cycling"],
    ],
    solution: [
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
    ],
    clues: [
      "Alice is in position 1.",
      "The person in Red is a Chef.",
      "Bob is immediately to the right of Alice.",
      "The Doctor plays Tennis.",
      "Carol wears Green.",
      "The Lawyer is in position 4.",
      "Dave plays Soccer.",
      "The person in Yellow is a Teacher.",
      "Eve is in position 5.",
      "The Pilot cycles.",
      "The person in Blue plays Chess.",
      "The person in Purple is in position 3.",
    ],
  },
  {
    title: "City Visitors",
    categories: ["Day", "Visitor", "City", "Transport", "Souvenir"],
    values: [
      ["Mon", "Tue", "Wed", "Thu", "Fri"],
      ["Anna", "Ben", "Cara", "Dan", "Ella"],
      ["Paris", "Rome", "London", "Tokyo", "Sydney"],
      ["Train", "Plane", "Bus", "Car", "Bike"],
      ["Hat", "Scarf", "Mug", "Keyring", "Postcard"],
    ],
    solution: [
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
    ],
    clues: [
      "Anna visited on Monday.",
      "The Paris visitor came by Train.",
      "Ben arrived the day after Anna.",
      "The Plane traveller visited Rome.",
      "Cara visited on Wednesday.",
      "The Bus rider bought a Mug.",
      "Dan visited on Thursday.",
      "The London visitor bought a Hat.",
      "Ella came by Bike.",
      "The Tokyo visitor bought a Keyring.",
      "The Car traveller visited Sydney.",
      "The Scarf was bought in Rome.",
    ],
  },
  {
    title: "Pet Show",
    categories: ["Cage", "Owner", "Animal", "Color", "Ribbon"],
    values: [
      ["A", "B", "C", "D", "E"],
      ["Sara", "Tom", "Uma", "Vic", "Wendy"],
      ["Cat", "Dog", "Bird", "Fish", "Rabbit"],
      ["White", "Black", "Brown", "Orange", "Grey"],
      ["Gold", "Silver", "Bronze", "Red", "Blue"],
    ],
    solution: [
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
    ],
    clues: [
      "Sara's cage is A.",
      "The Cat is White.",
      "Tom owns a Dog.",
      "The Black animal is in cage B.",
      "Uma's animal is Brown.",
      "The Gold ribbon goes to cage C.",
      "Vic is in cage D.",
      "The Bird won the Silver ribbon.",
      "Wendy owns a Rabbit.",
      "The Fish is Orange.",
      "The Red ribbon goes to the Dog owner.",
      "The Grey animal won the Bronze ribbon.",
    ],
  },
  {
    title: "Office Floors",
    categories: ["Floor", "Person", "Dept", "Coffee", "Plant"],
    values: [
      ["1F", "2F", "3F", "4F", "5F"],
      ["Liam", "Mia", "Noah", "Olivia", "Peter"],
      ["HR", "IT", "Finance", "Marketing", "Legal"],
      ["Espresso", "Latte", "Americano", "Cappuccino", "Mocha"],
      ["Fern", "Cactus", "Orchid", "Bamboo", "Rose"],
    ],
    solution: [
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
      [0, 1, 2, 3, 4],
    ],
    clues: [
      "Liam works on the 1st floor.",
      "HR is on the 2nd floor.",
      "Mia drinks Espresso.",
      "IT has a Cactus plant.",
      "Noah works in Finance.",
      "The 3rd floor person drinks Latte.",
      "Olivia is on the 4th floor.",
      "Marketing has an Orchid.",
      "Peter drinks Cappuccino.",
      "Legal is on the 5th floor.",
      "The Bamboo is on the floor with Americano drinker.",
      "The Rose belongs to the Mocha drinker.",
    ],
  },
];

function makeMark(cats: number, pos: number): CellMark[][][] {
  return Array.from({ length: cats }, () =>
    Array.from({ length: pos }, () => new Array<CellMark>(pos).fill(null))
  );
}

export function checkWon(puzzle: EinsteinPuzzle, marks: CellMark[][][]): boolean {
  const n = 5;
  for (let c = 0; c < puzzle.categories.length; c++) {
    for (let p = 0; p < n; p++) {
      const solVal = puzzle.solution[c]![p]!;
      for (let v = 0; v < n; v++) {
        const expected = v === solVal;
        if (marks[c]![p]![v] !== expected) return false;
      }
    }
  }
  return true;
}

export function initialState(seed: number, settings: EinsteinSettings): EinsteinState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    marks: makeMark(puzzle.categories.length, 5),
    won: false,
    moves: 0,
    rngSeed: seed,
  };
}

export function reducer(state: EinsteinState, action: EinsteinAction): EinsteinState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "setMark": {
      const { cat, pos, val, mark } = action;
      const newMarks = state.marks.map((cm, ci) =>
        ci === cat
          ? cm.map((pm, pi) =>
              pi === pos ? pm.map((v, vi) => (vi === val ? mark : v)) : pm
            )
          : cm
      );
      const won = checkWon(state.puzzle, newMarks);
      return { ...state, marks: newMarks, won, moves: state.moves + 1 };
    }
    case "reset": {
      return { ...state, marks: makeMark(state.puzzle.categories.length, 5), won: false, moves: 0 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: EinsteinState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
