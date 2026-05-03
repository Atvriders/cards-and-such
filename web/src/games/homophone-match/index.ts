import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HomophoneMatchState, HomophoneMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HomophoneMatch } from "./HomophoneMatch.js";

export const homophoneMatchSettings = {
  pairCount: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["4", "6", "8"] as const,
    default: "6" as const,
  },
} as const;

type HomophoneMatchSettingsType = SettingsOf<typeof homophoneMatchSettings>;

export const homophoneMatchPlugin: GamePlugin<HomophoneMatchState, HomophoneMatchAction, typeof homophoneMatchSettings> = {
  id: "homophone-match",
  title: "Homophone Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect words with their homophones — words that sound alike but are spelled differently.",
  howToPlay: `Homophone Match challenges you to connect words in the left column with their homophones in the right column. Homophones are words that sound identical when spoken but have different spellings and meanings — such as KNIGHT and NIGHT, or FLOUR and FLOWER.

Click a word on the left to select it (highlighted purple), then click the word on the right that sounds the same. A correct match turns both cells green and locks them in. A wrong match flashes red briefly and you try again.

Each correct match scores 10 points. The round ends when all pairs are found. Aim for the fewest attempts possible.

Use the settings to play with 4, 6, or 8 pairs per game.

Tips: Say both words aloud silently in your head — if they sound identical they are likely homophones. Watch for silent letters (KNIGHT / NIGHT) and alternate vowel patterns (SEA / SEE). Eliminate easy pairs first to narrow down the trickier ones. Common homophone traps: THEIR / THERE, TO / TWO, WRITE / RIGHT, PEACE / PIECE.`,
  settings: homophoneMatchSettings,
  initialState: (seed: number, settings: HomophoneMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".hm-grid")) ? { selector: ".hm-grid", pulses: 3 } : null,
  component: HomophoneMatch,
};
