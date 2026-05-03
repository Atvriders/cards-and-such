import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AnagramPairState, AnagramPairAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AnagramPair = /* @__PURE__ */ lazy(() => import("./AnagramPair.js").then((mod) => ({ default: mod.AnagramPair as unknown as React.ComponentType<unknown> })));
export const anagramPairSettings = {
  pairCount: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["4", "6", "8"] as const,
    default: "6" as const,
  },
} as const;

type AnagramPairSettingsType = SettingsOf<typeof anagramPairSettings>;

export const anagramPairPlugin: GamePlugin<AnagramPairState, AnagramPairAction, typeof anagramPairSettings> = {
  id: "anagram-pair",
  title: "Anagram Pair",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match words with their anagrams — pairs that share the same letters in a different order.",
  howToPlay: `Anagram Pair is a matching game where every word on the left has a partner on the right made from exactly the same letters rearranged. For example LISTEN pairs with SILENT, EARTH pairs with HEART, and TEAM pairs with MATE.

Click a word on the left to select it (highlighted purple). Then click the word on the right that uses the same letters. A correct match turns both cells green and locks them in. A wrong match flashes red and you try again. Correct matches score 10 points each.

The round ends when all pairs are found. Try to complete the board in as few attempts as possible.

Choose 4, 6, or 8 pairs in the settings.

Tips: Mentally sort the letters of each word alphabetically to compare them — anagrams sort to the same sequence. Start with shorter words where you can visually check each letter quickly. If stuck, look for pairs that share rare letters like Q, X, or Z first. Many classic anagram pairs involve common four- and five-letter words with vowel-heavy patterns.`,
  settings: anagramPairSettings,
  initialState: (seed: number, settings: AnagramPairSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ap-grid")) ? { selector: ".ap-grid", pulses: 3 } : null,
  component: AnagramPair,
};
