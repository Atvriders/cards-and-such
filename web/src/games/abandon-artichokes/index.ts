import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbandonArtichokesState, AbandonArtichokesAction, AbandonArtichokesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AbandonArtichokesGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AbandonArtichokesGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const abandonArtichokesPlugin: GamePlugin<AbandonArtichokesState, AbandonArtichokesAction, typeof settings> = {
  id: "abandon-artichokes", title: "Abandon All Artichokes", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the hand with fewest artichokes.",
  howToPlay: "Abandon All Artichokes adapts the deck-purging vegetable card game. Each of fifteen rounds shows four candidate hands with varying artichoke counts; pick the hand with fewest artichokes, hit Submit, score ten points. Max 150 points across all fifteen rounds. Artichoke counts run 0 through 7 per hand, randomized. The original Abandon All Artichokes is about strategically purging artichokes from your deck to win — this digital adaptation tests the core scoring perception of 'which hand has fewest'. Fast comparators score perfect 150 in about a minute. Hit Submit and Next to advance. Total run takes around a minute and a half. Abandon All Artichokes works as an arithmetic-minimum-finding drill or as a thematic warm-up before playing the physical game. Distractors are pre-generated to all differ, so there is always a single correct fewest answer.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbandonArtichokesSettings),
  reducer, isTerminal, hint: (state: AbandonArtichokesState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-abandon-artichokes-answer-0"]', pulses: 3 } : null, component: AbandonArtichokesGame,
};
