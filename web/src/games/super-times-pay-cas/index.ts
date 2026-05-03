import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SuperTimesPayCasState, SuperTimesPayCasAction, SuperTimesPayCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SuperTimesPayCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SuperTimesPayCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: SuperTimesPayCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-super-times-pay-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-super-times-pay-cas-secondary"]', pulses: 3 };
  return null;
};
export const superTimesPayCasPlugin: GamePlugin<SuperTimesPayCasState, SuperTimesPayCasAction, typeof settings> = {
  id: "super-times-pay-cas", title: "Super Times Pay", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video Poker with multiplier feature.",
  howToPlay: "Super Times Pay is a video poker variant with a random multiplier feature. After each draw the machine may award a 2x, 3x, 4x, 5x, 8x, or 10x multiplier on all winning hands for that round.\n\nIn this single-player version you play fifteen rounds. Each round press Play to deal five cards. Choose holds (auto-optimal) and draw replacements. Then a multiplier is rolled — usually 1x but with a roughly 10% chance of being higher.\n\nThe paytable is standard Jacks or Better: pair pays one, two pair two, trips three, straight four, flush six, full house nine, quads twenty-five, straight flush fifty, royal one hundred. A 10x multiplier on a four-of-a-kind is two hundred and fifty points in one round.\n\nA strong total across fifteen rounds is around three hundred. Super Times Pay was launched by IGT in 2003 and is one of the most popular video poker variants in casinos. Press Play and chase the 10x.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuperTimesPayCasSettings),
  reducer, isTerminal, hint: hint, component: SuperTimesPayCasGame,
};
