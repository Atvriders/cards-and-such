import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColorClashState, ColorClashAction, ColorClashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColorClashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColorClashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const colorClashPlugin: GamePlugin<ColorClashState, ColorClashAction, typeof settings> = {
  id:"color-clash", title:"Color Clash", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Predict the dominant color of a 5-card hand. Six rounds; clean sweeps pay bonuses.",
  howToPlay:`Color Clash is a six-round prediction game with cards. Each round, you predict whether a five-card hand will be dominantly RED (3+ red cards) or dominantly BLACK (3+ black cards). Since the hand is exactly 5 cards, there is always a winner — no ties.

A correct prediction scores +30 points. A correct prediction on a clean sweep — all five cards red or all five black — adds a +20 bonus, for a total of 50 points. A wrong prediction earns nothing.

Statistically, predicting red and black are equally good (each has 50% chance), so this game is essentially a coin flip with style. The fun is in the cards themselves: which queens turn up? which low cards? Watch the hand fan out and feel that little adrenaline rush as you tally the colors.

Six rounds means a maximum theoretical score of 300 points (six straight sweeps), but realistic scores are around 80-120 points. Easy, breezy fun!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColorClashSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-color-clash-primary"]', pulses: 3 }),component:ColorClashGame,
};
