import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTargetSumState, CardTargetSumAction, CardTargetSumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTargetSumGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTargetSumPlugin: GamePlugin<CardTargetSumState, CardTargetSumAction, typeof settings> = {
  id:"card-target-sum", title:"Card Target Sum", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pick 3 cards from a pool of 6 to get as close to the target sum as possible. 10 rounds.",
  howToPlay:`Card Target Sum is a quick mental-arithmetic card puzzle. Each round, you receive a target number between 12 and 26, and a pool of six random cards. Your task: pick exactly three cards whose pip values sum as close to the target as possible.

Card pip values: 2-10 are face value, J=11, Q=12, K=13, A=1.

Tap a card to select or deselect it. Once you have exactly three selected, press Submit. Points awarded equal max(0, 30 - 5*|diff|), so an exact match gives 30 points, off by 1 gives 25, off by 2 gives 20, and so on. Off by 6 or more gives nothing.

There are ten rounds. Top scoring runs over 200 points show genuine arithmetic chops; even hitting target dead-on twice is impressive given the random draws. Stay sharp and weigh combinations carefully — there are 20 different ways to pick 3 from 6.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTargetSumSettings),
  reducer,isTerminal, hint: (state: CardTargetSumState): HintTarget | null => (state.phase === "play" ? { selector: '[data-testid="hint-target-card-target-sum-primary"]', pulses: 3 } : null),component:CardTargetSumGame,
};
