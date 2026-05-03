import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TaylordleTsState, TaylordleTsAction, TaylordleTsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TaylordleTsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TaylordleTsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const taylordleTsPlugin: GamePlugin<TaylordleTsState, TaylordleTsAction, typeof settings> = {
  id: "taylordle-ts", title: "Taylordle Lyrics", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match Taylor Swift songs to album.",
  howToPlay: "Taylordle Lyrics tests Taylor Swift catalog knowledge. Each of fifteen rounds names a song title and asks which album it appears on. Pick from four candidate albums, hit Submit, score ten points. Max 150 points. The song pool covers Shake It Off (1989), Cardigan (Folklore), Anti-Hero (Midnights), You Belong With Me (Fearless), Blank Space (1989), Bad Blood (1989), Look What You Made Me Do (Reputation), Willow (Evermore), Lavender Haze (Midnights), Love Story (Fearless), All Too Well (Red), The 1 (Folklore), Champagne Problems (Evermore), and Karma (Midnights). Swifties score 130+; casual fans 70-100. The original online Taylordle uses lyric-album guessing; this version tests song-album pairing directly. Distractor albums come from the same set. Hit Submit and Next to advance. Total run is about a minute and a half. A perfect score is full Swift fluency.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TaylordleTsSettings),
  reducer, isTerminal, hint: (state: TaylordleTsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-taylordle-ts-answer-0"]', pulses: 3 } : null, component: TaylordleTsGame,
};
