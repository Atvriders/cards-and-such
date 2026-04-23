import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { QUORDLE_ANSWERS, VALID_GUESSES } from "./words.js";

export interface QuordleSettings {
  dummy?: "1";
}

export type LetterResult = "correct" | "present" | "absent";

export interface GuessResult {
  word: string;
  results: LetterResult[]; // per letter
}

export interface QuordleState {
  settings: QuordleSettings;
  targets: [string, string, string, string]; // 4 target words
  guesses: GuessResult[];                    // shared guess history (max 9)
  gridResults: GuessResult[][];              // [4][guesses] — per-grid results
  currentInput: string;
  gameOver: boolean;
  solved: [boolean, boolean, boolean, boolean];
  message: string;
}

export type QuordleAction =
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "submit" };

function pickTargets(rng: () => number): [string, string, string, string] {
  const pool = [...QUORDLE_ANSWERS];
  const picked: string[] = [];
  while (picked.length < 4) {
    const idx = Math.floor(rng() * pool.length);
    const word = pool.splice(idx, 1)[0]!;
    if (!picked.includes(word)) picked.push(word);
  }
  return picked as [string, string, string, string];
}

function scoreGuess(guess: string, target: string): LetterResult[] {
  const results: LetterResult[] = Array(5).fill("absent");
  const targetArr = target.split("");
  const guessArr = guess.split("");
  const used = Array(5).fill(false);

  // First pass: correct
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === targetArr[i]) {
      results[i] = "correct";
      used[i] = true;
    }
  }
  // Second pass: present
  for (let i = 0; i < 5; i++) {
    if (results[i] !== "correct") {
      for (let j = 0; j < 5; j++) {
        if (!used[j] && guessArr[i] === targetArr[j]) {
          results[i] = "present";
          used[j] = true;
          break;
        }
      }
    }
  }
  return results;
}

export function initialState(seed: number, settings: QuordleSettings): QuordleState {
  const rng = mulberry32(seed);
  const targets = pickTargets(rng);
  return {
    settings,
    targets,
    guesses: [],
    gridResults: [[], [], [], []],
    currentInput: "",
    gameOver: false,
    solved: [false, false, false, false],
    message: "",
  };
}

export function reducer(state: QuordleState, action: QuordleAction): QuordleState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "type": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch) || state.currentInput.length >= 5) return state;
      return { ...state, currentInput: state.currentInput + ch, message: "" };
    }
    case "delete": {
      return { ...state, currentInput: state.currentInput.slice(0, -1), message: "" };
    }
    case "submit": {
      const word = state.currentInput.toUpperCase();
      if (word.length !== 5) return { ...state, message: "Need 5 letters" };
      if (!VALID_GUESSES.includes(word)) return { ...state, message: "Not in word list" };

      // Score against each target
      const newGridResults = state.targets.map((target, gi) => {
        const existing = state.gridResults[gi] ?? [];
        if (state.solved[gi]) return existing;
        const result = scoreGuess(word, target);
        return [...existing, { word, results: result }];
      });

      // Update solved
      const newSolved = state.targets.map((target, gi) =>
        state.solved[gi] || word === target
      ) as [boolean, boolean, boolean, boolean];

      const newGuesses = [...state.guesses, { word, results: scoreGuess(word, state.targets[0]) }];
      const allSolved = newSolved.every(Boolean);
      const outOfGuesses = newGuesses.length >= 9;
      const gameOver = allSolved || outOfGuesses;

      return {
        ...state,
        guesses: newGuesses,
        gridResults: newGridResults as QuordleState["gridResults"],
        currentInput: "",
        solved: newSolved,
        gameOver,
        message: allSolved ? "Solved all 4!" : "",
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: QuordleState): { score: number } | null {
  if (!state.gameOver) return null;
  const solvedCount = state.solved.filter(Boolean).length;
  const guessesUsed = state.guesses.length;
  const score = solvedCount * 100 + Math.max(0, (9 - guessesUsed) * 20);
  return { score };
}
