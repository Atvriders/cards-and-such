import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WarObserveState, WarObserveAction, WarObserveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WarObserveGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WarObserveGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const warObservePlugin: GamePlugin<WarObserveState, WarObserveAction, typeof settings> = {
  id: "war-observe", title: "War Observation", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict which of 4 cards will win the flip.",
  howToPlay: "War Observation is the classic War card flip with an observation twist: predict which of four cards will win the comparison. Each round shows four numbered cards (values 2-14, like 2 through Ace). Tap the highest one, hit Submit, score ten points if you correctly picked the maximum. Twenty rounds total — max score 200. There is no random element to predicting beyond reading the four numbers; that is the point. War Observation strips War down to pure speed-comparison drill, useful as warm-up for any number-based card game. Even kids learning to compare two-digit numbers can play. Repeated values are deduplicated when generating candidates. Solid players hit 200 (perfect) within a few practices; rushed first-timers might miss two or three from misreading. Hit Submit to lock and Next to advance. There is no timer — accuracy is everything. Twenty rounds takes about two minutes; great between longer sessions and ideal for kids.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WarObserveSettings),
  reducer, isTerminal, hint: (state: WarObserveState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-war-observe-answer-0"]', pulses: 3 } : null, component: WarObserveGame,
};
