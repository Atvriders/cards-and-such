import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TaylordleSwiftState, TaylordleSwiftAction, TaylordleSwiftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TaylordleSwiftGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TaylordleSwiftGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const taylordleSwiftPlugin: GamePlugin<TaylordleSwiftState, TaylordleSwiftAction, typeof settings> = {
  id: "taylordle-swift", title: "Taylordle Swift", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Daily Taylor Swift trivia in the Wordle vein. Guess album from lyric snippet.",
  howToPlay: "Taylordle Swift channels the Taylordle daily Wordle for Swifties. Each of twelve rounds gives you a famous lyric snippet, song-title fragment, or thematic descriptor and four album choices to assign it to. Ten points per correct, max 120. The albums covered are her main-line discography from Taylor Swift's debut through Midnights (Fearless, Speak Now, Red, 1989, Reputation, Lover, Folklore, Evermore). Hardcore Swifties recognise lyric handles instantly and routinely net 110+. Casual fans hover at 50-70. The original Taylordle was a daily five-letter Wordle restricted to a Swift-themed dictionary; this multiple-choice version tests the same fan knowledge but spreads it across her catalog rather than her vocabulary. Run takes around two minutes. Submit on each guess, Next to advance, and finish to see your final tally. A great pre-concert warm-up or party trivia round for a friend group of Swift fans.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TaylordleSwiftSettings),
  reducer, isTerminal, hint: (state: TaylordleSwiftState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-taylordle-swift-answer-0"]', pulses: 3 } : null, component: TaylordleSwiftGame,
};
