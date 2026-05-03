import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpitSpeedState, SpitSpeedAction, SpitSpeedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpitSpeedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpitSpeedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const spitSpeedPlugin: GamePlugin<SpitSpeedState, SpitSpeedAction, typeof settings> = {
  id: "spit-speed", title: "Spit Speed", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the card playable next on the spit pile.",
  howToPlay: "Spit Speed adapts the two-player dump-race card game's core rule. Each of twenty rounds shows you a top-of-pile card (rank 2-13) and asks which of four candidate cards is playable next — playable cards are exactly one rank above OR below the top. Pick the legal play, hit Submit, score ten points. Max 200 points across twenty rounds. Three distractor cards are rank-distant from the top so there is always exactly one playable card. The original Spit has two players simultaneously playing onto two central piles whichever card matches one-off; first to empty wins. This digital version tests the rapid one-off-rank recognition — the cognitive backbone of fast Spit play. Solid players score 180+; sharp ones perfect 200 in under two minutes. Hit Submit and Next. Total run takes about a minute and a half. A perfect score certifies you ready for live Spit's chaos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpitSpeedSettings),
  reducer, isTerminal, hint: (state: SpitSpeedState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-spit-speed-answer-0"]', pulses: 3 } : null, component: SpitSpeedGame,
};
