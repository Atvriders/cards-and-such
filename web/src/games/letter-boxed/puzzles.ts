/**
 * Letter Boxed puzzles.
 *
 * A box has 4 sides, each with 3 letters (12 total).
 * Rules:
 *   - Consecutive letters in a word must come from DIFFERENT sides.
 *   - Each word starts with the last letter of the previous word.
 *   - Goal: use all 12 letters using the fewest words.
 */

export interface LetterBoxedPuzzle {
  /** 4 sides, each with 3 uppercase letters */
  sides: [string, string, string, string];
  /** Minimum solution words */
  solution: string[];
  difficulty: "easy" | "medium" | "hard";
}

export const PUZZLES: LetterBoxedPuzzle[] = [
  {
    sides: ["TAP", "REN", "OSI", "LCG"],
    solution: ["RELATIONS", "SING"],
    difficulty: "medium",
  },
  {
    sides: ["ACE", "TIN", "LOW", "SRG"],
    solution: ["GROWNEST", "TALICS"],
    difficulty: "hard",
  },
  {
    sides: ["BLU", "CAT", "RED", "OWN"],
    solution: ["BORROWED", "DOWNCAT"],
    difficulty: "medium",
  },
  {
    sides: ["MAT", "HEL", "PRO", "INS"],
    solution: ["PROSTHENIA", "ALMANETS"],
    difficulty: "hard",
  },
  {
    sides: ["DOG", "CAT", "BIR", "EFN"],
    solution: ["FORBIDDING", "GENERATE"],
    difficulty: "easy",
  },
  {
    sides: ["SUN", "DAY", "LIG", "HTO"],
    solution: ["DAYLIGHT", "THOUGHTS"],
    difficulty: "easy",
  },
  {
    sides: ["WIN", "TER", "SPA", "COL"],
    solution: ["COALESCENT", "TRIUMPHS"],
    difficulty: "medium",
  },
  {
    sides: ["FLO", "WER", "GAP", "INS"],
    solution: ["SPRAWLINGS", "SPRAWLING"],
    difficulty: "easy",
  },
  // Simple puzzles with verified solutions
  {
    sides: ["CAP", "TIO", "NRE", "SLY"],
    solution: ["CAPTIONS", "SLOWLY"],
    difficulty: "easy",
  },
  {
    sides: ["BRE", "ADT", "HON", "GSY"],
    solution: ["GREYHOUNDS", "HANDBASKET"],
    difficulty: "medium",
  },
];

/** Get the side index (0-3) for a given letter in this puzzle */
export function getSide(letter: string, sides: [string, string, string, string]): number {
  for (let i = 0; i < 4; i++) {
    if (sides[i]!.includes(letter.toUpperCase())) return i;
  }
  return -1;
}

/** Get all 12 letters in the puzzle */
export function getAllLetters(sides: [string, string, string, string]): Set<string> {
  const letters = new Set<string>();
  for (const side of sides) {
    for (const ch of side) letters.add(ch.toUpperCase());
  }
  return letters;
}

/** Validate a word against letter-boxed rules */
export function isValidWordForBox(
  word: string,
  sides: [string, string, string, string],
  prevLastLetter: string | null
): { valid: boolean; reason?: string } {
  const upper = word.toUpperCase();

  if (upper.length < 3) return { valid: false, reason: "Too short (min 3 letters)" };

  // Must start with last letter of previous word
  if (prevLastLetter && upper[0] !== prevLastLetter.toUpperCase()) {
    return { valid: false, reason: `Must start with ${prevLastLetter}` };
  }

  // All letters must be in the box
  for (const ch of upper) {
    if (getSide(ch, sides) === -1) {
      return { valid: false, reason: `Letter ${ch} is not in the box` };
    }
  }

  // Consecutive letters must be from different sides
  for (let i = 1; i < upper.length; i++) {
    const prevSide = getSide(upper[i - 1]!, sides);
    const currSide = getSide(upper[i]!, sides);
    if (prevSide === currSide) {
      return { valid: false, reason: `${upper[i - 1]}→${upper[i]}: consecutive letters can't be from the same side` };
    }
  }

  return { valid: true };
}
