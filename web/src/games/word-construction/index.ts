import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { WordConstructionState, WordConstructionAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordConstruction } from "./WordConstruction.js";

export const wordConstructionSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time limit",
    options: ["60", "90"] as const,
    default: "60" as const,
  },
} as const;

type WordConstructionSettingsType = SettingsOf<typeof wordConstructionSettings>;

export const wordConstructionPlugin: GamePlugin<WordConstructionState, WordConstructionAction, typeof wordConstructionSettings> = {
  id: "word-construction",
  title: "Word Construction",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race to build words using given prefixes — UN-, RE-, PRE-, OUT- and more!",
  howToPlay: `Word Construction challenges you to think in prefixes. Each round you are given four word prefixes — such as UN-, RE-, PRE-, OUT-, OVER-, MIS-, DIS-, or IN-. Your job is to type as many valid words as possible that start with each prefix, within the time limit.

At the top of the screen you will see four prefix buttons. Click a prefix button (or press its first letter) to make it active — the selected prefix appears highlighted. Type the rest of the word after the prefix using your keyboard. Press Enter to submit the word.

A word scores only if it starts with the active prefix and appears in the word list. Each accepted word earns 5 points per letter. You can freely switch between prefixes at any time — try to exploit whichever prefix you know the most words for.

Words already found are shown below each prefix label. You cannot score the same word twice.

Settings let you choose a 60-second or 90-second round. Experienced players can find 15+ words in 60 seconds.

Tips: start with the prefix you know the most words for and build momentum. Common patterns: UN- pairs well with adjectives (UNABLE, UNKIND, UNFIT) and past-tense verbs (UNDO, UNDID, UNDONE). RE- combines with almost any action verb (RESET, RECALL, REVIEW). PRE- and OUT- both have shorter pools, so exploit them quickly with short words before moving on.`,
  settings: wordConstructionSettings,
  initialState: (seed: number, settings: WordConstructionSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WordConstructionState): HintTarget | null => {
    if (state.gameOver) return null;
    return { selector: ".wcon-input-area", pulses: 3 };
  },
  component: WordConstruction,
};
