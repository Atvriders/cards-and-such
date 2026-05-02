import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MissingLettersState, MissingLettersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MissingLetters } from "./MissingLetters.js";

export const missingLettersSettings = {
  blanks: {
    kind: "enum" as const,
    label: "Blanks per word",
    options: ["1", "2", "3"] as const,
    default: "2" as const,
  },
} as const;

type MissingLettersSettingsType = SettingsOf<typeof missingLettersSettings>;

export const missingLettersPlugin: GamePlugin<MissingLettersState, MissingLettersAction, typeof missingLettersSettings> = {
  id: "missing-letters",
  title: "Missing Letters",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill in the blanks to complete each word correctly.",
  howToPlay: `Missing Letters shows you a word with one or more letters hidden as blank boxes. Your job is to figure out which letters belong in those blanks and type them in.

Click any blank box to focus it, then type the letter you think belongs there. The cursor advances automatically after each entry. Press Backspace to erase and go back. Once all blanks are filled, press Submit (or Enter) to check your answer.

Correct answers earn 10 points each. After seeing the result, press Next to move on to the following word. The game runs for 10 words.

The difficulty setting controls how many letters are hidden per word: 1 blank is easy, 2 blanks is standard, and 3 blanks is challenging.

Tips: Read the visible letters carefully and think about what English words fit the pattern. Common letter combinations like TH, SH, CH, and NG often appear together. Vowels are the easiest starting point — if a blank is surrounded by consonants it is almost certainly a vowel. Short words with unusual patterns often contain X, Z, or Q, while long words with many blanks probably contain E, A, or O.`,
  settings: missingLettersSettings,
  initialState: (seed: number, settings: MissingLettersSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: MissingLettersState): HintTarget | null => {
    if (state.submitted) return null;
    return { selector: ".ml-wrap", pulses: 3 };
  },
  component: MissingLetters,
};
