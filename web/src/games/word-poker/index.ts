import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordPokerState, WordPokerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WordPoker } from "./WordPoker.js";

export const wordPokerSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type WordPokerSettingsType = SettingsOf<typeof wordPokerSettings>;

export const wordPokerPlugin: GamePlugin<WordPokerState, WordPokerAction, typeof wordPokerSettings> = {
  id: "word-poker",
  title: "Word Poker",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Form the highest-scoring word from your hand of 7 letter cards and outscore the bot.",
  howToPlay: `Word Poker deals you a hand of 7 letter cards. Your goal is to select letters from your hand and arrange them into the highest-scoring English word you can find — then beat the bot's best word.

Each letter has a point value shown on the card: vowels (A, E, I, O, U) are worth 2 points each. Common consonants like S, T, N, R, D are worth 3 points. Less common consonants score higher — J, Q, X, Z are each worth 10 points. Your word's score is the sum of all letter values used.

Click letter cards to select them in order — the selected letters form your word. You can toggle a card off by clicking it again. Once satisfied, click Submit. Your word must be at least 3 letters long and must be a valid English word.

After you submit, the bot reveals the highest-scoring word it could have made from the same hand. Whoever scores higher wins the round. Ties go to the player.

Play 3, 5, or 7 rounds. Your final score is 200 × number of rounds you won.

Tips: high-value letters like J, Q, X, Z appear rarely — treasure them. Longer words score more simply because they use more tiles. Short words with rare letters can still outshine long vowel-heavy ones. Scan for -tion, -ing, -ness endings to stretch your letters into longer words.`,
  settings: wordPokerSettings,
  initialState: (seed: number, settings: WordPokerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WordPokerState): HintTarget | null => {
    if (state.gameOver) return null;
    return { selector: ".wp-hand", pulses: 3 };
  },
  component: WordPoker,
};
