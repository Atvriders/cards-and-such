import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { scoreWord, isValidWord, LETTER_VALUES } from "./words.js";

export interface WordPokerSettings {
  rounds: "3" | "5" | "7";
}

export type LetterCard = {
  id: number;
  letter: string;
  value: number;
};

export interface WordPokerState {
  settings: WordPokerSettings;
  hand: LetterCard[];          // 7 cards in hand
  selectedIds: number[];       // card IDs selected for current word
  currentWord: string;
  submittedWord: string | null;
  playerScore: number;         // word score for current round
  botScore: number;            // bot's word score for current round
  playerWonRound: boolean | null;
  playerTotalWins: number;
  botTotalWins: number;
  round: number;
  maxRounds: number;
  roundOver: boolean;
  gameOver: boolean;
  error: string | null;
  botWord: string | null;
}

export type WordPokerAction =
  | { type: "toggleCard"; id: number }
  | { type: "clearSelection" }
  | { type: "submit" }
  | { type: "nextRound" };

const ALL_LETTERS = "AAAAAAAAABBCCCDDDDEEEEEEEEEEFFFGGGHHHHIIIIIIIIJKLLLLMMMMNNNNNNOOOOOOOPPPQRRRRRRSSSSTTTTTTTUUUUVVWWXXYYZ";

function dealHand(rng: () => number): LetterCard[] {
  const pool = ALL_LETTERS.split("");
  const hand: LetterCard[] = [];
  for (let i = 0; i < 7; i++) {
    const idx = Math.floor(rng() * pool.length);
    const letter = pool[idx]!;
    pool.splice(idx, 1);
    hand.push({ id: i, letter, value: LETTER_VALUES[letter] ?? 1 });
  }
  return hand;
}

/** Bot picks the highest-scoring valid word from the hand letters */
export function botBestWord(hand: LetterCard[]): { word: string; score: number } {
  const letters = hand.map(c => c.letter);
  let bestWord = "";
  let bestScore = 0;

  // Try all subsets of 3+ letters
  const n = letters.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const bits = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) bits.push(i);
    }
    if (bits.length < 3) continue;

    // Generate permutations of selected letters (only up to 6 letters for performance)
    if (bits.length > 6) continue;

    const selected = bits.map(i => letters[i]!);
    // Generate all permutations
    const perms = permutations(selected);
    for (const perm of perms) {
      const word = perm.join("");
      if (isValidWord(word)) {
        const s = scoreWord(word);
        if (s > bestScore) {
          bestScore = s;
          bestWord = word;
        }
      }
    }
  }

  return { word: bestWord, score: bestScore };
}

function permutations(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr];
  const result: string[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) {
      result.push([arr[i]!, ...p]);
    }
  }
  return result;
}

export function initialState(seed: number, settings: WordPokerSettings): WordPokerState {
  const rng = mulberry32(seed);
  const maxRounds = parseInt(settings.rounds, 10);
  const hand = dealHand(rng);

  return {
    settings,
    hand,
    selectedIds: [],
    currentWord: "",
    submittedWord: null,
    playerScore: 0,
    botScore: 0,
    playerWonRound: null,
    playerTotalWins: 0,
    botTotalWins: 0,
    round: 1,
    maxRounds,
    roundOver: false,
    gameOver: false,
    error: null,
    botWord: null,
  };
}

export function reducer(state: WordPokerState, action: WordPokerAction): WordPokerState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "toggleCard": {
      if (state.roundOver) return state;
      const { id } = action;
      const sel = state.selectedIds;
      if (sel.includes(id)) {
        const newSel = sel.filter(x => x !== id);
        const word = newSel.map(sid => state.hand.find(c => c.id === sid)!.letter).join("");
        return { ...state, selectedIds: newSel, currentWord: word, error: null };
      } else {
        const newSel = [...sel, id];
        const word = newSel.map(sid => state.hand.find(c => c.id === sid)!.letter).join("");
        return { ...state, selectedIds: newSel, currentWord: word, error: null };
      }
    }

    case "clearSelection":
      return { ...state, selectedIds: [], currentWord: "", error: null };

    case "submit": {
      if (state.roundOver) return state;
      const { currentWord, hand, selectedIds } = state;

      if (currentWord.length < 3) {
        return { ...state, error: "Word must be at least 3 letters" };
      }

      // Verify all selected letters exist in hand
      const usedIds = new Set(selectedIds);
      const usedLetters = hand.filter(c => usedIds.has(c.id)).map(c => c.letter);
      if (usedLetters.length !== selectedIds.length) {
        return { ...state, error: "Invalid selection" };
      }

      if (!isValidWord(currentWord)) {
        return { ...state, error: `"${currentWord}" is not a valid word` };
      }

      const playerScore = scoreWord(currentWord);
      const { word: botWord, score: botScore } = botBestWord(hand);
      const playerWonRound = playerScore >= botScore;

      return {
        ...state,
        submittedWord: currentWord,
        playerScore,
        botScore,
        botWord,
        playerWonRound,
        playerTotalWins: playerWonRound ? state.playerTotalWins + 1 : state.playerTotalWins,
        botTotalWins: !playerWonRound ? state.botTotalWins + 1 : state.botTotalWins,
        roundOver: true,
        error: null,
      };
    }

    case "nextRound": {
      if (!state.roundOver) return state;
      const isLast = state.round >= state.maxRounds;
      if (isLast) {
        return { ...state, gameOver: true };
      }

      // Deal new hand using round as secondary seed component
      const rng = mulberry32(state.round * 77777 + state.round);
      const hand = dealHand(rng);

      return {
        ...state,
        hand,
        selectedIds: [],
        currentWord: "",
        submittedWord: null,
        playerScore: 0,
        botScore: 0,
        playerWonRound: null,
        botWord: null,
        roundOver: false,
        round: state.round + 1,
        error: null,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WordPokerState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score: 200 per round win
  return { score: state.playerTotalWins * 200 };
}
