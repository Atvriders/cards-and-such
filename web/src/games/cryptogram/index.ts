import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CryptogramState, CryptogramAction, CryptogramSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Cryptogram } from "./Game.js";

export const cryptogramSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

export const cryptogramPlugin: GamePlugin<CryptogramState, CryptogramAction, typeof cryptogramSettings> = {
  id: "cryptogram",
  title: "Cryptogram",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decode a famous quote encrypted with a single-letter substitution cipher.",
  howToPlay: `A Cryptogram is a word puzzle in which a famous quote has been encrypted using a simple substitution cipher: every letter in the original text has been replaced by a different letter. The same letter always maps to the same substitute throughout the puzzle, so once you figure out one mapping, it helps you decode other words.

The puzzle displays the encrypted text. Below each cipher letter is its ciphertext character in small grey text. Your guesses appear above in the plain text row. Correctly pre-revealed letters (from difficulty settings) are shown in green.

To play: click any cipher letter in the text to select it — it turns red. Then click a letter on the alphabet keyboard to assign your guess. Click Clear to erase a guess. You can update a guess at any time by re-selecting the cipher letter and clicking a new plain letter.

Hints: pressing the Hint button reveals one additional correct letter mapping, but costs 100 points. Use hints sparingly.

Difficulty: Easy pre-reveals 3 letters for you; Medium pre-reveals 1; Hard reveals none.

Scoring: score = max(100, 1000 − guesses × 20 − hintsUsed × 100). Solving with fewer guesses and no hints earns the highest score.

Tips: look for single-letter words (must be A or I), common short words, and repeated letter patterns. Apostrophes and punctuation are not encrypted.`,
  settings: cryptogramSettings,
  initialState: (seed: number, s: CryptogramSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: CryptogramState): HintTarget | null => {
    if (state.won) return null;
    return { selector: ".crg-text", pulses: 3 };
  },
  component: Cryptogram,
};
