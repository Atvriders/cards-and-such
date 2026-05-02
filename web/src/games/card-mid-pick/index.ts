import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardMidPickState, CardMidPickAction, CardMidPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardMidPickGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardMidPickPlugin: GamePlugin<CardMidPickState, CardMidPickAction, typeof settings> = {
  id: "card-mid-pick", title: "Card Mid Pick", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Five cards are dealt — pick the one closest to the median rank!",
  howToPlay: `Card Mid Pick challenges your sense of the middle. Five cards are dealt face-up each round. Your goal is to identify and click the card whose rank is closest to the median (middle) rank of all five.

A perfect median pick earns 30 points. Being one rank away earns 24, two away earns 18, and so on. The closer to center you land, the more you score.

This is harder than it sounds — you must quickly scan all five ranks and estimate which is most central. Over 10 or 20 rounds, consistent accuracy builds a high total score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardMidPickSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-mid-pick-primary"]', pulses: 3 }), component: CardMidPickGame,
};
