import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type LetterMark = "green" | "yellow" | "gray" | "space";

export interface PhrazleAttempt {
  guess: string;
  marks: readonly LetterMark[];
}

export interface PhrazleState {
  target: string;           // e.g. "QUICK BROWN FOX"
  current: string;
  attempts: readonly PhrazleAttempt[];
  maxAttempts: number;
  won: boolean;
  lost: boolean;
  error: string | null;
}

export type PhrazleAction =
  | { type: "letter"; char: string }
  | { type: "backspace" }
  | { type: "submit" };

const PHRASES: string[] = [
  "BITE THE BULLET",
  "BREAK THE ICE",
  "HIT THE NAIL",
  "MISS THE BOAT",
  "SPILL THE BEANS",
  "KICK THE BUCKET",
  "CUT THE MUSTARD",
  "LET THE CAT OUT",
  "BURN THE CANDLE",
  "JUMP THE SHARK",
  "PULL MY LEG",
  "BITE MY TONGUE",
  "COST AN ARM",
  "COLD TURKEY",
  "BACK TO SQUARE ONE",
  "BALL IS IN YOUR COURT",
  "BARKING UP WRONG TREE",
  "BEAT AROUND THE BUSH",
  "BEST OF BOTH WORLDS",
  "BITE OFF MORE THAN",
  "BURNING BRIDGES NOW",
  "BY THE SKIN OF TEETH",
  "CALL IT A DAY",
  "CAN OF WORMS",
  "CAST IN STONE",
  "CHASING WILD GEESE",
  "CRACK OF DAWN",
  "CRY OVER SPILLED MILK",
  "CUT TO THE CHASE",
  "DRIVE ME UP WALL",
  "EVERY CLOUD HAS LINING",
  "FACE THE MUSIC NOW",
  "GIVE COLD SHOULDER",
  "GO BACK TO DRAWING",
  "HIT THE SACK NOW",
  "KILL TWO BIRDS NOW",
  "LEAVE NO STONE UNTURNED",
  "LET SLEEPING DOGS LIE",
  "NO PAIN NO GAIN",
  "OFF THE BEATEN PATH",
  "ON THE FENCE STILL",
  "ONCE IN BLUE MOON",
  "OVER THE MOON NOW",
  "PIECE OF CAKE TODAY",
  "RISE AND SHINE NOW",
  "RULE OF THUMB HERE",
  "SPEAK OF THE DEVIL",
  "STEAL SOMEONES THUNDER",
  "TAKE IT WITH SALT",
  "THE BALL IS YOURS",
];

function computeMarks(guess: string, target: string): LetterMark[] {
  const marks: LetterMark[] = [];
  // Only compare letters (skip spaces positionally)
  const guessLetters = guess.replace(/ /g, "");
  const targetLetters = target.replace(/ /g, "");
  const len = Math.max(guess.length, target.length);
  const targetConsumed: boolean[] = new Array(targetLetters.length).fill(false);
  const guessConsumed: boolean[] = new Array(guessLetters.length).fill(false);
  const letterMarks: LetterMark[] = new Array(guessLetters.length).fill("gray");

  // Pass 1: green
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      letterMarks[i] = "green";
      targetConsumed[i] = true;
      guessConsumed[i] = true;
    }
  }

  // Pass 2: yellow
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessConsumed[i]) continue;
    const ch = guessLetters[i]!;
    for (let j = 0; j < targetLetters.length; j++) {
      if (!targetConsumed[j] && targetLetters[j] === ch) {
        letterMarks[i] = "yellow";
        targetConsumed[j] = true;
        break;
      }
    }
  }

  // Map back to full guess including spaces
  let li = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === " ") {
      marks.push("space");
    } else {
      marks.push(letterMarks[li++]!);
    }
  }
  void len;
  return marks;
}

export function initialState(seed: number): PhrazleState {
  const rng = mulberry32(seed);
  const target = PHRASES[Math.floor(rng() * PHRASES.length)]!;
  return {
    target,
    current: "",
    attempts: [],
    maxAttempts: 6,
    won: false,
    lost: false,
    error: null,
  };
}

export function reducer(state: PhrazleState, action: PhrazleAction): PhrazleState {
  if (state.won || state.lost) return state;

  switch (action.type) {
    case "letter": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z ]$/.test(ch)) return state;
      // Auto-insert spaces to match target structure
      const targetNorm = state.target;
      const pos = state.current.length;
      if (pos >= targetNorm.length) return state;
      // If next target char is space and ch is letter, auto-skip space first
      let cur = state.current;
      if (targetNorm[cur.length] === " " && ch !== " ") {
        cur = cur + " ";
      }
      if (cur.length >= targetNorm.length) return { ...state, current: cur, error: null };
      if (ch === " ") return state; // user doesn't type spaces, auto-handled
      return { ...state, current: cur + ch, error: null };
    }
    case "backspace": {
      let cur = state.current;
      if (cur.length === 0) return state;
      cur = cur.slice(0, -1);
      // Also remove trailing space
      if (cur.endsWith(" ")) cur = cur.slice(0, -1);
      return { ...state, current: cur, error: null };
    }
    case "submit": {
      if (state.current.length !== state.target.length) {
        return { ...state, error: "Complete the phrase first" };
      }
      const marks = computeMarks(state.current, state.target);
      const attempt: PhrazleAttempt = { guess: state.current, marks };
      const newAttempts = [...state.attempts, attempt];
      const won = state.current === state.target;
      const lost = !won && newAttempts.length >= state.maxAttempts;
      return { ...state, attempts: newAttempts, current: "", error: null, won, lost };
    }
    default:
      return state;
  }
}

export function isTerminal(state: PhrazleState): { score: number } | null {
  if (state.won) return { score: (state.maxAttempts - state.attempts.length + 1) * 100 };
  if (state.lost) return { score: 0 };
  return null;
}
