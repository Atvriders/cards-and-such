import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRailroadState, DiceRailroadAction, DiceRailroadSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceRailroadGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceRailroadGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceRailroadPlugin: GamePlugin<DiceRailroadState, DiceRailroadAction, typeof settings> = {
  id:"dice-railroad", title:"Dice Railroad", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Lay railroad with dice. Doubles score double points. 10 rounds.",
  howToPlay:"Dice Railroad is a 10-round dice mini with a double-payoff twist. Each round, you roll two dice. If the dice match (doubles: 1-1, 2-2, 3-3, 4-4, 5-5, 6-6), you've successfully laid a long stretch of track and score 10 points. Non-matching rolls don't extend the railroad and earn nothing.\n\nThe probability of doubles is 6/36, exactly 1/6 (16.7%). Across 10 rounds, expected scores are around 17 points; lucky players can string 3+ doubles together for 30-40.\n\nThe mini is pure luck — just press Roll and watch the dice. The 'railroad' theme is decorative; track-laying is just doubles-detection in disguise. The low win rate makes each double feel rewarding, and three doubles in a single game is genuine cause for celebration. Build that transcontinental railroad, one matched pair at a time!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceRailroadSettings),
  reducer,isTerminal,
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-railroad-roll"]', pulses: 3 }; },
  component:DiceRailroadGame,
};
