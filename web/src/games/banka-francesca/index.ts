import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BankaFrancescaState, BankaFrancescaAction, BankaFrancescaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BankaFrancescaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BankaFrancescaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const bankaFrancescaPlugin: GamePlugin<BankaFrancescaState, BankaFrancescaAction, typeof settings> = {
  id: "banka-francesca",
  title: "Banka Francesca",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Portuguese three-dice casino game. Predict Big, Small, or Aces.",
  howToPlay: "Banka Francesca is a Portuguese casino game played with three dice. There are exactly three call types: Big (total 14-16, no triples), Small (total 5-7, no triples), or Aces (total 3, that is three 1s).\n\nIn this single-player version you call one of the three before each roll. The standard payout is even-money for Big and Small, with Aces returning a heavy 60-to-1. Here we use 20 points for Big or Small calls that hit, and 200 points for Aces that hit. Most rolls fall outside all three bands — if no call wins on a roll, you score zero for that round.\n\nThe game runs 12 rounds. The probability of Big is 7/216 (3.2%), Small is 7/216 (3.2%), and Aces is 1/216 (0.5%). Average expected score is around 30 points; a single Aces hit lifts you above 200. Banka Francesca is an aggressive game — patience and discipline outscore enthusiasm in the long run.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BankaFrancescaSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-banka-francesca-primary"]', pulses: 3 }),
  component: BankaFrancescaGame,
};
