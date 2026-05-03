import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniPokerState, MiniPokerAction, MiniPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniPokerGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniPokerGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniPokerPlugin: GamePlugin<MiniPokerState, MiniPokerAction, typeof settings> = {
  id:"mini-poker", title:"Mini Poker", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Deal five random cards, get scored on the resulting poker hand. 8 rounds.",
  howToPlay:`Mini Poker is a quick five-card poker rating game. Each round, press Deal to receive five random cards from a fresh 52-card deck. The hand is automatically rated against standard poker rankings, and you score points based on what you got.

Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.

There are eight rounds total, each independent of the others. Average expected scores hover around 50-80 points across all eight rounds — a single Full House or better can blow past that. The luck of the draw rules — there's no swapping or holding cards, just pure poker odds laid bare.

Watch for those rare Straight Flushes worth a massive 200 points each. Press Next after each scored round, and chase that high score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniPokerSettings),
  reducer,isTerminal,hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-mini-poker-primary"]', pulses: 3 }), component:MiniPokerGame,
};
