import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SpellingBeeState, SpellingBeeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpellingBee } from "./SpellingBee.js";

export const spellingBeeSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time limit",
    options: ["60", "180", "300"] as const,
    default: "180" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type SpellingBeeSettingsType = SettingsOf<typeof spellingBeeSettings>;

export const spellingBeePlugin: GamePlugin<SpellingBeeState, SpellingBeeAction, typeof spellingBeeSettings> = {
  id: "spelling-bee",
  title: "Spelling Bee",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Form words from 7 letters — always using the center letter. Find the pangram!",
  howToPlay: `Spelling Bee gives you a honeycomb of 7 letters — one in the center and six surrounding it. Your job is to make as many valid words as possible before time runs out.

Every word you submit must be at least 4 letters long and must contain the center letter at least once. You may use any of the 7 letters as many times as you like in a single word. Letters outside the seven are not allowed.

Scoring: words of 4 letters score 1 point. Longer words score 1 point per letter. Any word that uses all 7 letters at least once is a "pangram" and earns an extra 7 bonus points — these are the highest-value words.

To enter a word, click the letters on the honeycomb or type on your keyboard. Press Enter or the Enter button to submit. Use Delete to remove the last letter, and Clear to wipe the whole entry.

Settings control the time limit (60 s, 3 min, or 5 min) and difficulty level. Easy mode limits target words to 6 letters maximum; medium and hard include longer words.

Tips: start by finding all the short 4-letter words to build your score, then hunt for longer combinations. Common endings like -ING, -ED, -ER, and -TION pair well with many letter sets. Always look for the pangram — it alone can add a huge score boost.`,
  settings: spellingBeeSettings,
  initialState: (seed: number, settings: SpellingBeeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SpellingBeeState): HintTarget | null => {
    if (state.gameOver) return null;
    return { selector: ".sbe-input-display", pulses: 3 };
  },
  component: SpellingBee,
};
