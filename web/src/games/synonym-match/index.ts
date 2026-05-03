import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SynonymMatchState, SynonymMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SynonymMatch = /* @__PURE__ */ lazy(() => import("./SynonymMatch.js").then((mod) => ({ default: mod.SynonymMatch as unknown as React.ComponentType<unknown> })));
export const synonymMatchSettings = {
  pairCount: {
    kind: "enum" as const,
    label: "Pairs",
    options: ["4", "6", "8"] as const,
    default: "6" as const,
  },
} as const;

type SynonymMatchSettingsType = SettingsOf<typeof synonymMatchSettings>;

export const synonymMatchPlugin: GamePlugin<SynonymMatchState, SynonymMatchAction, typeof synonymMatchSettings> = {
  id: "synonym-match",
  title: "Synonym Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pair words with their synonyms by matching left and right columns.",
  howToPlay: `Synonym Match presents two columns: words on the left, synonyms on the right. Your goal is to connect every word with its correct synonym by clicking matching pairs.

Click a word in the left column to select it (it highlights blue). Then click the synonym in the right column that means the same thing. If the pair is correct, both cells turn green and the match is locked in. If wrong, both cells flash red briefly and you can try again — no points are lost, but your attempt count rises.

Each correct match earns 10 points. The game ends when all pairs are matched. Try to complete the board in as few attempts as possible.

Settings let you choose 4, 6, or 8 pairs per game. Fewer pairs are quicker; more pairs are more challenging.

Tips: Read all visible words before selecting to build a mental map. Look for strong, obvious pairs first — FAST / SWIFT, HAPPY / JOYFUL — then use the process of elimination for less clear pairings. Words with Latin roots often pair with other words of Latin origin. If two words seem plausible for the same synonym, check the other column for a better fit for one of them.`,
  settings: synonymMatchSettings,
  initialState: (seed: number, settings: SynonymMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".sm-grid")) ? { selector: ".sm-grid", pulses: 3 } : null,
  component: SynonymMatch,
};
