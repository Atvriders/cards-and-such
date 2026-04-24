import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CipherCrackSettings {
  length: "short" | "medium" | "long";
}

export interface CipherCrackState {
  settings: CipherCrackSettings;
  ciphertext: string;      // encoded message (uppercase letters + spaces)
  plaintext: string;       // solution (uppercase)
  mapping: readonly string[]; // mapping[i] = plaintext letter for cipher letter i (A=0)
  guesses: readonly (string | null)[]; // player's guesses: guesses[cipherLetterCode - 65]
  won: boolean;
  movesMade: number;
}

export type CipherCrackAction =
  | { type: "assign"; cipherLetter: string; plainLetter: string | null };

const SHORT_PHRASES = [
  "THE CAT SAT",
  "NO TIME LEFT",
  "ALL OR NOTHING",
  "PLAY TO WIN",
  "FIND THE KEY",
];

const MEDIUM_PHRASES = [
  "THE QUICK BROWN FOX",
  "PACK MY BOX WITH FIVE DOZEN JUGS",
  "HOW VEXINGLY DAFT QUIZZES MOCK",
  "LOGIC IS THE ART OF GOING WRONG",
  "A MIND ONCE STRETCHED NEVER SHRINKS",
];

const LONG_PHRASES = [
  "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO",
  "IN THE MIDDLE OF EVERY DIFFICULTY LIES OPPORTUNITY",
  "LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING PLANS",
  "THE BEST TIME TO PLANT A TREE WAS TWENTY YEARS AGO",
];

const PHRASES: Record<string, string[]> = {
  short: SHORT_PHRASES,
  medium: MEDIUM_PHRASES,
  long: LONG_PHRASES,
};

function buildCipherMapping(rng: () => number): string[] {
  // Random substitution cipher: shuffle A-Z
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const shuffled = alpha.slice();
  for (let i = 25; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  // Ensure no letter maps to itself
  for (let i = 0; i < 26; i++) {
    if (shuffled[i] === alpha[i]) {
      const swapWith = (i + 1) % 26;
      [shuffled[i], shuffled[swapWith]] = [shuffled[swapWith]!, shuffled[i]!];
    }
  }
  return shuffled; // shuffled[i] = cipher letter that plaintext letter alpha[i] maps to
}

function encodePlaintext(plaintext: string, mapping: string[]): string {
  return plaintext
    .split("")
    .map((ch) => {
      if (ch === " ") return " ";
      const idx = ch.charCodeAt(0) - 65;
      return mapping[idx] ?? ch;
    })
    .join("");
}

export function initialState(seed: number, settings: CipherCrackSettings): CipherCrackState {
  const rng = mulberry32(seed);
  const phrases = PHRASES[settings.length]!;
  const plaintext = phrases[Math.floor(rng() * phrases.length)]!;
  const mapping = buildCipherMapping(rng); // plaintext -> cipher
  const ciphertext = encodePlaintext(plaintext, mapping);

  // Reverse mapping: only for cipher letters that actually appear in the ciphertext
  // reverseMapping[cipherLetterIdx] = plaintext letter (or "" if not used in message)
  const usedCipherLetters = new Set(ciphertext.replace(/ /g, "").split(""));
  const reverseMapping = new Array<string>(26).fill("");
  for (let i = 0; i < 26; i++) {
    const cipherLetter = mapping[i]!;
    if (!usedCipherLetters.has(cipherLetter)) continue;
    const cipherIdx = cipherLetter.charCodeAt(0) - 65;
    reverseMapping[cipherIdx] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i]!;
  }

  return {
    settings,
    ciphertext,
    plaintext,
    mapping: reverseMapping, // reverseMapping[cipherIdx] = plaintext letter
    guesses: new Array<string | null>(26).fill(null),
    won: false,
    movesMade: 0,
  };
}

function checkWon(guesses: readonly (string | null)[], mapping: readonly string[]): boolean {
  for (let i = 0; i < 26; i++) {
    const needed = mapping[i];
    if (!needed) continue; // cipher letter not used in message
    if (guesses[i] !== needed) return false;
  }
  return true;
}

export function reducer(state: CipherCrackState, action: CipherCrackAction): CipherCrackState {
  if (state.won) return state;
  if (action.type !== "assign") return state;

  const { cipherLetter, plainLetter } = action;
  if (cipherLetter.length !== 1) return state;
  const cipherIdx = cipherLetter.toUpperCase().charCodeAt(0) - 65;
  if (cipherIdx < 0 || cipherIdx > 25) return state;

  const newGuesses = state.guesses.slice() as (string | null)[];
  newGuesses[cipherIdx] = plainLetter ? plainLetter.toUpperCase() : null;

  const won = checkWon(newGuesses, state.mapping);
  return { ...state, guesses: newGuesses, won, movesMade: state.movesMade + 1 };
}

export function isTerminal(state: CipherCrackState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 10) };
}
