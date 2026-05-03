import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WordAssocState, WordAssocAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WordAssociation = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WordAssociation as unknown as React.ComponentType<unknown> })));
export const wordAssocSettings = {
  duration: {
    kind: "enum" as const,
    label: "Time Limit",
    options: ["60", "120"] as const,
    default: "60" as const,
  },
} as const;

type WordAssocSettingsType = SettingsOf<typeof wordAssocSettings>;

export const wordAssociationPlugin: GamePlugin<WordAssocState, WordAssocAction, typeof wordAssocSettings> = {
  id: "word-association",
  title: "Word Association Chain",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build the longest word association chain before time runs out!",
  howToPlay: `Word Association Chain is a timed game where you build the longest possible chain of connected words before the clock runs out.

The game starts with a random seed word shown in purple. Your job is to type a word that you naturally associate with the last word in the chain, then press Enter or click Add. If the word is accepted, it joins the chain and becomes the new prompt.

Words must be at least 2 letters long and must come from the game's dictionary of common English words. You cannot reuse a word that has already appeared in the chain. There is no strict rule about what makes a valid association — any word you relate to the current last word is fine as long as it passes the dictionary check.

Examples: "ocean" → "wave" → "surf" → "board" → "game" → "play" → "music" → …

Your score equals the number of words you added (the starter does not count). Think fast but also think strategically — shorter, more common words are easier to validate. Aim for chains of 20 or more words.

Choose 60 or 120 seconds in settings. The starter word is randomized each game.`,
  settings: wordAssocSettings,
  initialState: (seed: number, settings: WordAssocSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: WordAssocState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: ".wordassoc-input", pulses: 3 };
  },
  component: WordAssociation,
};
